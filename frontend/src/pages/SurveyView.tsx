import React, { useContext } from "react";
import { useQuery } from "@apollo/client";
import { graphql, useFragment as fragCast } from "../gql";
import { Navigate, useParams } from "react-router-dom";
import { ErrorPage } from "../components/ErrorPage";
import { LoadingPage } from "../components/LoadingPage";
import css from "./SurveyView.module.scss";
import { Page } from "../components/Page";
import { OtherResponses } from "../components/OtherResponses";
import { UserContext } from "../providers/LoginProvider";
import { SurveyQuestions } from "../components/SurveyQuestions";
import { SurveyDescription } from "../components/SurveyDescription";
import { SurveyPrivacy } from "../components/SurveyPrivacy";
import { AddQuestion } from "../components/AddQuestion";

const RESPONSE_WITH_ANSWERS = graphql(`
    fragment ResponseWithAnswers on Response {
        id
        privacy
        answers {
            ...MyAnswer
        }
    }
`);

const SURVEY_VIEW_FRAGMENT = graphql(`
    fragment SurveyView on Survey {
        id
        name
        description
        longDescription
        owner {
            username
        }
        questions {
            id
            section
            order
            text
            flip
            extra
        }
    }
`);
const SURVEY_RESPONSE_FRAGMENT = graphql(`
    fragment SurveyResponse on Survey {
        myResponse {
            ...ResponseWithAnswers
        }
    }
`);

export const GET_SURVEY = graphql(`
    query getSurvey($surveyId: Int!) {
        survey(surveyId: $surveyId) {
            ...SurveyView
            ...SurveyResponse
        }
    }
`);

export function SurveyView() {
    ///////////////////////////////////////////////////////////////////
    // Hooks
    const { survey_id } = useParams();
    const { me } = useContext(UserContext);
    const q = useQuery(GET_SURVEY, {
        variables: { surveyId: parseInt(survey_id!, 10) },
    });
    if (!me) {
        return <Navigate to="/" />;
    }

    ///////////////////////////////////////////////////////////////////
    // Hook edge case handling
    if (q.loading) {
        return <LoadingPage />;
    }
    if (q.error) {
        return <ErrorPage error={q.error} />;
    }
    const survey = fragCast(SURVEY_VIEW_FRAGMENT, q.data?.survey);
    if (!survey) {
        return (
            <ErrorPage
                error={{ message: `No survey with the ID ${survey_id}` }}
            />
        );
    }

    ///////////////////////////////////////////////////////////////////
    // Render
    const myResponse = fragCast(RESPONSE_WITH_ANSWERS, fragCast(SURVEY_RESPONSE_FRAGMENT, q.data?.survey)?.myResponse);

    return (
        <Page title={survey.name} className={css.page}>
            <SurveyDescription survey={survey} />
            <SurveyPrivacy survey={survey} response={myResponse} />
            {myResponse && <SurveyQuestions survey={survey} response={myResponse} />}
            {myResponse && <AddQuestion survey={survey} />}
            {myResponse && <OtherResponses survey_id={survey.id} />}
        </Page>
    );
}
