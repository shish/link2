# mypy: disable-error-code="index"

import pytest
from .conftest import Query, Login


@pytest.mark.asyncio
async def test_user_self(query: Query, login: Login, subtests):
    with subtests.test("anon-view-self"):
        result = await query("query q { user { username } }")
        assert result.data["user"] is None

    with subtests.test("user-view-self"):
        await login("Alice")
        result = await query(
            """
            query q {
                user {
                    username
                    email
                    friends { username }
                    friendsIncoming { username }
                    friendsOutgoing { username }
                }
            }
        """
        )
        assert result.data["user"] == {
            "username": "Alice",
            "email": "alice@example.com",
            "friends": [
                {"username": "Bob"},
            ],
            "friendsIncoming": [
                {"username": "Charlie"},
            ],
            "friendsOutgoing": [],
        }


@pytest.mark.asyncio
async def test_user_others(query: Query, login: Login, subtests):
    with subtests.test("anon-view-others"):
        result = await query(
            'query q { user(username: "Alice") { username } }',
            error="Anonymous users can't view other users",
        )
        assert result.data["user"] is None

    with subtests.test("user-view-others-username"):
        await login("Alice")
        result = await query('query q { user(username: "Bob") { username isFriend } }')
        assert result.data["user"] == {"username": "Bob", "isFriend": True}
        result = await query(
            'query q { user(username: "Charlie") { username isFriend } }'
        )
        assert result.data["user"] == {"username": "Charlie", "isFriend": False}

    with subtests.test("user-view-others-friends"):
        await login("Alice")
        result = await query(
            'query q { user(username: "Bob") { friends { username } } }',
            error="You can only view your own data.",
        )
        assert result.data["user"] is None
