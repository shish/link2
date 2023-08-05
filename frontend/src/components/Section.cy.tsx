/// <reference types="Cypress" />
/// <reference path="../../cypress/support/component.ts" />

import { Section } from "./Section";

const Fail = (): JSX.Element => {
    throw new Error("fail");
}

describe("test", () => {
    it("playground", () => {
        cy.mount(<Section title="Foo">
            <h3>Title</h3>
            <p>hello</p>
        </Section>);
        cy.contains("Title").should("exist");
    });

    it("catches errors", () => {
        // https://docs.cypress.io/api/events/catalog-of-events.html#Uncaught-Exceptions
        cy.on('uncaught:exception', () => false);

        cy.mount(<Section title="Foo">
            <Fail />
        </Section>);
        cy.contains("Error: fail").should("exist");
    });
});
