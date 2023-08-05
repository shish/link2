/// <reference types="Cypress" />
/// <reference path="../../cypress/support/component.ts" />

import { OTHER_RESPONSES, OtherResponses } from "./OtherResponses";

describe("test", () => {
    const r1 = {
        "id": 1,
        "owner": {
            "username": "demo-alice",
            "isFriend": true,
            "__typename": "User"
        },
        "__typename": "Response"
    };
    const r2 = {
        "id": 2,
        "owner": {
            "username": "demo-bob",
            "isFriend": false,
            "__typename": "User"
        },
        "__typename": "Response"
    };
    it("playground", () => {
        const mocks = [
            {
                request: { query: OTHER_RESPONSES, variables: { surveyId: 1 } },
                result: {
                    "data": {
                        "survey": {
                            "responses": [ r1, r2 ],
                            "__typename": "Survey"
                        }
                    }
                },
            },
        ];
        cy.mount(<OtherResponses survey_id={1} />, { mocks });
        cy.contains("Friends").should("exist");
    });
    it("no friends", () => {
        const mocks = [
            {
                request: { query: OTHER_RESPONSES, variables: { surveyId: 1 } },
                result: {
                    "data": {
                        "survey": {
                            "responses": [ r2 ],
                            "__typename": "Survey"
                        }
                    }
                },
            },
        ];
        cy.mount(<OtherResponses survey_id={1} />, { mocks });
        cy.contains("Friends").should("exist");
        cy.contains("No friends").should("exist");
    });
    it("no others", () => {
        const mocks = [
            {
                request: { query: OTHER_RESPONSES, variables: { surveyId: 1 } },
                result: {
                    "data": {
                        "survey": {
                            "responses": [ r1 ],
                            "__typename": "Survey"
                        }
                    }
                },
            },
        ];
        cy.mount(<OtherResponses survey_id={1} />, { mocks });
        cy.contains("Friends").should("exist");
        cy.contains("No others").should("exist");
    });
});
