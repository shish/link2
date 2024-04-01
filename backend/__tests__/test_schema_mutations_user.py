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
