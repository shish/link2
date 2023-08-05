/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Represents NULL values */
  Void: { input: any; output: any; }
};

export type Answer = {
  __typename?: 'Answer';
  flip: Www;
  id: Scalars['Int']['output'];
  question: Question;
  questionId: Scalars['Int']['output'];
  value: Www;
};

export type AnswerInput = {
  flip?: Www;
  value: Www;
};

export type Comparison = {
  __typename?: 'Comparison';
  flip?: Maybe<Scalars['String']['output']>;
  mine: Www;
  order: Scalars['Float']['output'];
  section: Scalars['String']['output'];
  text: Scalars['String']['output'];
  theirs: Www;
};

export type Mutation = {
  __typename?: 'Mutation';
  addFriend?: Maybe<Scalars['Void']['output']>;
  addQuestion: Question;
  createSurvey: Survey;
  createUser?: Maybe<User>;
  login?: Maybe<User>;
  logout?: Maybe<Scalars['Void']['output']>;
  removeFriend?: Maybe<Scalars['Void']['output']>;
  saveAnswer: Answer;
  saveResponse: Response;
  updateQuestion: Question;
  updateUser: User;
};


export type MutationAddFriendArgs = {
  username: Scalars['String']['input'];
};


export type MutationAddQuestionArgs = {
  question: QuestionInput;
  surveyId: Scalars['Int']['input'];
};


export type MutationCreateSurveyArgs = {
  survey: SurveyInput;
};


