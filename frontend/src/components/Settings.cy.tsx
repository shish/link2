
/// <reference types="Cypress" />
/// <reference path="../../cypress/support/component.ts" />

import { Settings } from "./Settings";

describe("test", () => {
    it("playground", () => {
        cy.mount(<Settings />);
        cy.contains("Settings").should("exist");
    });
});
