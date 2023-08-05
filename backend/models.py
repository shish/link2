import typing as t
import bcrypt
import enum
from sqlalchemy import ForeignKey, create_engine, UniqueConstraint, Enum
from sqlalchemy.orm import (
    Session,
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
    attribute_keyed_dict,
)

SECURE = True


class Privacy(enum.Enum):
    ANONYMOUS = "anonymous"
    FRIENDS = "friends"
    PUBLIC = "public"


class WWW(enum.Enum):
    WANT = "want"
    WILL = "will"
    WONT = "wont"
    NA = "n/a"


class Base(DeclarativeBase):
    pass


class Friendship(Base):
    __tablename__ = "friendship"

    friend_a_id: Mapped[int] = mapped_column(
        ForeignKey("user.id"), primary_key=True, index=True
    )
    friend_b_id: Mapped[int] = mapped_column(
        ForeignKey("user.id"), primary_key=True, index=True
    )
    confirmed: Mapped[bool] = mapped_column(default=False)

    friend_a: Mapped["User"] = relationship(
        "User", back_populates="friends_outgoing", foreign_keys=[friend_a_id], lazy="joined"
    )
    friend_b: Mapped["User"] = relationship(
        "User", back_populates="friends_incoming", foreign_keys=[friend_b_id], lazy="joined"
    )


class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column("id", primary_key=True)
    username: Mapped[str] = mapped_column(unique=True, index=True)
    password: Mapped[str]
    email: Mapped[str]

    friends_incoming: Mapped[t.List[Friendship]] = relationship(
        "Friendship", foreign_keys=[Friendship.friend_b_id], back_populates="friend_b"
    )
    friends_outgoing: Mapped[t.List[Friendship]] = relationship(
        "Friendship", foreign_keys=[Friendship.friend_a_id], back_populates="friend_a"
    )

    def __init__(self, username: str, password: str, email: str = ""):
        self.username = username
        self.email = email
        self.set_password(password)

    def set_password(self, password: str) -> None:
        given = password.encode()
        if SECURE:  # pragma: no cover
            self.password = bcrypt.hashpw(given, bcrypt.gensalt()).decode()
        else:
            self.password = password

    def check_password(self, password: str) -> bool:
        given = password.encode()
        current = self.password.encode()
        if SECURE:  # pragma: no cover
            return bcrypt.hashpw(given, current) == current
        else:
            return given == current

    @property
    def friends(self) -> t.Iterator["User"]:
        for outgoing in self.friends_outgoing:
            if outgoing.confirmed:
                yield outgoing.friend_b
        for incoming in self.friends_incoming:
            if incoming.confirmed:
                yield incoming.friend_a

    def __repr__(self) -> str:  # pragma: no cover
        return f"<User {self.username}>"


class Question(Base):
    __tablename__ = "question"

    id: Mapped[int] = mapped_column("id", primary_key=True)
    survey_id: Mapped[int] = mapped_column(ForeignKey("survey.id"), index=True)
    order: Mapped[float] = mapped_column(default=0.0)
    section: Mapped[str] = mapped_column(default="")
    text: Mapped[str]
    flip: Mapped[t.Optional[str]] = mapped_column(default=None)
    extra: Mapped[t.Optional[str]] = mapped_column(default=None)

    survey: Mapped["Survey"] = relationship("Survey")


class Survey(Base):
    __tablename__ = "survey"

    id: Mapped[int] = mapped_column("id", primary_key=True)
    name: Mapped[str] = mapped_column(unique=True, index=True)
    description: Mapped[str]
    long_description: Mapped[str]
    user_id: Mapped[int] = mapped_column("user_id", ForeignKey("user.id"), index=True)

    owner: Mapped[User] = relationship("User")
    questions: Mapped[t.Dict[int, Question]] = relationship(
        "Question",
        collection_class=attribute_keyed_dict("id"),
        back_populates="survey",
        cascade="all, delete-orphan",
    )
    responses: Mapped[t.List["Response"]] = relationship(
        "Response", back_populates="survey"
    )