export type MutationCreateUserArgs = {
  email: Scalars['String']['input'];
  password1: Scalars['String']['input'];
  password2: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationRemoveFriendArgs = {
  username: Scalars['String']['input'];
};


export type MutationSaveAnswerArgs = {
  answer: AnswerInput;
  questionId: Scalars['Int']['input'];
};


export type MutationSaveResponseArgs = {
  response: ResponseInput;
  surveyId: Scalars['Int']['input'];
};


export type MutationUpdateQuestionArgs = {
  question: QuestionInput;
  questionId: Scalars['Int']['input'];
};


export type MutationUpdateUserArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  password1: Scalars['String']['input'];
  password2: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export enum Privacy {
  Anonymous = 'ANONYMOUS',
  Friends = 'FRIENDS',
  Public = 'PUBLIC'
}

export type Query = {
  __typename?: 'Query';
  response: Response;
  survey: Survey;
  surveys: Array<Survey>;
  user?: Maybe<User>;
};


export type QueryResponseArgs = {
  responseId: Scalars['Int']['input'];
};


export type QuerySurveyArgs = {
  surveyId: Scalars['Int']['input'];
};


export type QueryUserArgs = {
  username?: InputMaybe<Scalars['String']['input']>;
};

export type Question = {
  __typename?: 'Question';
  extra?: Maybe<Scalars['String']['output']>;
  flip?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  order: Scalars['Float']['output'];
  section: Scalars['String']['output'];
  text: Scalars['String']['output'];
};

export type QuestionInput = {
  extra?: InputMaybe<Scalars['String']['input']>;
  flip?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Float']['input']>;
  section?: InputMaybe<Scalars['String']['input']>;
  text: Scalars['String']['input'];
};

export type Response = {
  __typename?: 'Response';
  answers: Array<Answer>;
  comparison: Array<Comparison>;
  id: Scalars['Int']['output'];
  owner?: Maybe<User>;
  privacy: Privacy;
  survey: Survey;
};

export type ResponseInput = {
  privacy: Privacy;
};

export type Survey = {
  __typename?: 'Survey';
  description: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  longDescription: Scalars['String']['output'];
  myResponse?: Maybe<Response>;
  name: Scalars['String']['output'];
  owner: User;
  questions: Array<Question>;
  responses: Array<Response>;
  stats?: Maybe<SurveyStats>;
};

export type SurveyInput = {
  description: Scalars['String']['input'];
  longDescription: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type SurveyStats = {
  __typename?: 'SurveyStats';
  friendResponses: Scalars['Int']['output'];
  otherResponses: Scalars['Int']['output'];
  unansweredQuestions: Scalars['Int']['output'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  friends: Array<User>;
  friendsIncoming: Array<User>;
  friendsOutgoing: Array<User>;
  isFriend: Scalars['Boolean']['output'];
  username: Scalars['String']['output'];
};

export enum Www {
  Na = 'NA',
  Want = 'WANT',
  Will = 'WILL',
  Wont = 'WONT'
}

export type GetOtherResponsesQueryVariables = Exact<{
  surveyId: Scalars['Int']['input'];
}>;


export type GetOtherResponsesQuery = { __typename?: 'Query', survey: { __typename?: 'Survey', responses: Array<{ __typename?: 'Response', id: number, owner?: { __typename?: 'User', username: string, isFriend: boolean } | null }> } };

export type UpdateUserMutationVariables = Exact<{
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
  password1: Scalars['String']['input'];
  password2: Scalars['String']['input'];
  email: Scalars['String']['input'];
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: (
    { __typename?: 'User' }
    & { ' $fragmentRefs'?: { 'UserLoginFragment': UserLoginFragment } }
  ) };

export type GetSurveysQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSurveysQuery = { __typename?: 'Query', surveys: Array<{ __typename?: 'Survey', id: number, name: string, description: string, stats?: { __typename?: 'SurveyStats', unansweredQuestions: number, friendResponses: number, otherResponses: number } | null }> };

export type SaveResponseMutationVariables = Exact<{
  surveyId: Scalars['Int']['input'];
  response: ResponseInput;
}>;


export type SaveResponseMutation = { __typename?: 'Mutation', saveResponse: (
    { __typename?: 'Response' }
    & { ' $fragmentRefs'?: { 'ResponseWithAnswersFragment': ResponseWithAnswersFragment } }
  ) };

export type MyAnswerFragment = { __typename?: 'Answer', id: number, questionId: number, value: Www, flip: Www } & { ' $fragmentName'?: 'MyAnswerFragment' };

export type SaveAnswerMutationVariables = Exact<{
  questionId: Scalars['Int']['input'];
  value: Www;
  flip: Www;
}>;


export type SaveAnswerMutation = { __typename?: 'Mutation', saveAnswer: (
    { __typename?: 'Answer' }
    & { ' $fragmentRefs'?: { 'MyAnswerFragment': MyAnswerFragment } }
  ) };

export type GetFriendsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFriendsQuery = { __typename?: 'Query', me?: { __typename?: 'User', friends: Array<{ __typename?: 'User', username: string }>, friendsOutgoing: Array<{ __typename?: 'User', username: string }>, friendsIncoming: Array<{ __typename?: 'User', username: string }> } | null };

export type AddFriendMutationVariables = Exact<{
  username: Scalars['String']['input'];
}>;


export type AddFriendMutation = { __typename?: 'Mutation', addFriend?: any | null };

export type RemoveFriendMutationVariables = Exact<{
  username: Scalars['String']['input'];
}>;


export type RemoveFriendMutation = { __typename?: 'Mutation', removeFriend?: any | null };

export type ResponseWithComparisonFragment = { __typename?: 'Response', id: number, owner?: { __typename?: 'User', username: string } | null, survey: { __typename?: 'Survey', id: number, name: string, longDescription: string }, comparison: Array<{ __typename?: 'Comparison', section: string, order: number, text: string, flip?: string | null, mine: Www, theirs: Www }> } & { ' $fragmentName'?: 'ResponseWithComparisonFragment' };

export type GetResponseQueryVariables = Exact<{
  responseId: Scalars['Int']['input'];
}>;


export type GetResponseQuery = { __typename?: 'Query', response: (
    { __typename?: 'Response' }
    & { ' $fragmentRefs'?: { 'ResponseWithComparisonFragment': ResponseWithComparisonFragment } }
  ) };

export type ResponseWithAnswersFragment = { __typename?: 'Response', id: number, privacy: Privacy, answers: Array<(
    { __typename?: 'Answer' }
    & { ' $fragmentRefs'?: { 'MyAnswerFragment': MyAnswerFragment } }
  )> } & { ' $fragmentName'?: 'ResponseWithAnswersFragment' };

export type SurveyWithResponseFragment = { __typename?: 'Survey', id: number, name: string, description: string, longDescription: string, owner: { __typename?: 'User', username: string }, questions: Array<{ __typename?: 'Question', id: number, section: string, order: number, text: string, flip?: string | null, extra?: string | null }>, myResponse?: (
    { __typename?: 'Response' }
    & { ' $fragmentRefs'?: { 'ResponseWithAnswersFragment': ResponseWithAnswersFragment } }
  ) | null } & { ' $fragmentName'?: 'SurveyWithResponseFragment' };

export type GetSurveyQueryVariables = Exact<{
  surveyId: Scalars['Int']['input'];
}>;


export type GetSurveyQuery = { __typename?: 'Query', survey: (
    { __typename?: 'Survey' }
    & { ' $fragmentRefs'?: { 'SurveyWithResponseFragment': SurveyWithResponseFragment } }
  ) };

export type UserLoginFragment = { __typename?: 'User', username: string, email: string } & { ' $fragmentName'?: 'UserLoginFragment' };

export type GetMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeQuery = { __typename?: 'Query', me?: (
    { __typename?: 'User' }
    & { ' $fragmentRefs'?: { 'UserLoginFragment': UserLoginFragment } }
  ) | null };

export type CreateUserMutationVariables = Exact<{
  username: Scalars['String']['input'];
  password1: Scalars['String']['input'];
  password2: Scalars['String']['input'];
  email: Scalars['String']['input'];
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser?: (
    { __typename?: 'User' }
    & { ' $fragmentRefs'?: { 'UserLoginFragment': UserLoginFragment } }
  ) | null };

export type LoginMutationVariables = Exact<{
  username: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login?: (
    { __typename?: 'User' }
    & { ' $fragmentRefs'?: { 'UserLoginFragment': UserLoginFragment } }
  ) | null };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout?: any | null };

export const ResponseWithComparisonFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ResponseWithComparison"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Response"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"survey"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"longDescription"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comparison"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"section"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"flip"}},{"kind":"Field","name":{"kind":"Name","value":"mine"}},{"kind":"Field","name":{"kind":"Name","value":"theirs"}}]}}]}}]} as unknown as DocumentNode<ResponseWithComparisonFragment, unknown>;
export const MyAnswerFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MyAnswer"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Answer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"questionId"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"flip"}}]}}]} as unknown as DocumentNode<MyAnswerFragment, unknown>;
export const ResponseWithAnswersFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ResponseWithAnswers"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Response"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"privacy"}},{"kind":"Field","name":{"kind":"Name","value":"answers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MyAnswer"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MyAnswer"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Answer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"questionId"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"flip"}}]}}]} as unknown as DocumentNode<ResponseWithAnswersFragment, unknown>;
export const SurveyWithResponseFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SurveyWithResponse"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Survey"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"longDescription"}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"questions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"section"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"flip"}},{"kind":"Field","name":{"kind":"Name","value":"extra"}}]}},{"kind":"Field","name":{"kind":"Name","value":"myResponse"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ResponseWithAnswers"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MyAnswer"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Answer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"questionId"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"flip"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ResponseWithAnswers"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Response"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"privacy"}},{"kind":"Field","name":{"kind":"Name","value":"answers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MyAnswer"}}]}}]}}]} as unknown as DocumentNode<SurveyWithResponseFragment, unknown>;
export const UserLoginFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserLogin"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<UserLoginFragment, unknown>;
export const GetOtherResponsesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getOtherResponses"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"surveyId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"survey"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"surveyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"surveyId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"responses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"isFriend"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetOtherResponsesQuery, GetOtherResponsesQueryVariables>;
export const UpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"username"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password1"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password2"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}},{"kind":"Argument","name":{"kind":"Name","value":"username"},"value":{"kind":"Variable","name":{"kind":"Name","value":"username"}}},{"kind":"Argument","name":{"kind":"Name","value":"password1"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password1"}}},{"kind":"Argument","name":{"kind":"Name","value":"password2"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password2"}}},{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserLogin"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserLogin"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<UpdateUserMutation, UpdateUserMutationVariables>;
export const GetSurveysDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getSurveys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"surveys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unansweredQuestions"}},{"kind":"Field","name":{"kind":"Name","value":"friendResponses"}},{"kind":"Field","name":{"kind":"Name","value":"otherResponses"}}]}}]}}]}}]} as unknown as DocumentNode<GetSurveysQuery, GetSurveysQueryVariables>;
export const SaveResponseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"saveResponse"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"surveyId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"response"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ResponseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveResponse"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"surveyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"surveyId"}}},{"kind":"Argument","name":{"kind":"Name","value":"response"},"value":{"kind":"Variable","name":{"kind":"Name","value":"response"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ResponseWithAnswers"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MyAnswer"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Answer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"questionId"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"flip"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ResponseWithAnswers"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Response"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"privacy"}},{"kind":"Field","name":{"kind":"Name","value":"answers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MyAnswer"}}]}}]}}]} as unknown as DocumentNode<SaveResponseMutation, SaveResponseMutationVariables>;
export const SaveAnswerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"saveAnswer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"questionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"value"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"WWW"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"flip"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"WWW"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveAnswer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"questionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"questionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"answer"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"value"},"value":{"kind":"Variable","name":{"kind":"Name","value":"value"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"flip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"flip"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MyAnswer"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MyAnswer"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Answer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"questionId"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"flip"}}]}}]} as unknown as DocumentNode<SaveAnswerMutation, SaveAnswerMutationVariables>;
export const GetFriendsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getFriends"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"me"},"name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"friends"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"friendsOutgoing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"friendsIncoming"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"username"}}]}}]}}]}}]} as unknown as DocumentNode<GetFriendsQuery, GetFriendsQueryVariables>;
export const AddFriendDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"addFriend"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"username"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addFriend"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"username"},"value":{"kind":"Variable","name":{"kind":"Name","value":"username"}}}]}]}}]} as unknown as DocumentNode<AddFriendMutation, AddFriendMutationVariables>;
export const RemoveFriendDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"removeFriend"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"username"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeFriend"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"username"},"value":{"kind":"Variable","name":{"kind":"Name","value":"username"}}}]}]}}]} as unknown as DocumentNode<RemoveFriendMutation, RemoveFriendMutationVariables>;
export const GetResponseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getResponse"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"responseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"response"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"responseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"responseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ResponseWithComparison"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ResponseWithComparison"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Response"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"survey"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"longDescription"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comparison"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"section"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"flip"}},{"kind":"Field","name":{"kind":"Name","value":"mine"}},{"kind":"Field","name":{"kind":"Name","value":"theirs"}}]}}]}}]} as unknown as DocumentNode<GetResponseQuery, GetResponseQueryVariables>;
export const GetSurveyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getSurvey"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"surveyId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"survey"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"surveyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"surveyId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SurveyWithResponse"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MyAnswer"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Answer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"questionId"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"flip"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ResponseWithAnswers"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Response"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"privacy"}},{"kind":"Field","name":{"kind":"Name","value":"answers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MyAnswer"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SurveyWithResponse"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Survey"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"longDescription"}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"questions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"section"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"flip"}},{"kind":"Field","name":{"kind":"Name","value":"extra"}}]}},{"kind":"Field","name":{"kind":"Name","value":"myResponse"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ResponseWithAnswers"}}]}}]}}]} as unknown as DocumentNode<GetSurveyQuery, GetSurveyQueryVariables>;
export const GetMeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"me"},"name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserLogin"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserLogin"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<GetMeQuery, GetMeQueryVariables>;
export const CreateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"username"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password1"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password2"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"username"},"value":{"kind":"Variable","name":{"kind":"Name","value":"username"}}},{"kind":"Argument","name":{"kind":"Name","value":"password1"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password1"}}},{"kind":"Argument","name":{"kind":"Name","value":"password2"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password2"}}},{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserLogin"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserLogin"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<CreateUserMutation, CreateUserMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"username"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"username"},"value":{"kind":"Variable","name":{"kind":"Name","value":"username"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserLogin"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserLogin"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;