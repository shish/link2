import React from "react";
import { SurveyViewFragment } from "../gql/graphql";


export function SurveyDescription({
    survey,
}: {
    survey: SurveyViewFragment;
}): React.ReactElement {
    return (
        <section style={{gridArea: "description"}}>
            <h3>{survey.description}</h3>
            <p>{survey.longDescription}</p>
            <p>Created by {survey.owner.username}</p>
        </section>
    );
}
