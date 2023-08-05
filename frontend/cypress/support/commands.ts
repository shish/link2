/// <reference types="cypress" />

export {};

export function randomUsername(): string {
    return ("_test_" + self.crypto.randomUUID()).replace(/-/g, "").substring(0, 30);
}

Cypress.Commands.add('login', (username: string, password?: string) => {
    const un = username;
    const pw = password ? password : un.toLowerCase() + "pass";
    cy.session(
        un,
        () => {
            cy.visit('/')
            cy.contains("Sign Up / Log In").should('exist')

            cy.contains("Create one!").click()
            cy.get('[placeholder="Username"]').type(un)
            cy.get('[placeholder="Password"]').type(pw)
            cy.get('[placeholder="Confirm Password"]').type(pw)
            cy.get('[value="Create"]').click()
            cy.contains(un).should('exist')
        },
        {
            validate: () => {
                cy.visit('/')
                cy.contains(un).should('exist')
            }
        }
    )
})
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//

declare global {
    namespace Cypress {
        interface Chainable {
            login(username: string, password?: string): Chainable
        }
    }
}
