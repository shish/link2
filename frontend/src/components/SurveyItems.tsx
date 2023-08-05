import { useQuery } from "@apollo/client";
import { graphql } from "../gql";
import { Link } from "react-router-dom";
import { useContext, useEffect } from "react";
import { UserContext } from "../providers/LoginProvider";
import css from "../pages/SurveyList.module.scss";
import { sectionMaker } from "./Section";


export const GET_SURVEYS = graphql(`
    query getSurveys {
        surveys {
            id
            name
            description
            stats {
                unansweredQuestions
                friendResponses
                otherResponses
            }
        }
    }
`);

function SurveyStats({ stats }: { stats: any; }) {
    let line = "";
    if (stats.unansweredQuestions) {
        line += `${stats.unansweredQuestions} recently added`;
    }

    if (line && (stats.friendResponses || stats.otherResponses)) {
        line += ", ";
    }
    if (stats.friendResponses && stats.otherResponses) {
        line += `${stats.friendResponses} friends and ${stats.otherResponses} others responded`;
    } else if (stats.friendResponses) {
        line += `${stats.friendResponses} friends responded`;
    } else if (stats.otherResponses) {
        line += `${stats.otherResponses} others responded`;
    }
    if(!line) {
        line = "No responses yet!";
    }
    return (
        <>
            <br />
            <span>({line})</span>
        </>
    );
}

export const SurveyItems = sectionMaker(function() {
    const { me } = useContext(UserContext);
    const q = useQuery(GET_SURVEYS);
    useEffect(() => {
        q.refetch();
    }, [me]);

    ///////////////////////////////////////////////////////////////////
    // Hook edge case handling
    let ul = (
        <ul>
            <li>???</li>
        </ul>
    );
    if (q.loading) {
        ul = (
            <ul>
                <li>Loading...</li>
            </ul>
        );
    } else if (q.error) {
        ul = (
            <ul>
                <li>{q.error.message}</li>
            </ul>
        );
    } else {
        ul = (
            <ul>
                {q.data!.surveys.map((s) => (
                    <li key={s.name}>
                        {me ? (
                            <Link to={"/survey/" + s.id}>
                                {s.name} - {s.description}
                            </Link>
                        ) : (
                            <>
                                {s.name} - {s.description}
                            </>
                        )}
                        {s.stats && <SurveyStats stats={s.stats} />}
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <>
            <h3>Lists</h3>
            {ul}
        </>
    );
}, css.lists)
