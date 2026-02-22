@regression
Feature: Cart

  Scenario: User adds product to cart successfully
    Given I open the SauceDemo website
    When I enter valid username and password
    And I add a product to the cart
    Then I should see the product in the cart