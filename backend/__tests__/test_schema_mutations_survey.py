# mypy: disable-error-code="index"

from sqlalchemy import select
from sqlalchemy.orm import Session
import pytest
from .. import models as m
from .conftest import Query, Login, Logout


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
