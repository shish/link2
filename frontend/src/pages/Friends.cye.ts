/// <reference types="Cypress" />

import { randomUsername } from "../../../cypress/support/commands";

export {};

describe("friends list page", () => {
    it("redirect if not logged in", () => {
        cy.visit("/friends");
        cy.location('pathname').should("eq", "/");
    });

    /*
    it("e2e", () => {
        const alice = randomUsername();
        const bob = randomUsername();

        // create friend request
        cy.login(alice);
        cy.visit("/friends");
        cy.contains("Friends").should("exist");

        cy.get("input[placeholder='Username']").type(bob);
        cy.get("input[value='Send']").click();

        // revoke friend request
        cy.get("input[value='Cancel']").click();

        // send again
        cy.get("input[placeholder='Username']").type(bob);
        cy.get("input[value='Send']").click();

        // accept friend request
        cy.login(bob);
        cy.visit("/friends");
        cy.contains("Friends").should("exist");
        cy.get("input[value='Accept']").click();
    });
    */
});