class Answer(Base):
    __tablename__ = "answer"

    response_id: Mapped[int] = mapped_column(
        ForeignKey("response.id"), primary_key=True
    )
    question_id: Mapped[int] = mapped_column(
        ForeignKey("question.id"), primary_key=True
    )
    value: Mapped[WWW] = mapped_column(Enum(WWW))
    flip: Mapped[WWW] = mapped_column(Enum(WWW), default=WWW.NA)

    question: Mapped[Question] = relationship("Question")


class Response(Base):
    __tablename__ = "response"

    id: Mapped[int] = mapped_column("id", primary_key=True)
    user_id: Mapped[int] = mapped_column(
        "user_id", ForeignKey("user.id"), nullable=False, index=True
    )
    survey_id: Mapped[int] = mapped_column(
        ForeignKey("survey.id"), nullable=False, index=True
    )
    privacy: Mapped[Privacy] = mapped_column(Enum(Privacy), default=Privacy.FRIENDS)

    owner: Mapped[User] = relationship("User", lazy="joined")
    survey: Mapped[Survey] = relationship("Survey", back_populates="responses")
    answers: Mapped[t.Dict[int, Answer]] = relationship(
        "Answer",
        collection_class=attribute_keyed_dict("question_id"),
        cascade="all, delete-orphan",
    )


def populate_example_data(db: Session):
    users: t.List[User] = []
    for name in ["Alice", "Bob", "Charlie", "Dave", "Evette", "Frank"]:
        user = db.query(User).filter(User.username == name).first()
        if not user:
            user = User(name, name.lower() + "pass")
            users.append(user)
            db.add(user)
    [alice, bob, charlie, dave, evette, frank] = users

    alice.email = "alice@example.com"

    pets = db.query(Survey).filter(Survey.name == "Pets").first()
    if not pets:
        pets = Survey(
            name="Pets",
            owner=alice,
            description="What type of pet should we get?",
            long_description="Fluffy? Fuzzy? Wonderful?",
        )
        db.add(pets)
        db.flush()

        n = ""
        s = "Small Animals"
        l = "Large Animals"

        class X:
            n = 0.0

        x = X()

        def qgen(
            section: str,
            text: str,
            flip: t.Optional[str] = None,
            extra: t.Optional[str] = None,
        ) -> Question:
            q = Question(
                survey_id=pets.id,
                order=x.n,
                section=section,
                text=text,
                flip=flip,
                extra=extra,
            )
            x.n += 1
            return q

        qs = [
            qgen(n, "Human (I am the owner)", "Human (I am the pet)"),
            qgen(n, "Humans", extra="As in children"),
            qgen(s, "Cats"),
            qgen(s, "Dogs"),
            qgen(s, "Rabbits"),
            qgen(s, "Birds"),
            qgen(s, "Lizards"),
            qgen(l, "Horses"),
            qgen(l, "Llamas"),
        ]
        db.add_all(qs)
        db.flush()  # ensure ids are populated
        assert len(pets.questions) == 9

        for u in users:
            pattern = [WWW.WONT, WWW.NA, WWW.WILL, WWW.WANT, WWW.WILL]
            if u.username == "Bob":
                pattern = [WWW.WANT, WWW.WILL, WWW.WANT]
            if u.username == "Frank":
                # Frank hasn't created a survey yet
                continue

            r = Response(survey=pets, owner=u, privacy=Privacy.FRIENDS)
            for id, q in pets.questions.items():
                r.answers[id] = Answer(
                    response_id=r.id,
                    question_id=q.id,
                    value=pattern[q.id % len(pattern)],
                    flip=pattern[-q.id % len(pattern)],
                )
            db.add(r)

        f = Friendship(friend_a=alice, friend_b=bob, confirmed=True)
        db.add(f)

        f = Friendship(friend_a=charlie, friend_b=alice, confirmed=False)
        db.add(f)

    db.commit()


if __name__ == "__main__":  # pragma: no cover
    engine = create_engine("sqlite:///data/link2.sqlite", echo=False)
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
