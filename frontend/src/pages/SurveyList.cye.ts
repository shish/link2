/// <reference types="Cypress" />

export {};

describe("survey list", () => {
    it("show description", () => {
        cy.visit("/");
        cy.contains("S-Club 7").should("exist");
    });
    it("list surveys without details if not logged in", () => {
        cy.visit("/");
        cy.contains("Lists").should("exist");
        cy.contains("others responded").should("not.exist");
    });
    it("list surveys with details if logged in", () => {
        cy.login("demo", "demo");
        cy.visit("/");
        cy.contains("Lists").should("exist");
        cy.contains("others responded").should("exist");
    });
});
