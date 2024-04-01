# mypy: disable-error-code="index"

from sqlalchemy.orm import Session
import pytest
from .. import models as m
from .. import schema as s
from .conftest import Query, Login, Logout
import itertools


@pytest.mark.asyncio
async def test_surveys_paging(db: Session, query: Query, subtests):
    result = await query("query q { surveys { name } }")
    assert result.data["surveys"] == [
        {"name": "Pets"},
    ]


@pytest.mark.asyncio
async def test_survey_metadata(query: Query):
    result = await query(
        """
        query q {
            survey(surveyId: 1) {
                id
                name
                description
                longDescription
                owner {
                    username
                }
            }
        }
    """
    )
    assert result.data["survey"] == {
        "id": 1,
        "name": "Pets",
        "description": "What type of pet should we get?",
        "longDescription": "Fluffy? Fuzzy? Wonderful?",
        "owner": {
            "username": "Alice",
        },
    }


@pytest.mark.asyncio
async def test_survey_stats(query: Query, subtests, login: Login):
    GET_SURVEY = """
        query q {
            survey(surveyId: 1) {
                name
                stats {
                    friendResponses
                    otherResponses
                    unansweredQuestions
                }
            }
        }
    """

    with subtests.test("anon"):
        result = await query(GET_SURVEY)
        assert result.data["survey"]["name"] == "Pets"
        assert result.data["survey"]["stats"] is None

    with subtests.test("user"):
        await login("Alice")
        result = await query(GET_SURVEY)
        assert result.data["survey"]["name"] == "Pets"
        assert result.data["survey"]["stats"] == {
            "friendResponses": 1,
            "otherResponses": 3,
            "unansweredQuestions": 0,
        }


@pytest.mark.asyncio
async def test_survey_questions(query: Query):
    result = await query(
        """
        query q {
            survey(surveyId: 1) {
                questions {
                    id
                    text
                    flip
                }
            }
        }
    """
    )
    assert result.data["survey"]["questions"] == [
        {"id": 1, "text": "Human (I am the owner)", "flip": "Human (I am the pet)"},
        {"id": 2, "text": "Humans", "flip": None},
        {"id": 3, "text": "Cats", "flip": None},
        {"id": 4, "text": "Dogs", "flip": None},
        {"id": 5, "text": "Rabbits", "flip": None},
        {"id": 6, "text": "Birds", "flip": None},
        {"id": 7, "text": "Lizards", "flip": None},
        {"id": 8, "text": "Horses", "flip": None},
        {"id": 9, "text": "Llamas", "flip": None},
    ]


@pytest.mark.asyncio
async def test_survey_myResponse(login: Login, query: Query, subtests):
    with subtests.test("anon"):
        result = await query(
            "query q { survey(surveyId: 1) { myResponse { owner { username } } } }",
            error="Anonymous users can't view responses",
        )
        assert result.data["survey"]["myResponse"] is None

    with subtests.test("existing"):
        await login("Alice")
        result = await query(
            "query q { survey(surveyId: 1) { myResponse { owner { username } } } }"
        )
        assert result.data["survey"]["myResponse"]["owner"]["username"] == "Alice"

    with subtests.test("not existing"):
        await login("Frank")
        result = await query(
            "query q { survey(surveyId: 1) { myResponse { owner { username } } } }"
        )
        assert result.data["survey"]["myResponse"] is None


@pytest.mark.asyncio
async def test_survey_responses(
    db: Session, login: Login, logout: Logout, query: Query, subtests
):
    await logout()
    q = """
        query q {
            survey(surveyId: 1) {
                responses {
                    id
                    owner {
                        username
                    }
                }
            }
        }
    """

    # anon can't view any responses
    with subtests.test("anon"):
        result = await query(q, error="Anonymous users can't view responses")
        assert result.data is None

    #                 |   response privacy
    #  response owner | public  anonymous  friends
    #  ---------------+-------------------------
    #  is self        |   Y       Y        Y
    #  is friend      |   Y       N        Y
    #  is not friend  |   Y       N        N
    #
    #  Y = can view
    #  N = can't view
    #
    await login("Alice")
    for owner, privacy, expected in [
        ("Alice", m.Privacy.PUBLIC, True),
        ("Alice", m.Privacy.ANONYMOUS, True),
        ("Alice", m.Privacy.FRIENDS, True),
        ("Bob", m.Privacy.PUBLIC, True),
        ("Bob", m.Privacy.ANONYMOUS, False),
        ("Bob", m.Privacy.FRIENDS, True),
        ("Charlie", m.Privacy.PUBLIC, True),
        ("Charlie", m.Privacy.ANONYMOUS, False),
        ("Charlie", m.Privacy.FRIENDS, False),
    ]:
        with subtests.test(owner=owner, privacy=privacy, expected=expected):
            # set $owner's privacy to $privacy
            owner_id = db.query(m.User).filter(m.User.username == owner).one().id
            db.query(m.Response).filter(m.Response.user_id == owner_id).update(
                {"privacy": privacy}
            )
            # check if Alice can view $owner
            result = await query(q)
            responses = result.data["survey"]["responses"]
            response_owners = [r["owner"]["username"] for r in responses]
            assert (owner in response_owners) == expected


