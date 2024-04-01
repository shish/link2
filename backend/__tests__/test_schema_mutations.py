# mypy: disable-error-code="index"

from sqlalchemy import select
from sqlalchemy.orm import Session
import pytest
from .. import models as m
from .conftest import Query, Login, Logout


@pytest.mark.asyncio
async def test_createUser(db: Session, query: Query, subtests):
    CREATE_USER = """
        mutation m($username: String!, $password1: String!, $password2: String!, $email: String!) {
            createUser(
                username: $username
                password1: $password1
                password2: $password2
                email: $email
            ) {
                username
            }
        }
    """

    with subtests.test("new"):
        result = await query(
            CREATE_USER,
            username="TestUser",
            password1="TestPass",
            password2="TestPass",
            email="",
        )
        assert result.data["createUser"]["username"] == "TestUser"

        # check the user was created
        user = db.execute(
            select(m.User).where(
                m.User.username == result.data["createUser"]["username"]
            )
        ).scalar_one()
        assert user.username == "TestUser"
        assert user.check_password("TestPass")

        # check that we were logged in automatically
        result = await query("query q { user { username } }")
        assert result.data["user"]["username"] == "TestUser"

    with subtests.test("clash"):
        result = await query(
            CREATE_USER,
            username="Alice",
            password1="TestPass",
            password2="TestPass",
            email="",
            error="A user with that name already exists",
        )
        assert result.data["createUser"] is None

    with subtests.test("login"):
        result = await query(
            CREATE_USER,
            username="Alice",
            password1="alicepass",
            password2="alicepass",
            email="",
        )
        assert result.data["createUser"]["username"] == "Alice"

        result = await query("query q { user { username } }")
        assert result.data["user"]["username"] == "Alice"

    with subtests.test("badname - none"):
        result = await query(
            CREATE_USER,
            username="",
            password1="TestPass",
            password2="TestPass",
            email="",
            error="Username is required",
        )
        assert result.data["createUser"] is None

    with subtests.test("badname - long"):
        result = await query(
            CREATE_USER,
            username="12345678901234567890123456789012345678901234567890",
            password1="TestPass",
            password2="TestPass",
            email="",
            error="Username needs to be less than 32 characters",
        )
        assert result.data["createUser"] is None

    with subtests.test("badname - punctuation"):
        result = await query(
            CREATE_USER,
            username="big waffle!",
            password1="TestPass",
            password2="TestPass",
            email="",
            error="Username can only contain letters, numbers, and underscores",
        )
        assert result.data["createUser"] is None

    with subtests.test("badpass"):
        result = await query(
            CREATE_USER,
            username="TestUser2",
            password1="TestPass",
            password2="TestPass2",
            email="",
            error="Bad password",
        )
        assert result.data["createUser"] is None


@pytest.mark.asyncio
async def test_login(query):
    result = await query(
        'mutation m { login(username: "Alice", password: "badpass") { username } }',
        error="User not found",
    )
    assert result.data["login"] is None


@pytest.mark.asyncio
async def test_login_logout(query: Query, login: Login, logout: Logout):
    # anonymous
    result = await query("query q { user { username } }")
    assert result.data["user"] is None

    # log in
    await login("Alice")

    # logged in
    result = await query("query q { user { username } }")
    assert result.data["user"] == {"username": "Alice"}

    # log out
    await logout()

    # anonymous
    result = await query("query q { user { username } }")
    assert result.data["user"] is None


UPDATE_USER = """
    mutation m(
        $password: String!,
        $username: String!,
        $password1: String!,
        $password2: String!,
        $email: String!
    ) {
        updateUser(
            password: $password,
            username: $username,
            password1: $password1,
            password2: $password2,
            email: $email
        ) {
            username
        }
    }
"""


@pytest.mark.asyncio
async def test_updateUser_anon(query: Query):
    result = await query(
        UPDATE_USER,
        password="",
        username="",
        password1="",
        password2="",
        email="",
        error="Anonymous users can't save settings",
    )
    assert result.data is None


@pytest.mark.asyncio
async def test_updateUser_badpass(query: Query, login: Login):
    await login("Alice")
    result = await query(
        UPDATE_USER,
        password="asdfasd",
        username="",
        password1="",
        password2="",
        email="",
        error="Current password incorrect",
    )
    assert result.data is None


