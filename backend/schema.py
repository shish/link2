# mypy: disable-error-code="misc"

import typing as t
import re
from typing import TypedDict
from flask.sessions import SessionMixin

from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import Session
import strawberry
from strawberry_sqlalchemy_mapper import StrawberrySQLAlchemyMapper  # type: ignore
from strawberry.permission import BasePermission
from strawberry.types.info import Info as SInfo

from . import models as m
from .query_counter import QueryCounter

strawberry_sqlalchemy_mapper = StrawberrySQLAlchemyMapper()


Context = TypedDict(
    "Context",
    {
        "db": Session,
        "cookie": SessionMixin,
        "sqlalchemy_loader": StrawberrySQLAlchemyMapper,
        "cache": t.Dict[str, t.Any],
    },
)
Info = SInfo[Context, None]

visible_combos = [
    (m.WWW.WILL, m.WWW.WANT),
    (m.WWW.WANT, m.WWW.WILL),
    (m.WWW.WANT, m.WWW.WANT),
]


#############################################
# Database Types
#############################################

# Users


class UserOnlyViewOwnUserDetails(BasePermission):
    message = "You can only view your own data."

    def has_permission(self, source: m.User, info: Info, **kwargs) -> bool:
        return source.username == info.context["cookie"].get("username")


@strawberry_sqlalchemy_mapper.type(m.User)
class User:
    __exclude__ = ["id", "email", "password", "responses", "surveys"]

    @strawberry.field(permission_classes=[UserOnlyViewOwnUserDetails])
    def email(self: m.User, info: Info) -> str:
        return self.email

    @strawberry.field(
        permission_classes=[UserOnlyViewOwnUserDetails], graphql_type=t.List["User"]
    )
    def friends(self: m.User, info: Info) -> t.List[m.User]:
        return list(self.friends)

    @strawberry.field(
        permission_classes=[UserOnlyViewOwnUserDetails], graphql_type=t.List["User"]
    )
    def friends_outgoing(self: m.User, info: Info) -> t.List[m.User]:
        return [f.friend_b for f in self.friends_outgoing if not f.confirmed]

    @strawberry.field(
        permission_classes=[UserOnlyViewOwnUserDetails], graphql_type=t.List["User"]
    )
    def friends_incoming(self: m.User, info: Info) -> t.List[m.User]:
        return [f.friend_a for f in self.friends_incoming if not f.confirmed]
    
    @strawberry.field
    def is_friend(self: m.User, info: Info) -> bool:
        return self in get_me_or_die(info, "Anonymous has no friends").friends


# Surveys


@strawberry_sqlalchemy_mapper.type(m.Question)
class Question:
    __exclude__ = ["survey_id", "survey"]


@strawberry.type
class SurveyStats:
    friend_responses: int
    other_responses: int
    unanswered_questions: int


@strawberry_sqlalchemy_mapper.type(m.Survey)
class Survey:
    __exclude__ = ["user_id"]

    @strawberry.field(graphql_type=t.Optional["Response"])
    def my_response(self: m.Survey, info: Info) -> t.Optional[m.Response]:
        db = info.context["db"]
        user = get_me_or_die(info, "Anonymous users can't view responses")
        return (
            db.execute(
                select(m.Response).where(
                    m.Response.survey_id == self.id, m.Response.user_id == user.id
                )
            )
            .scalars()
            .first()
        )

    @strawberry.field(graphql_type=t.List["Response"])
    def responses(self: m.Survey, info: Info) -> t.List[m.Response]:
        user = get_me_or_die(info, "Anonymous users can't view responses")
        return [
            r
            for r in self.responses
            if (r.owner == user)
            or (r.privacy == m.Privacy.PUBLIC)
            or (r.privacy == m.Privacy.FRIENDS and r.owner in user.friends)
        ]

    @strawberry.field(graphql_type=t.List["Question"])
    def questions(self: m.Survey) -> t.Iterable[m.Question]:
        return self.questions.values()

    @strawberry.field(graphql_type=t.Optional[SurveyStats])
    def stats(self: m.Survey, info: Info) -> t.Optional[SurveyStats]:
        user = get_me(info)
        if not user:
            return None
        rs = list(self.responses)
        fs = list(user.friends)
        friend_responses = len(list(r for r in rs if r.owner in fs))
        my_responses = len(list(r for r in rs if r.owner == user))
        return SurveyStats(
            friend_responses=friend_responses,
            other_responses=len(rs) - friend_responses - my_responses,
            unanswered_questions=0,  # FIXME
        )


