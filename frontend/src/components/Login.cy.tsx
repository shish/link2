/// <reference types="Cypress" />
/// <reference path="../../cypress/support/component.ts" />

import { LogIn } from "./Login";

describe("test", () => {
    it("playground", () => {
        cy.mount(<LogIn />);
        cy.contains("Log In").should("exist");
    });

    // TODO: Add tests for the LogIn component
});
