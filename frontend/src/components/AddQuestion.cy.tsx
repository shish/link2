/// <reference types="Cypress" />
/// <reference path="../../cypress/support/component.ts" />

import { AddQuestion } from "./AddQuestion";

describe("test", () => {
    it("playground", () => {
        cy.mount(<AddQuestion survey_id={42}/>);
        cy.contains("Comparing your answers for").should("exist");
    });
});