@pytest.mark.asyncio
async def test_updateUser_conflict_username(query: Query, login: Login):
    await login("Alice")
    result = await query(
        UPDATE_USER,
        password="alicepass",
        username="BoB",
        password1="",
        password2="",
        email="",
        error="Another user with that name already exists",
    )
    assert result.data is None


@pytest.mark.asyncio
async def test_updateUser_valid(query: Query, login: Login):
    await login("Alice")
    result = await query(
        UPDATE_USER,
        password="alicepass",
        username="Alice2",
        password1="pass2",
        password2="pass2",
        email="foobar@example.com",
    )
    assert result.data["updateUser"]["username"] == "Alice2"


@pytest.mark.asyncio
async def test_createSurvey(db: Session, query: Query, login: Login, subtests):
    CREATE_SURVEY = """
        mutation m {
            createSurvey(
                survey: {
                    name: "TestName"
                    description: "TestDesc"
                    longDescription: "TestLongDesc"
                }
            ) {
                id
            }
        }
    """

    with subtests.test("anon"):
        # anon can't create a survey
        result = await query(
            CREATE_SURVEY, error="Anonymous users can't create surveys"
        )
        assert result.data is None

    with subtests.test("user"):
        # log in
        await login()

        # logged in can create a survey
        result = await query(CREATE_SURVEY)
        assert result.data["createSurvey"]["id"] is not None

        # check the survey was created
        survey = db.execute(
            select(m.Survey).where(m.Survey.id == result.data["createSurvey"]["id"])
        ).scalar_one()
        assert survey.name == "TestName"
        assert survey.description == "TestDesc"
        assert survey.long_description == "TestLongDesc"
        assert survey.owner.username == "Alice"


@pytest.mark.asyncio
async def test_addQuestion(db: Session, query: Query, login: Login, subtests):
    with subtests.test("anon"):
        # anon can't create a question
        result = await query(
            'mutation m { addQuestion(surveyId: 1, question: { text: "Test" }) { id } }',
            error="Anonymous users can't add questions",
        )
        assert result.data is None

    with subtests.test("bad survey"):
        # log in
        await login()

        # bad survey
        result = await query(
            'mutation m { addQuestion(surveyId: 999, question: { text: "Test" }) { id } }',
            error="Survey not found",
        )
        assert result.data is None

    with subtests.test("user"):
        # log in
        await login()

        # add a question
        result = await query(
            'mutation m { addQuestion(surveyId: 1, question: { text: "Test" }) { id } }'
        )
        assert result.data["addQuestion"]["id"] is not None

        # check the question was created
        survey = await query("query q { survey(surveyId: 1) { questions { text } } }")
        assert survey.data["survey"]["questions"][-1]["text"] == "Test"


@pytest.mark.asyncio
async def test_updateQuestion(db: Session, query: Query, login: Login, subtests):
    with subtests.test("anon"):
        # anon can't update a question
        result = await query(
            'mutation m { updateQuestion(questionId: 1, question: { text: "Test" }) { id } }',
            error="Anonymous users can't update questions",
        )
        assert result.data is None

    with subtests.test("bad question"):
        # log in
        await login()

        # bad question
        result = await query(
            'mutation m { updateQuestion(questionId: 999, question: { text: "Test" }) { id } }',
            error="Question not found",
        )
        assert result.data is None

    with subtests.test("baduser"):
        # log in
        await login("Frank")

        # update a question
        result = await query(
            'mutation m { updateQuestion(questionId: 1, question: { text: "New Text 2" }) { id } }',
            error="You can't edit other people's surveys",
        )
        assert result.data is None

        # check the question was not updated
        question = db.execute(select(m.Question).where(m.Question.id == 1)).scalar_one()
        assert question.text == "Human (I am the owner)"
        assert question.survey.name == "Pets"

    with subtests.test("user"):
        # log in
        await login()

        # update a question
        result = await query(
            'mutation m { updateQuestion(questionId: 1, question: { text: "New Text" }) { id } }'
        )
        assert result.data["updateQuestion"]["id"] is not None

        # check the question was updated
        question = db.execute(
            select(m.Question).where(
                m.Question.id == result.data["updateQuestion"]["id"]
            )
        ).scalar_one()
        assert question.text == "New Text"
        assert question.survey.name == "Pets"