@pytest.mark.asyncio
async def test_response(db: Session, query: Query, login: Login, subtests):
    q = """
        query q($responseId: Int!) {
            response(responseId: $responseId) {
                id
                owner {
                    username
                }
            }
        }
    """

    # anon can't view any responses, even public ones
    with subtests.test("anon"):
        db.query(m.Response).filter(m.Response.id == 1).one().privacy = m.Privacy.PUBLIC
        result = await query(
            q, responseId=1, error="Anonymous users can't view responses"
        )
        assert result.data is None

    #                 |   response privacy
    #  response owner | public  private  friends
    #  ---------------+-------------------------
    #  is self        |   Y       Y        Y
    #  is friend      |   Y       A        Y
    #  is not friend  |   Y       A        N
    #
    #  A = can view answers, but not owner
    #  Y = can view
    #  N = can't view
    #
    await login("Alice")
    for owner, privacy, response_expected, owner_expected in [
        ("Alice", m.Privacy.PUBLIC, True, True),
        ("Alice", m.Privacy.ANONYMOUS, True, True),
        ("Alice", m.Privacy.FRIENDS, True, True),
        ("Bob", m.Privacy.PUBLIC, True, True),
        ("Bob", m.Privacy.ANONYMOUS, True, False),
        ("Bob", m.Privacy.FRIENDS, True, True),
        ("Charlie", m.Privacy.PUBLIC, True, True),
        ("Charlie", m.Privacy.ANONYMOUS, True, False),
        ("Charlie", m.Privacy.FRIENDS, False, False),
    ]:
        with subtests.test(
            owner=owner,
            privacy=privacy,
            response_expected=response_expected,
            owner_expected=owner_expected,
        ):
            # set $owner's privacy to $privacy
            owner_id = db.query(m.User).filter(m.User.username == owner).one().id
            db.query(m.Response).filter(m.Response.user_id == owner_id).update(
                {"privacy": privacy}
            )
            response_id = (
                db.query(m.Response).filter(m.Response.user_id == owner_id).one().id
            )

            # check if Alice can view the response
            if response_expected:
                result = await query(q, responseId=response_id)
                response = result.data["response"]
                # check if Alice can view the response's owner
                if owner_expected:
                    assert response["owner"] is not None
                    assert response["owner"]["username"] == owner
                else:
                    assert response["owner"] is None
            else:
                result = await query(
                    q,
                    responseId=response_id,
                    error="Response doesn't exist, or is private",
                )
                assert result.data is None


@pytest.mark.asyncio
async def test_response_answers(db: Session, query: Query, login: Login, subtests):
    GET_RESPONSE = """
        query q($responseId: Int!) {
            response(responseId: $responseId) {
                id
                owner {
                    username
                }
                answers {
                    question {
                        text
                    }
                    value
                }
            }
        }
    """

    # anon can't view any responses, even public ones
    with subtests.test("anon"):
        result = await query(
            GET_RESPONSE, responseId=1, error="Anonymous users can't view responses"
        )
        assert result.data is None

    # user can see their own answers
    with subtests.test("user-view-self"):
        await login("Alice")
        result = await query(GET_RESPONSE, responseId=1)
        assert result.data["response"]["owner"]["username"] == "Alice"
        assert result.data["response"]["answers"][0]["question"] == {
            "text": "Human (I am the owner)"
        }
        assert result.data["response"]["answers"][0]["value"] is not None

    # user can't see other's answers
    with subtests.test("user-view-other"):
        result = await query(
            GET_RESPONSE,
            responseId=2,
            error="You can't view other people's raw answers",
        )
        assert result.data is None


COMPARE_RESPONSE = """
    query q($responseId: Int!) {
        response(responseId: $responseId) {
            id
            owner {
                username
            }
            comparison {
                section
                order
                text
                flip
                mine
                theirs
            }
        }
    }
"""


