
/// <reference types="Cypress" />
/// <reference path="../../cypress/support/component.ts" />

import { GET_SURVEYS, SurveyItems } from "./SurveyItems";

describe("test", () => {
    it("empty", () => {
        const mocks = [
            {
                request: { query: GET_SURVEYS, variables: {} },
                result: {
                    "data": {
                        "surveys": []
                    }
                },
            },
        ];
        cy.mount(<SurveyItems />, { mocks });
        cy.contains("Lists").should("exist");
    });
    it("playground", () => {
        const mocks = [
            {
                request: { query: GET_SURVEYS, variables: {} },
                result: {
                    "data": {
                        "surveys": [
                            {
                                "id": 2,
                                "name": "Fun",
                                "description": "Bored with friends; what should we do?",
                                "stats": {
                                    "unansweredQuestions": 10,
                                    "friendResponses": 13,
                                    "otherResponses": 22,
                                    "__typename": "SurveyStats"
                                },
                                "__typename": "Survey"
                            },
                            {
                                "id": 3,
                                "name": "Music",
                                "description": "If we're driving together, what goes on the stereo?",
                                "stats": {
                                    "unansweredQuestions": 0,
                                    "friendResponses": 12,
                                    "otherResponses": 36,
                                    "__typename": "SurveyStats"
                                },
                                "__typename": "Survey"
                            },
                            {
                                "id": 6,
                                "name": "Pets",
                                "description": "What type of pet should we get?",
                                "stats": {
                                    "unansweredQuestions": 0,
                                    "friendResponses": 0,
                                    "otherResponses": 0,
                                    "__typename": "SurveyStats"
                                },
                                "__typename": "Survey"
                            }
                        ]
                    }
                },
            },
        ];
        cy.mount(<SurveyItems />, { mocks });
        cy.contains("what should we do").should("exist");
        cy.contains("()").should("not.exist");
    });
});
