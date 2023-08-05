/// <reference types="Cypress" />
/// <reference path="../../cypress/support/component.ts" />

import { Privacy, SurveyWithResponseFragment } from "../gql/graphql";
import { SAVE_RESPONSE, SurveyPrivacy } from "./SurveyPrivacy";

describe("test", () => {
    const s: SurveyWithResponseFragment = {
        id: 1,
        name: "Test Name",
        description: "Test Description",
        longDescription: "Test Long Description",
        owner: { username: "Shish" },
        questions: [],
        myResponse: {},
    };
    const r = {
        id: 1,
        privacy: Privacy.Friends,
        answers: [],
    }
    it("playground", () => {
        cy.mount(<SurveyPrivacy survey={s} response={r} />);
        cy.contains("Copy to clipboard").should("exist");
    });
    it("null to something", () => {
        const mocks = [
            {
                request: { query: SAVE_RESPONSE, variables: { surveyId: 1, response: { privacy: "FRIENDS" } } },
                result: {
                    "data": {
                        "saveResponse": {
                            "id": 22,
                            "privacy": "FRIENDS",
                            "answers": [
                                {
                                    "id": 1,
                                    "questionId": 1,
                                    "value": "WANT",
                                    "flip": "NA",
                                    "__typename": "Answer"
                                },
                                {
                                    "id": 2,
                                    "questionId": 2,
                                    "value": "WANT",
                                    "flip": "WILL",
                                    "__typename": "Answer"
                                },
                                {
                                    "id": 472,
                                    "questionId": 472,
                                    "value": "WILL",
                                    "flip": "WONT",
                                    "__typename": "Answer"
                                }
                            ],
                            "__typename": "Response"
                        }
                    }
                },
            },

        ];
        cy.mount(<SurveyPrivacy survey={s} response={null} />, { mocks });
        cy.get("SELECT").get("option").should("have.length", 4);
        cy.contains("Copy to clipboard").should("not.exist");

        cy.get("SELECT").select("FRIENDS");
        cy.get("SELECT").get("option").should("have.length", 3);
        cy.contains("Copy to clipboard").should("exist");
    });
});
