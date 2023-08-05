/// <reference types="Cypress" />
/// <reference path="../../cypress/support/component.ts" />

import { CompareSection } from "./CompareSection";
import { Www } from "../gql/graphql";

describe("test", () => {
    it("playground", () => {
        cy.mount(<section><CompareSection section={"Test Section"} comparisons={[
            { section: "Food", order: 42, text: "Cake", mine: Www.Want, theirs: Www.Will },
            { section: "Food", order: 43, text: "Pie", mine: Www.Will, theirs: Www.Want },
            { section: "Food", order: 44, text: "Pastry", mine: Www.Want, theirs: Www.Want },
            { section: "Food", order: 45, text: "Cooking Eggs", flip: "Eating Eggs", mine: Www.Want, theirs: Www.Will },
            { section: "Food", order: 46, text: "Cooking Bacon", flip: "Eating Bacon", mine: Www.Will, theirs: Www.Want },
            { section: "Food", order: 47, text: "Cooking Cheese", flip: "Eating Cheese", mine: Www.Want, theirs: Www.Want },
        ]}/></section>);
        cy.contains("want").should("exist");
    });
});
