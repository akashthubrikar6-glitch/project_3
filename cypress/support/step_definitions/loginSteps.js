import { When, Then } from "@badeball/cypress-cucumber-preprocessor";
import LoginPage from "../pageObjects/LoginPage";

const loginPage = new LoginPage();

When("I enter valid username and password", () => {
  loginPage.enterUsername("standard_user");
  loginPage.enterPassword("secret_sauce");
  loginPage.clickLogin();
});

Then("I should see the products page", () => {
  cy.url().should("include", "inventory");
});