@strawberry.input
class QuestionInput:
    section: t.Optional[str] = None
    order: t.Optional[float] = None
    text: str
    flip: t.Optional[str] = None
    extra: t.Optional[str] = None


@strawberry.input
class SurveyInput:
    name: str
    description: str
    long_description: str


# Responses

WWW: t.TypeAlias = strawberry.enum(m.WWW)  # type: ignore


@strawberry_sqlalchemy_mapper.type(m.Answer)
class Answer:
    __exclude__ = ["response_id", "response"]

    @strawberry.field(graphql_type=int)
    def id(self: m.Answer, info: Info) -> int:
        return self.question_id


@strawberry.type
class Comparison:
    section: str
    order: float
    text: str
    flip: t.Optional[str] = None
    mine: WWW
    theirs: WWW


Privacy: t.TypeAlias = strawberry.enum(m.Privacy)  # type: ignore


@strawberry_sqlalchemy_mapper.type(m.Response)
class Response:
    __exclude__ = ["user_id", "survey_id"]

    @strawberry.field(graphql_type=t.Optional["User"])
    def owner(self: m.Response, info: Info) -> t.Optional[m.User]:
        user = get_me_or_die(info, "Anonymous users can't view responses")
        if (
            self.owner == user
            or self.privacy == m.Privacy.PUBLIC
            or (self.privacy == m.Privacy.FRIENDS and self.owner in user.friends)
        ):
            return self.owner
        return None

    @strawberry.field(graphql_type=t.List["Answer"])
    def answers(self: m.Response, info: Info) -> t.Iterable[m.Answer]:
        user = get_me_or_die(info, "Anonymous users can't view responses")
        if self.owner != user:
            raise Exception("You can't view other people's raw answers")
        return self.answers.values()

    @strawberry.field(graphql_type=t.List[Comparison])
    def comparison(self: m.Response, info: Info) -> t.List[Comparison]:
        db = info.context["db"]
        user = get_me_or_die(info, "Anonymous users can't view responses")
        my_response = (
            db.query(m.Response)
            .where(
                m.Response.survey_id == self.survey.id,
                m.Response.user_id == user.id,
            )
            .first()
        )
        if not my_response:
            raise Exception("You haven't responded to this survey")
        if self.id == my_response.id:
            raise Exception("You can't compare yourself to yourself")
        survey: m.Survey = self.survey
        # return things that we have in common
        common_answers: t.List[Comparison] = []
        for q in survey.questions.values():
            ma = my_response.answers.get(q.id)
            ta = self.answers.get(q.id)
            if ma and ta:
                if q.flip:
                    if (ma.value, ta.flip) in visible_combos:
                        common_answers.append(
                            Comparison(
                                section=q.section,
                                order=q.order,
                                text=q.text,
                                flip=q.flip,
                                mine=ma.value,
                                theirs=ta.flip,
                            )
                        )
                    if (ma.flip, ta.value) in visible_combos:
                        common_answers.append(
                            Comparison(
                                section=q.section,
                                order=q.order,
                                text=q.flip,
                                flip=q.text,
                                mine=ma.flip,
                                theirs=ta.value,
                            )
                        )
                else:
                    if (ma.value, ta.value) in visible_combos:
                        common_answers.append(
                            Comparison(
                                section=q.section,
                                order=q.order,
                                text=q.text,
                                mine=ma.value,
                                theirs=ta.value,
                            )
                        )
        return common_answers


#############################################
# Functions
#############################################


@strawberry.type
class Query:
    @strawberry.field(graphql_type=t.Optional[User])
    def user(self, info: Info, username: t.Optional[str] = None) -> t.Optional[m.User]:
        me = get_me(info)
        if username:
            if not me:
                raise Exception("Anonymous users can't view other users")
            else:
                return by_username(info, username)
        else:
            return me

    @strawberry.field(graphql_type=t.Sequence[Survey])
    def surveys(self, info: Info) -> t.Sequence[m.Survey]:
        db = info.context["db"]
        return db.query(m.Survey).all()

    @strawberry.field(graphql_type=Survey)
    def survey(self, info: Info, survey_id: int) -> m.Survey:
        db = info.context["db"]
        return db.query(m.Survey).where(m.Survey.id == survey_id).one()

    @strawberry.field(graphql_type=Response)
    def response(self, info: Info, response_id: int) -> m.Response:
        user = get_me_or_die(info, "Anonymous users can't view responses")
        db = info.context["db"]
        response = db.query(m.Response).where(m.Response.id == response_id).first()
        if response and (
            response.owner == user
            or response.privacy == m.Privacy.PUBLIC
            or response.privacy == m.Privacy.ANONYMOUS
            or (
                response.privacy == m.Privacy.FRIENDS and response.owner in user.friends
            )
        ):
            return response
        raise Exception(f"Response doesn't exist, or is private")


