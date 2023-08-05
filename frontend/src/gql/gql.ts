/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n    query getOtherResponses($surveyId: Int!) {\n        survey(surveyId: $surveyId) {\n            responses {\n                id\n                owner {\n                    username\n                    isFriend\n                }\n            }\n        }\n    }\n": types.GetOtherResponsesDocument,
    "\n    mutation updateUser(\n        $password: String!\n        $username: String!\n        $password1: String!\n        $password2: String!\n        $email: String!\n    ) {\n        updateUser(\n            password: $password\n            username: $username\n            password1: $password1\n            password2: $password2\n            email: $email\n        ) {\n            ...UserLogin\n        }\n    }\n": types.UpdateUserDocument,
    "\n    query getSurveys {\n        surveys {\n            id\n            name\n            description\n            stats {\n                unansweredQuestions\n                friendResponses\n                otherResponses\n            }\n        }\n    }\n": types.GetSurveysDocument,
    "\n    mutation saveResponse($surveyId: Int!, $response: ResponseInput!) {\n        saveResponse(surveyId: $surveyId, response: $response) {\n            ...ResponseWithAnswers\n        }\n    }\n": types.SaveResponseDocument,
    "\n    fragment MyAnswer on Answer {\n        id\n        questionId\n        value\n        flip\n    }\n": types.MyAnswerFragmentDoc,
    "\n    mutation saveAnswer($questionId: Int!, $value: WWW!, $flip: WWW!) {\n        saveAnswer(questionId: $questionId, answer: {value: $value, flip: $flip}) {\n            ...MyAnswer\n        }\n    }\n": types.SaveAnswerDocument,
    "\n    query getFriends {\n        me: user {\n            friends {\n                username\n            }\n            friendsOutgoing {\n                username\n            }\n            friendsIncoming {\n                username\n            }\n        }\n    }\n": types.GetFriendsDocument,
    "\n    mutation addFriend($username: String!) {\n        addFriend(username: $username)\n    }\n": types.AddFriendDocument,
    "\n    mutation removeFriend($username: String!) {\n        removeFriend(username: $username)\n    }\n": types.RemoveFriendDocument,
    "\n    fragment ResponseWithComparison on Response {\n        id\n        owner {\n            username\n        }\n        survey {\n            id\n            name\n            longDescription\n        }\n        comparison {\n            section\n            order\n            text\n            flip\n            mine\n            theirs\n        }\n    }\n": types.ResponseWithComparisonFragmentDoc,
    "\n    query getResponse($responseId: Int!) {\n        response(responseId: $responseId) {\n            ...ResponseWithComparison\n        }\n    }\n": types.GetResponseDocument,
    "\n    fragment ResponseWithAnswers on Response {\n        id\n        privacy\n        answers {\n            ...MyAnswer\n        }\n    }\n": types.ResponseWithAnswersFragmentDoc,
    "\n    fragment SurveyWithResponse on Survey {\n        id\n        name\n        description\n        longDescription\n        owner {\n            username\n        }\n        questions {\n            id\n            section\n            order\n            text\n            flip\n            extra\n        }\n        myResponse {\n            ...ResponseWithAnswers\n        }\n    }\n": types.SurveyWithResponseFragmentDoc,
    "\n    query getSurvey($surveyId: Int!) {\n        survey(surveyId: $surveyId) {\n            ...SurveyWithResponse\n        }\n    }\n": types.GetSurveyDocument,
    "\n    fragment UserLogin on User {\n        username\n        email\n    }\n": types.UserLoginFragmentDoc,
    "\n    query getMe {\n        me: user {\n            ...UserLogin\n        }\n    }\n": types.GetMeDocument,
    "\n    mutation createUser(\n        $username: String!\n        $password1: String!\n        $password2: String!\n        $email: String!\n    ) {\n        createUser(\n            username: $username\n            password1: $password1\n            password2: $password2\n            email: $email\n        ) {\n            ...UserLogin\n        }\n    }\n": types.CreateUserDocument,
    "\n    mutation login($username: String!, $password: String!) {\n        login(username: $username, password: $password) {\n            ...UserLogin\n        }\n    }\n": types.LoginDocument,
    "\n    mutation logout {\n        logout\n    }\n": types.LogoutDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query getOtherResponses($surveyId: Int!) {\n        survey(surveyId: $surveyId) {\n            responses {\n                id\n                owner {\n                    username\n                    isFriend\n                }\n            }\n        }\n    }\n"): (typeof documents)["\n    query getOtherResponses($surveyId: Int!) {\n        survey(surveyId: $surveyId) {\n            responses {\n                id\n                owner {\n                    username\n                    isFriend\n                }\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation updateUser(\n        $password: String!\n        $username: String!\n        $password1: String!\n        $password2: String!\n        $email: String!\n    ) {\n        updateUser(\n            password: $password\n            username: $username\n            password1: $password1\n            password2: $password2\n            email: $email\n        ) {\n            ...UserLogin\n        }\n    }\n"): (typeof documents)["\n    mutation updateUser(\n        $password: String!\n        $username: String!\n        $password1: String!\n        $password2: String!\n        $email: String!\n    ) {\n        updateUser(\n            password: $password\n            username: $username\n            password1: $password1\n            password2: $password2\n            email: $email\n        ) {\n            ...UserLogin\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query getSurveys {\n        surveys {\n            id\n            name\n            description\n            stats {\n                unansweredQuestions\n                friendResponses\n                otherResponses\n            }\n        }\n    }\n"): (typeof documents)["\n    query getSurveys {\n        surveys {\n            id\n            name\n            description\n            stats {\n                unansweredQuestions\n                friendResponses\n                otherResponses\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation saveResponse($surveyId: Int!, $response: ResponseInput!) {\n        saveResponse(surveyId: $surveyId, response: $response) {\n            ...ResponseWithAnswers\n        }\n    }\n"): (typeof documents)["\n    mutation saveResponse($surveyId: Int!, $response: ResponseInput!) {\n        saveResponse(surveyId: $surveyId, response: $response) {\n            ...ResponseWithAnswers\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment MyAnswer on Answer {\n        id\n        questionId\n        value\n        flip\n    }\n"): (typeof documents)["\n    fragment MyAnswer on Answer {\n        id\n        questionId\n        value\n        flip\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation saveAnswer($questionId: Int!, $value: WWW!, $flip: WWW!) {\n        saveAnswer(questionId: $questionId, answer: {value: $value, flip: $flip}) {\n            ...MyAnswer\n        }\n    }\n"): (typeof documents)["\n    mutation saveAnswer($questionId: Int!, $value: WWW!, $flip: WWW!) {\n        saveAnswer(questionId: $questionId, answer: {value: $value, flip: $flip}) {\n            ...MyAnswer\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query getFriends {\n        me: user {\n            friends {\n                username\n            }\n            friendsOutgoing {\n                username\n            }\n            friendsIncoming {\n                username\n            }\n        }\n    }\n"): (typeof documents)["\n    query getFriends {\n        me: user {\n            friends {\n                username\n            }\n            friendsOutgoing {\n                username\n            }\n            friendsIncoming {\n                username\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation addFriend($username: String!) {\n        addFriend(username: $username)\n    }\n"): (typeof documents)["\n    mutation addFriend($username: String!) {\n        addFriend(username: $username)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation removeFriend($username: String!) {\n        removeFriend(username: $username)\n    }\n"): (typeof documents)["\n    mutation removeFriend($username: String!) {\n        removeFriend(username: $username)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment ResponseWithComparison on Response {\n        id\n        owner {\n            username\n        }\n        survey {\n            id\n            name\n            longDescription\n        }\n        comparison {\n            section\n            order\n            text\n            flip\n            mine\n            theirs\n        }\n    }\n"): (typeof documents)["\n    fragment ResponseWithComparison on Response {\n        id\n        owner {\n            username\n        }\n        survey {\n            id\n            name\n            longDescription\n        }\n        comparison {\n            section\n            order\n            text\n            flip\n            mine\n            theirs\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query getResponse($responseId: Int!) {\n        response(responseId: $responseId) {\n            ...ResponseWithComparison\n        }\n    }\n"): (typeof documents)["\n    query getResponse($responseId: Int!) {\n        response(responseId: $responseId) {\n            ...ResponseWithComparison\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment ResponseWithAnswers on Response {\n        id\n        privacy\n        answers {\n            ...MyAnswer\n        }\n    }\n"): (typeof documents)["\n    fragment ResponseWithAnswers on Response {\n        id\n        privacy\n        answers {\n            ...MyAnswer\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment SurveyWithResponse on Survey {\n        id\n        name\n        description\n        longDescription\n        owner {\n            username\n        }\n        questions {\n            id\n            section\n            order\n            text\n            flip\n            extra\n        }\n        myResponse {\n            ...ResponseWithAnswers\n        }\n    }\n"): (typeof documents)["\n    fragment SurveyWithResponse on Survey {\n        id\n        name\n        description\n        longDescription\n        owner {\n            username\n        }\n        questions {\n            id\n            section\n            order\n            text\n            flip\n            extra\n        }\n        myResponse {\n            ...ResponseWithAnswers\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query getSurvey($surveyId: Int!) {\n        survey(surveyId: $surveyId) {\n            ...SurveyWithResponse\n        }\n    }\n"): (typeof documents)["\n    query getSurvey($surveyId: Int!) {\n        survey(surveyId: $surveyId) {\n            ...SurveyWithResponse\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment UserLogin on User {\n        username\n        email\n    }\n"): (typeof documents)["\n    fragment UserLogin on User {\n        username\n        email\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query getMe {\n        me: user {\n            ...UserLogin\n        }\n    }\n"): (typeof documents)["\n    query getMe {\n        me: user {\n            ...UserLogin\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation createUser(\n        $username: String!\n        $password1: String!\n        $password2: String!\n        $email: String!\n    ) {\n        createUser(\n            username: $username\n            password1: $password1\n            password2: $password2\n            email: $email\n        ) {\n            ...UserLogin\n        }\n    }\n"): (typeof documents)["\n    mutation createUser(\n        $username: String!\n        $password1: String!\n        $password2: String!\n        $email: String!\n    ) {\n        createUser(\n            username: $username\n            password1: $password1\n            password2: $password2\n            email: $email\n        ) {\n            ...UserLogin\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation login($username: String!, $password: String!) {\n        login(username: $username, password: $password) {\n            ...UserLogin\n        }\n    }\n"): (typeof documents)["\n    mutation login($username: String!, $password: String!) {\n        login(username: $username, password: $password) {\n            ...UserLogin\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation logout {\n        logout\n    }\n"): (typeof documents)["\n    mutation logout {\n        logout\n    }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;