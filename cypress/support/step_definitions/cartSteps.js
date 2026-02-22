import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("I add a product to the cart", () => {
  cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
});

Then("I should see the product in the cart", () => {
  cy.get(".shopping_cart_badge").should("have.text", "1");
});