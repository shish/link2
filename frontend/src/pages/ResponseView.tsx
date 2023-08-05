import { useQuery } from "@apollo/client";
import { useContext } from "react";
import { Navigate, useParams } from "react-router-dom";
import { graphql } from "../gql";
import { UserContext } from "../providers/LoginProvider";
import { Page } from "../components/Page";
import { LoadingPage } from "../components/LoadingPage";
import { ErrorPage } from "../components/ErrorPage";
import css from "./ResponseView.module.scss";
import { CompareIntro } from "../components/CompareIntro";
import { CompareSection } from "../components/CompareSection";
import { OtherResponses } from "../components/OtherResponses";
import { Section } from "../components/Section";
import { Comparison } from "../gql/graphql";
import { useFragment as fragCast } from "../gql";

export const RESPONSE_WITH_COMPARISON = graphql(`
    fragment ResponseWithComparison on Response {
        id
        owner {
            username
        }
        survey {
            id
            name
            longDescription
        }
        comparison {
            section
            order
            text
            flip
            mine
            theirs
        }
    }
`);


export const GET_RESPONSE = graphql(`
    query getResponse($responseId: Int!) {
        response(responseId: $responseId) {
            ...ResponseWithComparison
        }
    }
`);

export function ResponseView() {
    ///////////////////////////////////////////////////////////////////
    // Hooks
    const { response_id } = useParams();
    const { me } = useContext(UserContext);
    const q = useQuery(GET_RESPONSE, {
        variables: { responseId: parseInt(response_id!, 10) },
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
    const response = fragCast(RESPONSE_WITH_COMPARISON, q.data?.response);
    if (!response) {
        return (
            <ErrorPage
                error={{ message: `No response with the ID ${response_id}` }}
            />
        );
    }

    ///////////////////////////////////////////////////////////////////
    // Render
    const sections = response.comparison.map((c) => c.section).sort();
    let section_comparisons: Record<string, Array<Comparison>> = {};
    sections.forEach((s) => {
        section_comparisons[s] = response.comparison.filter(
            (c) => c.section === s,
        );
    });

    return (
        <Page title="Compare" className={css.page}>
            <CompareIntro response={response} />

            <Section className={css.answers}>
                {Object.entries(section_comparisons).map(
                    ([section, comparisons]) => (
                        <CompareSection
                            key={section}
                            section={section}
                            comparisons={comparisons}
                        />
                    ),
                )}
            </Section>

            <OtherResponses survey_id={response.survey.id} />
        </Page>
    );
}
