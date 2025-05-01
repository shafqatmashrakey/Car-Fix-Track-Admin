describe('Add Customer', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    // Ensure logged out before each test
    cy.get('body').then($body => {
      if ($body.find('a:contains("Logout")').length) {
        cy.contains('a', 'Logout').click({ force: true });
      }
    });
  });

  it('should add a new customer with valid data', () => {
    cy.get('input#username').type('admin');
    cy.get('input#password').type('password');
    cy.get('button[type="submit"]').click();

    cy.get('button.dropbtn').click();
    cy.contains('a', 'Customers').click({ force: true });
    cy.get('button#addCustomer').click();

    // Fill modal fields by id
    cy.get('input#fname').type('Test');
    cy.get('input#lname').type('User');
    cy.get('input#email').type('test.user@example.com');
    cy.get('input#phoneNum').type('5551234567');
    cy.get('input#address').type('123 Test Lane');
    cy.get('input#addNewCustomer').click();

    // Check if the new customer appears in the table
    cy.get('table#customerTable').contains('td', 'Test').should('exist');
    cy.get('table#customerTable').contains('td', 'User').should('exist');
    cy.get('table#customerTable').contains('td', '5551234567').should('exist');
  });

  it('should show validation message when fields are blank', () => {
    cy.get('input#username').type('admin');
    cy.get('input#password').type('password');
    cy.get('button[type="submit"]').click();

    cy.get('button.dropbtn').click();
    cy.contains('a', 'Customers').click({ force: true });
    cy.get('button#addCustomer').click();
    cy.get('input#addNewCustomer').click();

    // Adjust this selector/message to match your actual validation UI
    cy.contains('Please fill out all fields').should('be.visible');
  });
});