@strawberry.input
class AnswerInput:
    value: WWW
    flip: WWW = WWW.NA


@strawberry.input
class ResponseInput:
    privacy: Privacy

@strawberry.type
class Mutation:
    ###################################################################
    # Sessions
    @strawberry.mutation(graphql_type=t.Optional[User])
    def create_user(
        self, info: Info, username: str, password1: str, password2: str, email: str
    ) -> t.Optional[m.User]:
        db = info.context["db"]
        user = by_username(info, username)
        if user:
            if user.check_password(password1):
                info.context["cookie"]["username"] = user.username
                return user
            raise Exception("A user with that name already exists")

        validate_new_username(info, username)
        validate_new_password(password1, password2)
        user = m.User(username, password1, email)
        db.add(user)
        db.flush()
        info.context["cookie"]["username"] = user.username
        return user

    @strawberry.mutation(graphql_type=User)
    def update_user(
        self,
        info: Info,
        password: str,
        username: str,
        password1: str,
        password2: str,
        email: str,
    ) -> m.User:
        db = info.context["db"]
        user = get_me_or_die(info, "Anonymous users can't save settings")

        if not user.check_password(password):
            raise Exception("Current password incorrect")

        if username and username != user.username:
            validate_new_username(info, username)
            user.username = username
            info.context["cookie"]["username"] = user.username
        if password1:
            validate_new_password(password1, password2)
            user.set_password(password1)
        if email:
            user.email = email
        db.flush()
        return user

    @strawberry.mutation(graphql_type=t.Optional[User])
    def login(self, info: Info, username: str, password: str) -> t.Optional[m.User]:
        db = info.context["db"]
        user = by_username(info, username)
        if not user or not user.check_password(password):
            raise Exception("User not found")
        info.context["cookie"].permanent = True
        info.context["cookie"]["username"] = user.username
        return user

    @strawberry.mutation
    def logout(self, info: Info) -> None:
        if "username" in info.context["cookie"]:
            del info.context["cookie"]["username"]

    ###################################################################
    # Friendships
    @strawberry.mutation
    def add_friend(self, info: Info, username: str) -> None:
        db = info.context["db"]
        user = get_me_or_die(info, "Anonymous users can't add friends")
        friend = by_username(info, username)
        if not friend:
            raise Exception("User not found")
        if friend.id == user.id:
            raise Exception("You can't add yourself")
        for friendship in user.friends_incoming:
            if friendship.friend_a_id == friend.id:
                friendship.confirmed = True
                return
        for friendship in user.friends_outgoing:
            if friendship.friend_b_id == friend.id:
                raise Exception("Friend request already sent")

        friendship = m.Friendship(friend_a_id=user.id, friend_b_id=friend.id)
        db.add(friendship)
        db.flush()

    @strawberry.mutation
    def remove_friend(self, info: Info, username: str) -> None:
        db = info.context["db"]
        user = get_me_or_die(info, "Anonymous users can't remove friends")
        friend = by_username(info, username)
        if not friend:
            raise Exception("User not found")
        db.query(m.Friendship).filter(
            or_(
                and_(
                    m.Friendship.friend_a_id == user.id,
                    m.Friendship.friend_b_id == friend.id,
                ),
                and_(
                    m.Friendship.friend_a_id == friend.id,
                    m.Friendship.friend_b_id == user.id,
                ),
            )
        ).delete()
        db.flush()

    ###################################################################
    # Surveys
    @strawberry.mutation(graphql_type=Survey)
    def create_survey(self, info: Info, survey: SurveyInput) -> m.Survey:
        db = info.context["db"]
        user = get_me_or_die(info, "Anonymous users can't create surveys")

        # make sure the new survey has an ID
        new_survey = m.Survey(
            name=survey.name,
            description=survey.description,
            long_description=survey.long_description,
            user_id=user.id,
        )
        db.add(new_survey)
        db.flush()

        return new_survey

    @strawberry.mutation(graphql_type=Question)
    def add_question(
        self, info: Info, survey_id: int, question: QuestionInput
    ) -> m.Question:
        db = info.context["db"]
        user = get_me_or_die(info, "Anonymous users can't add questions")
        survey = db.get(m.Survey, survey_id)
        if not survey:
            raise Exception("Survey not found")

        q = m.Question(
            survey_id=survey.id,
            order=question.order or 0,
            section=question.section or "",
            text=question.text,
            flip=question.flip,
            extra=question.extra,
        )
        db.add(q)
        db.flush()

        return q

    @strawberry.mutation(graphql_type=Question)
    def update_question(
        self, info: Info, question_id: int, question: QuestionInput
    ) -> m.Question:
        db = info.context["db"]
        user = get_me_or_die(info, "Anonymous users can't update questions")
        q = db.get(m.Question, question_id)
        if not q:
            raise Exception("Question not found")
        if q.survey.owner != user:
            raise Exception("You can't edit other people's surveys")

        q.order = question.order or 0
        q.section = question.section or ""
        q.text = question.text
        q.flip = question.flip
        q.extra = question.extra
        db.flush()
        return q

    ###################################################################
    # Responses
    @strawberry.mutation(graphql_type=Response)
    def save_response(
        self, info: Info, survey_id: int, response: ResponseInput
    ) -> m.Response:
        db = info.context["db"]
        user = get_me_or_die(info, "Anonymous users can't save responses")
        survey = db.get(m.Survey, survey_id)
        if not survey:
            raise Exception("Survey not found")

        db_response = (
            db.scalars(
                select(m.Response).where(
                    m.Response.survey_id == survey.id, m.Response.user_id == user.id
                )
            )
            .first()
        )
        if not db_response:
            db_response = m.Response(
                survey_id=survey.id,
                user_id=user.id,
                privacy=response.privacy,
            )
            db.add(db_response)
        else:
            db_response.privacy = response.privacy
        db.flush()
        return db_response
    
    @strawberry.mutation(graphql_type=Answer)
    def save_answer(
        self, info: Info, question_id: int, answer: AnswerInput
    ) -> m.Answer:
        db = info.context["db"]
        user = get_me_or_die(info, "Anonymous users can't save answers")
        question = db.get(m.Question, question_id)
        if not question:
            raise Exception("Question not found")
        
        response = (
            db.execute(
                select(m.Response).where(
                    m.Response.survey_id == question.survey_id, m.Response.user_id == user.id
                )
            )
            .scalars()
            .one()
        )
        a = db.get(m.Answer, (response.id, question_id))
        if not a:
            a = m.Answer(
                response_id=response.id,
                question_id=question_id,
                value=answer.value,
                flip=answer.flip,
            )
            db.add(a)
        else:
            a.value = answer.value
            a.flip = answer.flip
        db.flush()
        return a


