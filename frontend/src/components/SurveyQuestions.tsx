import React, { useState } from "react";
import { useFragment_experimental, useMutation } from "@apollo/client";
import { graphql, useFragment as fragCast } from "../gql";
import css from "./SurveyQuestions.module.scss";
import {
    Question,
    ResponseWithAnswersFragment,
    SurveyViewFragment,
    Www,
} from "../gql/graphql";
import { Tip } from "./Tip";

const ANSWER_FRAGMENT = graphql(`
    fragment MyAnswer on Answer {
        id
        questionId
        value
        flip
    }
`);

export function SurveyQuestions({
    survey, response,
}: {
    survey: SurveyViewFragment;
    response: ResponseWithAnswersFragment;
}): React.ReactElement {
    const sections = Array.from(
        new Set(survey.questions.map((q) => q.section)),
    ).sort();
    const [section, setSection] = useState(sections[0]);
    const current_section_num = sections.indexOf(section);
    const prev_section = sections[current_section_num - 1];
    const next_section = sections[current_section_num + 1];
    const on_final_page = current_section_num >= sections.length - 1;

    function setSectionAndScrollToQuestionsHeader(section: string) {
        setSection(section);
        setTimeout(function () {
            const questions_header = document.getElementById("questions");
            if (questions_header) {
                questions_header.scrollIntoView();
            }
        }, 0);
    }

    function finish() {
        const my_link = window.location.protocol +
            "//" +
            window.location.host +
            "/response/" +
            response?.id;
        navigator.clipboard.writeText(my_link);
        alert("All saved! The link to your results is in your clipboard, send to a friend to compare <3");
    }

    return (
        <section style={{ gridArea: "questions" }}>
            <h3 id="questions">Questions</h3>
            <table className="zebra">
                <thead>
                    <tr>
                        <td colSpan={2}>
                            <select
                                onChange={(e) =>
                                    setSectionAndScrollToQuestionsHeader(
                                        e.target.value,
                                    )
                                }
                                value={section}
                            >
                                {sections.map((s) => (
                                    <option key={s} value={s}>
                                        {s || "Unsorted"}
                                    </option>
                                ))}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th>Thing</th>
                        <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            Want / Will / Won't{" "}
                            <Tip text="Want to do / Will try for somebody else's benefit / Won't do" />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {survey.questions
                        .filter((q) => q.section === section)
                        .map(q => <Row key={q.id} question={q} />)}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={3}>
                            <div className={css.buttons}>
                                <button
                                    onClick={() =>
                                        setSectionAndScrollToQuestionsHeader(
                                            prev_section,
                                        )
                                    }
                                    disabled={current_section_num <= 0}
                                >
                                    Previous
                                </button>
                                <div>
                                    Page {current_section_num + 1}/{sections.length}
                                </div>
                                <button
                                    onClick={() => {
                                        on_final_page ? finish() :
                                        setSectionAndScrollToQuestionsHeader(
                                            next_section,
                                        )
                                    }}
                                >
                                    {on_final_page ? "Finish" : "Next"}
                                </button>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </section>
    );
}

const SAVE_ANSWER = graphql(`
    mutation saveAnswer($questionId: Int!, $value: WWW!, $flip: WWW!) {
        saveAnswer(questionId: $questionId, answer: {value: $value, flip: $flip}) {
            ...MyAnswer
        }
    }
`);

function Row({
    question,
}: {
    question: Question;
}) {
    const { complete, data } = useFragment_experimental({
        fragment: ANSWER_FRAGMENT,
        fragmentName: "MyAnswer",
        from: {
            __typename: "Answer",
            id: question.id,
        },
    });
    const value = data?.value || Www.Na;
    const flip = data?.flip || Www.Na;

    // saveAnswerMutation - the mutation will respond with
    // the updated Answer object, which will go into the
    // cache, and then the useFragment_experimental will
    // update the UI with the new value.
    const [sam, saveAnswerQ] = useMutation(SAVE_ANSWER, {
        onError: (error) => {
            alert(error);
        },
    });

    return (
        <>
            <tr>
                <td>
                    {question.text}
                    {question.extra && <Tip text={question.extra} />}
                </td>
                <Radios value={value} onChange={(v) => sam({ variables: { questionId: question.id, value: v, flip } })} />
            </tr>
            {question.flip && (
                <tr>
                    <td>&rarr; {question.flip}</td>
                    <Radios value={flip} onChange={(f) => sam({ variables: { questionId: question.id, value, flip: f } })} />
                </tr>
            )}
        </>
    );
}

function Radios({
    value,
    onChange,
}: {
    value: Www;
    onChange: (v: Www) => void;
}) {
    return (
        <td>
            <div className={css.www}>
                <Radio
                    className={css.want}
                    label1={"Yay!"}
                    checked={value == Www.Want}
                    onChange={() => onChange(Www.Want)}
                />
                <Radio
                    className={css.will}
                    checked={value == Www.Will}
                    onChange={() => onChange(Www.Will)}
                />
                <Radio
                    className={css.wont}
                    label2={"Boo!"}
                    checked={value == Www.Wont}
                    onChange={() => onChange(Www.Wont)}
                />
            </div>
        </td>
    );
    /*
    <Radio
        className={css.na}
        label1={"(N/A"}
        label2={")"}
        checked={value == Www.Na}
        onChange={() => onChange(Www.Na)}
    />
    */
}

export function Radio({
    className,
    label1,
    label2,
    checked,
    onChange,
}: {
    className: string;
    label1?: string;
    label2?: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}): React.ReactElement {
    return (
        <label className={className}>
            <div>{label1}</div>
            <input type="radio" checked={checked} onChange={onChange} />
            <div>{label2}</div>
        </label>
    );
}
