class CartPage {

  addBackpackToCart() {
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  }

  verifyCartCount() {
    cy.get(".shopping_cart_badge").should("have.text", "1");
  }

}

export default CartPage;