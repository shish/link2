import datetime
import os

import click
from flask import Flask, Request, Response, g, jsonify, session
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from strawberry.flask.views import AsyncGraphQLView
from strawberry_sqlalchemy_mapper import StrawberrySQLAlchemyLoader  # type: ignore

from . import models as m
from . import schema as s


class MyGraphQLView(AsyncGraphQLView):
    async def get_context(self, request: Request, response: Response) -> s.Context:
        return {
            "db": g.db,
            "cookie": session,
            "cache": {},
            "sqlalchemy_loader": StrawberrySQLAlchemyLoader(bind=g.db),
        }


def create_app(test_config=None):
    ###################################################################
    # Load config

    app = Flask(
        __name__,
        instance_path=os.path.abspath("./data"),
        static_folder="../frontend/dist",
    )
    app.config.from_mapping(
        SQLALCHEMY_DATABASE_URI="sqlite:///data/link2.sqlite",
        SQLALCHEMY_DATABASE_ECHO=False,
        SESSION_COOKIE_SECURE=True,
        SESSION_COOKIE_SAMESITE="None",
        PERMANENT_SESSION_LIFETIME=datetime.timedelta(days=365),
    )
    if test_config is None:  # pragma: no cover
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile("config.py", silent=True)
        os.makedirs("./data", exist_ok=True)
        if not os.path.exists("./data/secret.txt"):
            with open("./data/secret.txt", "wb") as fp:
                fp.write(os.urandom(32))
        with open("./data/secret.txt", "rb") as fp:
            secret_key = fp.read()
        app.config.from_mapping(
            SECRET_KEY=secret_key,
        )
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    ###################################################################
    # Load database

    engine = create_engine(
        app.config.get("SQLALCHEMY_DATABASE_URI"),
        echo=app.config.get("DATABASE_ECHO"),
    )

    @click.command("init-db")
    def init_db_command():  # pragma: no cover
        """Clear the existing data and create new tables."""
        with app.app_context():
            m.Base.metadata.drop_all(engine)
            m.Base.metadata.create_all(engine)
            m.populate_example_data(Session(engine))
        click.echo("Initialized the database.")

    @app.before_request
    def connect_db() -> None:
        g.db = Session(engine)
        # ensure that there is an open connection from the start of the request,
        # to avoid connections being opened on-demand in other threads
        g.db.connection()

    @app.teardown_request
    def teardown_db(exception=None) -> None:
        if exception:
            g.db.rollback()
        else:
            g.db.commit()
        g.db.close()

    ###################################################################
    # Public routes

    app.add_url_rule(
        "/graphql",
        view_func=MyGraphQLView.as_view(
            "graphql_view", schema=s.schema, graphql_ide=True
        ),
    )

    @app.route("/favicon.svg")
    def favicon() -> Response:
        if os.path.exists("./frontend/dist/favicon.svg"):
            return app.send_static_file("favicon.svg")
        else:
            return Response(
                "Frontend has not been built", mimetype="image/svg+xml; charset=utf-8"
            )

    @app.route("/heartbeat")
    def heartbeat():
        return jsonify({"status": "healthy"})

    @app.route("/assets/<path:x>")
    def assets(x) -> Response:
        return app.send_static_file(f"assets/{x}")

    @app.route("/error")
    def error():
        raise Exception("This is a test exception")

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def root(path) -> Response:
        if os.path.exists("./frontend/dist/index.html"):
            return app.send_static_file("index.html")
        else:
            return Response("Frontend has not been built", mimetype="text/html")

    return app
