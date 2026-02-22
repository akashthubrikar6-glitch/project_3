@smoke @regression
Feature: Login

  Scenario: Login with valid credentials
    Given I open the SauceDemo website
    When I enter valid username and password
    Then I should see the products page