@pytest.mark.asyncio
async def test_response_comparison_anon(db: Session, query: Query):
    # anon can't view any responses, even public ones
    db.query(m.Response).filter(m.Response.id == 1).one().privacy = m.Privacy.PUBLIC
    result = await query(
        COMPARE_RESPONSE,
        responseId=1,
        error="Anonymous users can't view responses",
    )
    assert result.data is None


@pytest.mark.asyncio
async def test_response_comparison_self(db: Session, query: Query, login: Login):
    # user can't compare themselves
    await login("Alice")
    assert (
        db.query(m.Response).filter(m.Response.id == 1).one().owner.username == "Alice"
    )
    result = await query(
        COMPARE_RESPONSE, responseId=1, error="You can't compare yourself to yourself"
    )
    assert result.data is None


@pytest.mark.asyncio
async def test_response_comparison_friend(db: Session, query: Query, login: Login):
    # bob is a friend, and his response is friends-only,
    # so we can see his response, as well as his name
    bob = db.query(m.User).filter(m.User.username == "Bob").one()
    response = db.query(m.Response).where(m.Response.owner == bob).one()
    response.privacy = m.Privacy.FRIENDS

    await login("Alice")
    result = await query(COMPARE_RESPONSE, responseId=response.id)
    assert result.data["response"]["owner"]["username"] == "Bob"
    assert result.data["response"]["comparison"] is not None


@pytest.mark.asyncio
async def test_response_comparison_nonfriend(db: Session, query: Query, login: Login):
    # charlie is not a friend, and his response is friends-only,
    # so we can't see his response or his name
    charlie = db.query(m.User).filter(m.User.username == "Charlie").one()
    response = db.query(m.Response).where(m.Response.owner == charlie).one()
    response.privacy = m.Privacy.FRIENDS

    await login("Alice")
    result = await query(
        COMPARE_RESPONSE,
        responseId=response.id,
        error="Response doesn't exist, or is private",
    )
    assert result.data is None


@pytest.mark.asyncio
async def test_response_comparison_public(db: Session, query: Query, login: Login):
    # dave is a non-friend, but his response is public,
    # so we can see it as well as his name
    dave = db.query(m.User).filter(m.User.username == "Dave").one()
    response = db.query(m.Response).where(m.Response.owner == dave).one()
    response.privacy = m.Privacy.PUBLIC

    await login("Alice")
    result = await query(COMPARE_RESPONSE, responseId=response.id)
    assert result.data["response"]["owner"]["username"] == "Dave"
    assert result.data["response"]["comparison"] is not None


@pytest.mark.asyncio
async def test_response_comparison_anonymous(db: Session, query: Query, login: Login):
    # evette is a non-friend, and her response is anonymous,
    # so we can see it but can't see who wrote it
    evette = db.query(m.User).filter(m.User.username == "Evette").one()
    response = db.query(m.Response).where(m.Response.owner == evette).one()
    response.privacy = m.Privacy.ANONYMOUS

    await login("Alice")
    result = await query(COMPARE_RESPONSE, responseId=response.id)
    assert result.data["response"]["owner"] is None
    assert result.data["response"]["comparison"] is not None


@pytest.mark.asyncio
async def test_response_comparison_noresponse(db: Session, query: Query, login: Login):
    # frank hasn't responded to the survey, he shouldn't be able to compare
    # his response to anyone else's, even public ones
    frank = db.query(m.User).filter(m.User.username == "Frank").one()
    response = db.query(m.Response).where(m.Response.owner == frank).first()
    assert response is None
    db.query(m.Response).filter(m.Response.id == 1).one().privacy = m.Privacy.PUBLIC

    await login("Frank")
    result = await query(
        COMPARE_RESPONSE,
        responseId=1,
        error="You haven't responded to this survey",
    )
    assert result.data is None


