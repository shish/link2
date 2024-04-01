import os

import pytest
from flask import Flask
from flask.testing import FlaskClient

from ..app import create_app


@pytest.fixture
def app():
    yield create_app(
        test_config={
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "SQLALCHEMY_DATABASE_ECHO": True,
        }
    )


@pytest.fixture
def client(app: Flask):
    return app.test_client()


def test_graphql(client: FlaskClient):
    response = client.post(
        "/graphql", json={"query": "{ __schema { types { name } } }"}
    )
    assert response.status_code == 200
    assert response.content_type == "application/json"
    assert response.json["data"]["__schema"]["types"][0]["name"] == "Query"  # type: ignore


def test_static(client: FlaskClient):
    if not os.path.exists("./frontend/dist/favicon.svg"):
        pytest.skip("frontend not built")

    response = client.get("/favicon.svg")
    assert response.status_code == 200
    assert response.content_type == "image/svg+xml; charset=utf-8"

    response = client.get("/heartbeat")
    assert response.status_code == 200
    assert response.content_type == "application/json"

    response = client.get("/assets/does-not-exist")
    assert response.status_code == 404
    assert response.content_type == "text/html; charset=utf-8"


def test_webapp(client: FlaskClient):
    if not os.path.exists("./frontend/dist/index.html"):
        pytest.skip("frontend not built")

    response = client.get("/")
    assert response.status_code == 200
    assert response.content_type == "text/html; charset=utf-8"

    response = client.get("/user")
    assert response.status_code == 200
    assert response.content_type == "text/html; charset=utf-8"


def test_error(client: FlaskClient):
    response = client.get("/error")
    assert response.status_code == 500
    assert response.content_type == "text/html; charset=utf-8"
