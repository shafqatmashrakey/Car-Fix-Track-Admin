describe('Login UI Check', () => {
  it('should log in with correct credentials', () => {
    cy.visit('http://localhost:3000');
    cy.get('input#username').type('admin');
    cy.get('input#password').type('password');
    cy.get('button[type="submit"]').click();
    cy.get('#main-content').should('be.visible');
  });
});
