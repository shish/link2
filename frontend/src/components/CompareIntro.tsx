import { ResponseWithComparisonFragment } from "../gql/graphql";
import css from "../pages/ResponseView.module.scss";
import { sectionMaker } from "./Section";


export const CompareIntro = sectionMaker(function({ response }: { response: ResponseWithComparisonFragment; }) {
    return (
        <>
            <h3>
                Comparing your answers for{" "}
                <a href={"/survey/" + response.survey.id}>
                    {response.survey.name}
                </a>{" "}
                with {response.owner ? response.owner.username : "anonymous"}
            </h3>
            <p>{response.survey.longDescription}</p>
        </>
    );
}, css.intro);