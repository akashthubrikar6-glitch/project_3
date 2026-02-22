import { Given } from "@badeball/cypress-cucumber-preprocessor";

Given("I open the SauceDemo website", () => {
  cy.visit("https://www.saucedemo.com/");
});