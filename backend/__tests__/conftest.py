from flask.sessions import SecureCookieSession
from sqlalchemy import create_engine
from strawberry_sqlalchemy_mapper import StrawberrySQLAlchemyLoader  # type: ignore
from sqlalchemy.orm import Session
from graphql import ExecutionResult
import pytest
import typing as t

from .. import schema as s
from .. import models as m


@pytest.fixture(autouse=True)
def reset_secure() -> None:
    m.SECURE = False


@pytest.fixture
def db() -> Session:
    engine = create_engine("sqlite://", echo=False)
    db = Session(engine)
    m.Base.metadata.create_all(engine)
    m.populate_example_data(db)
    return db


@pytest.fixture
def cookie() -> SecureCookieSession:
    return SecureCookieSession()


class Query(t.Protocol):
    def __call__(
        self, q: str, error: t.Optional[str] = None, **kwargs
    ) -> t.Coroutine[t.Any, t.Any, ExecutionResult]:  # pragma: no cover
        ...


@pytest.fixture
def query(db, cookie) -> Query:
    async def _query(q, error: t.Optional[str] = None, **kwargs):
        ctx: s.Context = {
            "db": db,
            "cookie": cookie,
            "cache": {},
            "sqlalchemy_loader": StrawberrySQLAlchemyLoader(bind=db),
        }
        result = await s.schema.execute(
            q,
            context_value=ctx,
            variable_values=kwargs,
        )
        if error:
            assert result.errors is not None
            assert result.errors[0].message == error
        else:
            assert result.errors is None, result.errors
        return result

    return _query


class Login(t.Protocol):
    def __call__(
        self, username: str = "alice", password: t.Optional[str] = None
    ) -> t.Coroutine[t.Any, t.Any, ExecutionResult]:  # pragma: no cover
        ...


@pytest.fixture
def login(query) -> Login:
    return lambda username="alice", password=None: query(
        """
        mutation m($username: String!, $password: String!) {
            login(username: $username, password: $password) {
                username
            }
        }
    """,
        username=username,
        password=password or username.lower() + "pass",
    )


class Logout(t.Protocol):
    def __call__(
        self,
    ) -> t.Coroutine[t.Any, t.Any, ExecutionResult]:  # pragma: no cover
        ...


@pytest.fixture
def logout(query) -> Logout:
    return lambda: query("mutation m { logout }")
