/// <reference types="Cypress" />
/// <reference path="../../cypress/support/component.ts" />

import { Www } from "../gql/graphql";
import { CompareIntro } from "./CompareIntro";

describe("test", () => {
    const r = {
        "id": 1,
        "survey": {
            "id": 1,
            "name": "TestName",
            "longDescription": "TestLongDesc",
        },
        "comparison": [
            {
                "id": 1,
                "section": "TestSection",
                "order": 1,
                "text": "TestText",
                "mine": Www.Will,
                "theirs": Www.Will,                    
            },
        ]
    };

    it("playground", () => {
        cy.mount(<CompareIntro response={r}/>);
        cy.contains("Comparing your answers for").should("exist");
    });
});
