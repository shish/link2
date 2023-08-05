import React from "react";
import { SurveyWithResponseFragment } from "../gql/graphql";


export function SurveyDescription({
    survey,
}: {
    survey: SurveyWithResponseFragment;
}): React.ReactElement {
    return (
        <section style={{gridArea: "description"}}>
            <h3>{survey.description}</h3>
            <p>{survey.longDescription}</p>
            <p>Created by {survey.owner.username}</p>
        </section>
    );
}
