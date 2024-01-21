import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import {
    Privacy, ResponseWithAnswersFragment, SurveyViewFragment
} from "../gql/graphql";
import { GET_SURVEY } from "../pages/SurveyView";
import { graphql } from "../gql";


export const SAVE_RESPONSE = graphql(`
    mutation saveResponse($surveyId: Int!, $response: ResponseInput!) {
        saveResponse(surveyId: $surveyId, response: $response) {
            ...ResponseWithAnswers
        }
    }
`);


export function SurveyPrivacy({
    survey, response,
}: {
    survey: SurveyViewFragment;
    response: ResponseWithAnswersFragment | null | undefined;
}): React.ReactElement {
    const [privacy, setPrivacy] = useState(response?.privacy);
    const [saveResponseMutation, saveResponseQ] = useMutation(SAVE_RESPONSE, {
        refetchQueries: [GET_SURVEY],
        onError: (error) => {
            alert(error);
        },
    });

    function setPrivacyAndSave(privacy: Privacy) {
        setPrivacy(privacy);
        saveResponseMutation({
            variables: {
                surveyId: survey.id,
                response: { privacy },
            },
        });
    }

    const my_link = window.location.protocol +
        "//" +
        window.location.host +
        "/response/" +
        response?.id;

    return (
        <section style={{gridArea: "privacy"}}>
            <h3>Privacy</h3>
            <select
                onChange={(e) => e.target.value && setPrivacyAndSave(e.target.value as Privacy)}
                value={privacy}
                disabled={saveResponseQ.loading}
            >
                {!privacy && <option>
                    Select a privacy setting (Can be changed any time)
                </option>}
                <option value={Privacy.Friends}>
                    Friends (Friends can see, others can't)
                </option>
                <option value={Privacy.Anonymous}>
                    Anonymous (Response will be given an ID number, not linked
                    to an account)
                </option>
                <option value={Privacy.Public}>
                    Public (Show up in the list of people who answered)
                </option>
            </select>

            {response && (
                <>
                    <p>
                        Give this link to someone so they can compare with you:
                    </p>
                    <form>
                        <input type="text" value={my_link} disabled={true} />
                        <br />
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                navigator.clipboard.writeText(my_link);
                            }}
                        >
                            Copy to clipboard
                        </button>
                    </form>
                </>
            )}
        </section>
    );
}
