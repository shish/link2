# mypy: disable-error-code="index"

import pytest
from .conftest import Query, Login


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
