
/// <reference types="Cypress" />
/// <reference path="../../cypress/support/component.ts" />

import { Tip } from "./Tip";

describe("test", () => {
    it("playground", () => {
        cy.mount(
            <section>
                <h3>Yo yo what up</h3>
                <p>What's this? <Tip text="It's a tip!" /></p>
            </section>
        );
        cy.contains("this?").should("exist");
        cy.get("svg").click();
        cy.contains("a tip!").should("be.visible");
    });
});