SAVE_RESPONSE = """
    mutation m {
        saveResponse(surveyId: 1, response: { privacy: PUBLIC }) {
            id
        }
    }
"""


@pytest.mark.asyncio
async def test_saveResponse_anon(db: Session, query: Query, login: Login, subtests):
    # anon can't create a response
    result = await query(SAVE_RESPONSE, error="Anonymous users can't save responses")
    assert result.data is None


@pytest.mark.asyncio
async def test_saveResponse_bad_survey(
    db: Session, query: Query, login: Login, subtests
):
    await login("Alice")
    # anon can't create a response
    result = await query(
        "mutation m { saveResponse(surveyId: 999, response: { privacy: PUBLIC }) { id } }",
        error="Survey not found",
    )
    assert result.data is None


@pytest.mark.asyncio
async def test_saveResponse_update(db: Session, query: Query, login: Login, subtests):
    # check that alice already has a response for survey 1
    alice = db.execute(select(m.User).where(m.User.username == "Alice")).scalar_one()
    response = db.execute(
        select(m.Response).where(m.Response.owner == alice)
    ).scalar_one()

    # log in as alice
    await login("Alice")

    # Alice already has a response
    result = await query(SAVE_RESPONSE)
    assert result.data["saveResponse"]["id"] == response.id

    # check the response was saved
    response = db.execute(
        select(m.Response).where(m.Response.id == result.data["saveResponse"]["id"])
    ).scalar_one()
    assert response.survey.name == "Pets"
    assert response.owner.username == "Alice"
    assert response.privacy == m.Privacy.PUBLIC


@pytest.mark.asyncio
async def test_saveResponse_create(db: Session, query: Query, login: Login, subtests):
    # check that frank has no response for survey 1
    frank = db.execute(select(m.User).where(m.User.username == "Frank")).scalar_one()
    response = (
        db.execute(select(m.Response).where(m.Response.owner == frank))
        .scalars()
        .first()
    )
    assert response is None

    # log in as frank
    await login("Frank")

    # Create a new response
    result = await query(SAVE_RESPONSE)
    assert result.data["saveResponse"]["id"] is not None

    # check the response was saved
    response = db.execute(
        select(m.Response).where(m.Response.id == result.data["saveResponse"]["id"])
    ).scalar_one()
    assert response.survey.name == "Pets"
    assert response.owner.username == "Frank"
    assert response.privacy == m.Privacy.PUBLIC


@pytest.mark.asyncio
async def test_saveAnswer_anon(db: Session, query: Query, login: Login, subtests):
    # anon can't create a response
    result = await query(
        "mutation m { saveAnswer(questionId: 1, answer: { value: WILL }) { id } }",
        error="Anonymous users can't save answers",
    )
    assert result.data is None


@pytest.mark.asyncio
async def test_saveAnswer_bad_question(
    db: Session, query: Query, login: Login, subtests
):
    await login("Alice")
    result = await query(
        "mutation m { saveAnswer(questionId: 999, answer: { value: WILL }) { id } }",
        error="Question not found",
    )
    assert result.data is None


@pytest.mark.asyncio
async def test_saveAnswer_create(db: Session, query: Query, login: Login, subtests):
    # check that frank has no response for survey 1
    frank = db.execute(select(m.User).where(m.User.username == "Frank")).scalar_one()
    response = (
        db.execute(select(m.Response).where(m.Response.owner == frank))
        .scalars()
        .first()
    )
    assert response is None

    # log in as frank
    await login("Frank")

    # Create a new response and save an answer
    result = await query(
        "mutation m { saveResponse(surveyId: 1, response: { privacy: FRIENDS }) { id } }"
    )
    assert result.data["saveResponse"]["id"] is not None
    response_id = result.data["saveResponse"]["id"]
    result = await query(
        "mutation m { saveAnswer(questionId: 1, answer: { value: WILL, flip: WONT }) { id } }"
    )
    assert result.data["saveAnswer"]["id"] is not None

    # check the answer was saved
    answer = db.execute(
        select(m.Answer)
        .where(m.Answer.response_id == response_id)
        .where(m.Answer.question_id == 1)
    ).scalar_one()
    assert answer.value == m.WWW.WILL
    assert answer.flip == m.WWW.WONT