#######################################################################
# Utils

def validate_new_username(info: Info, username: str) -> None:
    if not username:
        raise Exception("Username is required")
    if len(username) >= 32:
        raise Exception("Username needs to be less than 32 characters")
    if not re.match(r"^[a-zA-Z0-9_]+$", username):
        raise Exception("Username can only contain letters, numbers, and underscores")
    if existing := by_username(info, username):
        me = get_me(info)
        if not me or existing.id != me.id:
            raise Exception("Another user with that name already exists")


def validate_new_password(password1: str, password2: str) -> None:
    if not password1 or password1 != password2:
        raise Exception("Bad password")


def get_me(info: Info) -> t.Optional[m.User]:
    return by_username(info, info.context["cookie"].get("username"))


def get_me_or_die(info: Info, msg: str) -> m.User:
    user = get_me(info)
    if not user:
        raise Exception(msg)
    return user


def by_username(info: Info, username: t.Optional[str]) -> t.Optional[m.User]:
    if not username:
        return None
    cache = info.context["cache"]
    db = info.context["db"]
    key = f"user-{username}"
    if key not in cache:
        stmt = select(m.User).where(func.lower(m.User.username) == func.lower(username))
        cache[key] = db.execute(stmt).scalars().first()
    return cache[key]


#######################################################################
# Schema

strawberry_sqlalchemy_mapper.finalize()
schema = strawberry.Schema(query=Query, mutation=Mutation, extensions=[QueryCounter])