@pytest.mark.asyncio
async def test_response_comparison_nonflip(
    db: Session, query: Query, login: Login, subtests
):
    # we can see bob's response, and should be able to see or
    # not-see specific answers based on their value
    alice = db.query(m.User).filter(m.User.username == "Alice").one()
    alice_response = db.query(m.Response).where(m.Response.owner == alice).one()
    bob = db.query(m.User).filter(m.User.username == "Bob").one()
    bob_response = db.query(m.Response).where(m.Response.owner == bob).one()
    bob_response.privacy = m.Privacy.PUBLIC

    # make the survey only have a single nonflip question
    qid = 100
    survey = db.query(m.Survey).filter(m.Survey.name == "Pets").one()
    survey.questions = {qid: m.Question(id=qid, text="test", survey_id=survey.id)}

    await login("Alice")

    possible_scores = list(m.WWW) + [None]
    for alice_value, bob_value in itertools.product(possible_scores, repeat=2):
        with subtests.test(alice_value=alice_value, bob_value=bob_value):
            if alice_value is None:
                alice_response.answers = {}
            else:
                alice_response.answers = {
                    qid: m.Answer(
                        question_id=qid,
                        response_id=alice_response.id,
                        value=alice_value,
                    )
                }
            if bob_value is None:
                bob_response.answers = {}
            else:
                bob_response.answers = {
                    qid: m.Answer(
                        question_id=qid, response_id=bob_response.id, value=bob_value
                    )
                }

            result = await query(COMPARE_RESPONSE, responseId=bob_response.id)
            cs = result.data["response"]["comparison"]
            if alice_value is None or bob_value is None:
                assert len(cs) == 0
            elif (alice_value, bob_value) in s.visible_combos:
                assert len(cs) == 1
                assert cs[0]["text"] == "test"
                assert cs[0]["mine"] == alice_value.name
                assert cs[0]["theirs"] == bob_value.name
            else:
                assert len(cs) == 0


@pytest.mark.asyncio
async def test_response_comparison_flip(
    db: Session, query: Query, login: Login, subtests
):
    # we can see bob's response, and should be able to see or
    # not-see specific answers based on their value
    alice = db.query(m.User).filter(m.User.username == "Alice").one()
    alice_response = db.query(m.Response).where(m.Response.owner == alice).one()
    bob = db.query(m.User).filter(m.User.username == "Bob").one()
    bob_response = db.query(m.Response).where(m.Response.owner == bob).one()
    bob_response.privacy = m.Privacy.PUBLIC

    # make the survey only have a single flip question
    qid = 100
    survey = db.query(m.Survey).filter(m.Survey.name == "Pets").one()
    survey.questions = {
        qid: m.Question(
            id=qid, text="giving bacon", flip="receiving bacon", survey_id=survey.id
        )
    }

    await login("Alice")

    possible_scores = list(m.WWW) + [None]
    possible_flips = list(m.WWW)
    for alice_value, alice_flip, bob_value, bob_flip in itertools.product(
        possible_scores, possible_flips, repeat=2
    ):
        with subtests.test(
            alice_value=alice_value,
            alice_flip=alice_flip,
            bob_value=bob_value,
            bob_flip=bob_flip,
        ):
            if alice_value is None:
                alice_response.answers = {}
            else:
                alice_response.answers = {
                    qid: m.Answer(
                        question_id=qid,
                        response_id=alice_response.id,
                        value=alice_value,
                        flip=alice_flip,
                    )
                }
            if bob_value is None:
                bob_response.answers = {}
            else:
                bob_response.answers = {
                    qid: m.Answer(
                        question_id=qid,
                        response_id=bob_response.id,
                        value=bob_value,
                        flip=bob_flip,
                    )
                }

            result = await query(COMPARE_RESPONSE, responseId=bob_response.id)
            cs = result.data["response"]["comparison"]
            if (
                alice_value is None
                or alice_flip is None
                or bob_value is None
                or bob_flip is None
            ):
                assert len(cs) == 0
            elif (alice_value, bob_flip) in s.visible_combos and (
                alice_flip,
                bob_value,
            ) in s.visible_combos:
                assert len(cs) == 2
                assert cs[0]["text"] == "giving bacon"
                assert cs[0]["flip"] == "receiving bacon"
                assert cs[0]["mine"] == alice_value.name
                assert cs[0]["theirs"] == bob_flip.name
                assert cs[1]["text"] == "receiving bacon"
                assert cs[1]["flip"] == "giving bacon"
                assert cs[1]["mine"] == alice_flip.name
                assert cs[1]["theirs"] == bob_value.name
            elif (alice_value, bob_flip) in s.visible_combos:
                assert len(cs) == 1
                assert cs[0]["text"] == "giving bacon"
                assert cs[0]["flip"] == "receiving bacon"
                assert cs[0]["mine"] == alice_value.name
                assert cs[0]["theirs"] == bob_flip.name
            elif (alice_flip, bob_value) in s.visible_combos:
                assert len(cs) == 1
                assert cs[0]["text"] == "receiving bacon"
                assert cs[0]["flip"] == "giving bacon"
                assert cs[0]["mine"] == alice_flip.name
                assert cs[0]["theirs"] == bob_value.name
            else:
                assert len(cs) == 0