@pytest.mark.asyncio
async def test_saveAnswer_update(db: Session, query: Query, login: Login, subtests):
    # check that alice already has a response for survey 1
    alice = db.execute(select(m.User).where(m.User.username == "Alice")).scalar_one()
    response = db.execute(
        select(m.Response).where(m.Response.owner == alice)
    ).scalar_one()

    # log in as alice
    await login("Alice")

    # Alice already has a response
    result = await query(
        "mutation m { saveAnswer(questionId: 1, answer: { value: WILL }) { id } }"
    )
    assert result.data["saveAnswer"]["id"] == 1

    # check the answer was saved
    answer = db.execute(
        select(m.Answer)
        .where(m.Answer.response_id == response.id)
        .where(m.Answer.question_id == 1)
    ).scalar_one()
    assert answer.value == m.WWW.WILL


@pytest.mark.asyncio
async def test_addFriend_anon(query: Query):
    # anon can't add a friend
    result = await query(
        'mutation m { addFriend(username: "Frank") }',
        error="Anonymous users can't add friends",
    )
    assert result.data["addFriend"] is None


@pytest.mark.asyncio
async def test_addFriend_self(query: Query, login: Login):
    # log in as alice and add herself as a friend
    await login("Alice")
    result = await query(
        'mutation m { addFriend(username: "Alice") }',
        error="You can't add yourself",
    )
    assert result.data["addFriend"] is None


@pytest.mark.asyncio
async def test_addFriend_dupe(query: Query, login: Login):
    # log in as alice and add frank as a friend
    await login("Alice")
    result = await query('mutation m { addFriend(username: "Frank") }')
    assert result.data["addFriend"] is None

    # try to add frank again
    result = await query(
        'mutation m { addFriend(username: "Frank") }',
        error="Friend request already sent",
    )
    assert result.data["addFriend"] is None


@pytest.mark.asyncio
async def test_addFriend_notfound(query: Query, login: Login):
    # log in as alice and add a non-existent user
    await login("Alice")
    result = await query(
        'mutation m { addFriend(username: "NotAUser") }', error="User not found"
    )
    assert result.data["addFriend"] is None


@pytest.mark.asyncio
async def test_removeFriend_notfound(query: Query, login: Login):
    # log in as alice and remove a non-existent user
    await login("Alice")
    result = await query(
        'mutation m { removeFriend(username: "NotAUser") }', error="User not found"
    )
    assert result.data["removeFriend"] is None


@pytest.mark.asyncio
async def test_addFriend_e2e(query: Query, login: Login):
    # log in as alice and add frank as a friend
    await login("Alice")
    result = await query('mutation m { addFriend(username: "Frank") }')
    assert result.data["addFriend"] is None

    # check the request was created
    result = await query("query q { user { friendsOutgoing { username } } }")
    assert "Frank" in [
        user["username"] for user in result.data["user"]["friendsOutgoing"]
    ]

    # log in as frank and check from his end
    await login("Frank")
    result = await query("query q { user { friendsIncoming { username } } }")
    assert "Alice" in [
        user["username"] for user in result.data["user"]["friendsIncoming"]
    ]

    # accept the request
    result = await query('mutation m { addFriend(username: "Alice") }')
    assert result.data["addFriend"] is None

    # check frank's friends list
    result = await query("query q { user { friends { username } } }")
    assert "Alice" in [user["username"] for user in result.data["user"]["friends"]]

    # check alice's friends list
    await login("Alice")
    result = await query("query q { user { friends { username } } }")
    assert "Frank" in [user["username"] for user in result.data["user"]["friends"]]

    # remove the friend
    result = await query('mutation m { removeFriend(username: "Frank") }')
    assert result.data["removeFriend"] is None

    # check alice's friends list
    result = await query("query q { user { friends { username } } }")
    assert "Frank" not in [user["username"] for user in result.data["user"]["friends"]]

    # check frank's friends list
    await login("Frank")
    result = await query("query q { user { friends { username } } }")
    assert "Alice" not in [user["username"] for user in result.data["user"]["friends"]]
