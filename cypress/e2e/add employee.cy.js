describe('Add Employee', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    // Ensure logged out before each test
    cy.get('body').then($body => {
      if ($body.find('a:contains("Logout")').length) {
        cy.contains('a', 'Logout').click({ force: true });
      }
    });
  });

  it('should add a new employee with valid data', () => {
    cy.get('input#username').type('admin');
    cy.get('input#password').type('password');
    cy.get('button[type="submit"]').click();

    cy.get('button.dropbtn').click();
    cy.contains('a', 'Employees').click({ force: true });
    cy.get('button#addEmployee').click();

    // Fill modal fields by id
    cy.get('input#fname').type('Alex');
    cy.get('input#lname').type('Tester');
    cy.get('input#email').type('alex.tester@example.com');
    cy.get('input#workPhoneNum').type('5559876543');
    cy.get('input#personalPhoneNum').type('5551112222');
    cy.get('input#addNewEmployee').click();

    // Check if the new employee appears in the table
    cy.get('table#employeeTable').contains('td', 'Alex').should('exist');
    cy.get('table#employeeTable').contains('td', 'Tester').should('exist');
    cy.get('table#employeeTable').contains('td', 'alex.tester@example.com').should('exist');
  });

});