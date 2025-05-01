describe('Add Customer', () => {
  it('should add a new customer with valid data', () => {
    cy.visit('http://localhost:3000');
    cy.get('input#username').type('admin');
    cy.get('input#password').type('password');
    cy.get('button[type="submit"]').click();

    cy.contains('Customers').click();
    cy.get('button#addCustomer').click();

    cy.get('input[name="firstName"]').type('Test');
    cy.get('input[name="lastName"]').type('User');
    cy.get('input[name="phone"]').type('5551234567');
    cy.get('input[name="email"]').type('test.user@example.com');
    cy.get('input[name="address"]').type('123 Test Lane');
    cy.get('button[type="submit"]').click();

    cy.contains('Test').should('exist');
    cy.contains('User').should('exist');
    cy.contains('5551234567').should('exist');
  });

  it('should show validation message when fields are blank', () => {
    cy.visit('http://localhost:3000');
    cy.get('input#username').type('admin');
    cy.get('input#password').type('password');
    cy.get('button[type="submit"]').click();

    cy.contains('Customers').click();
    cy.get('button#addCustomer').click();
    cy.get('button[type="submit"]').click();

    cy.contains('Please fill out all fields').should('be.visible');
  });
});