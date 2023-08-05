/// <reference types="Cypress" />
/// <reference path="../../cypress/support/component.ts" />

import { SurveyWithResponseFragment } from "../gql/graphql";
import { SurveyDescription } from "./SurveyDescription";

describe("test", () => {
    it("playground", () => {
        const s: SurveyWithResponseFragment = {
            id: 1,
            name: "Test Name",
            description: "Test Description",
            longDescription: "Test Long Description",
            owner: { username: "Shish" },
            questions: [],
            myResponse: {},
        };
        cy.mount(<SurveyDescription survey={s} />);
        cy.contains("Created by Shish").should("exist");
    });
});
