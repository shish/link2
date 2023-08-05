/// <reference types="Cypress" />

import { randomUsername } from "../../cypress/support/commands";

export {};

describe("survey", () => {
    it("view a survey", () => {
        cy.login("demo", "demo");
        cy.visit("/survey/1");
        // cy.get('[href^="/post/"]').first().click();
        cy.contains("Privacy").should("exist");
    });

    it("create new response", () => {
        const alice = randomUsername();

        cy.login(alice);
        cy.visit("/survey/1");
        cy.contains("Privacy").should("exist");
        cy.contains("Give this link to someone").should("not.exist");
        cy.contains("Questions").should("not.exist");

        cy.get("select").select("PUBLIC");
        cy.contains("Privacy").should("exist");
        cy.contains("Give this link to someone").should("exist");
        cy.contains("Questions").should("exist");
    });
});
