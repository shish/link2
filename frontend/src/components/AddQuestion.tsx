import { useMutation } from "@apollo/client";
import { graphql } from "../gql";
import css from "../pages/ResponseView.module.scss";
import { sectionMaker } from "./Section";
import { GET_SURVEY } from "../pages/SurveyView";
import { SurveyViewFragment } from "../gql/graphql";
import { useState } from "react";

const ADD_QUESTION = graphql(`
    mutation addQuestion($surveyId: Int!, $question: QuestionInput!) {
        addQuestion(surveyId: $surveyId, question: $question) {
            section
            text
            flip
        }
    }
`);

//export const AddQuestion = sectionMaker(function({ survey_id }: { survey_id: number; }) {
export const AddQuestion = function ({
    survey,
}: {
    survey: SurveyViewFragment;
}) {
    const sections = Array.from(
        new Set(survey.questions.map((q) => q.section)),
    ).sort();
    const [section, setSection] = useState(sections[0]);
    const [addQuestionMutation, addQuestionQ] = useMutation(ADD_QUESTION, {
        refetchQueries: [GET_SURVEY],
        onError: (error) => {
            alert(error);
        },
    });


    return (
        <section style={{ gridArea: "addq" }}>
            <h3>Add Question</h3>
            <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const section = form.section.value;
                const text = form.text.value;
                const flip = form.flip.value;
                addQuestionMutation({
                    variables: {
                        surveyId: survey.id,
                        question: { section, text, flip },
                    },
                    onCompleted: () => {
                        form.text.value = "";
                        form.flip.value = "";
                    },
                });
            }}>
                <label>
                    Section:
                    {sections.includes(section) ?
                        <select
                            name="section"
                            onChange={(e) => setSection(e.target.value)}
                            value={section}
                            disabled={addQuestionQ.loading}
                        >
                            {sections.map((s) => (
                                <option key={s} value={s}>
                                    {s || "Unsorted"}
                                </option>
                            ))}
                            <option key={-1} value={""}>
                                {"Create New Section"}
                            </option>
                        </select> :
                        <input
                            type="text"
                            name="section"
                            onChange={(e) => setSection(e.target.value)}
                            required={true}
                            disabled={addQuestionQ.loading}
                        />
                    }
                </label>
                <label>
                    Question:
                    <input type="text" name="text" required={true} disabled={addQuestionQ.loading} />
                </label>
                <label>
                    Opposite pair (optional):
                    <input type="text" name="flip" disabled={addQuestionQ.loading} />
                </label>
                <button type="submit" disabled={addQuestionQ.loading}>Add Question</button>
            </form>
        </section>
    );
}//, css.intro);