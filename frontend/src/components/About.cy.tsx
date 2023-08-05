/// <reference types="Cypress" />
/// <reference path="../../cypress/support/component.ts" />

import { About } from "./About";

describe("test", () => {
    it("playground", () => {
        cy.mount(<About />);
        cy.contains("About").should("exist");
    });
});
