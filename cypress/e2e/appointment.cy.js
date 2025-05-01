describe('Add Appointment', () => {
  it('should add a new appointment with valid data', () => {
    cy.visit('http://localhost:3000');
    // Log in first if needed
    cy.get('input#username').type('admin');
    cy.get('input#password').type('password');
    cy.get('button[type="submit"]').click();

    // Navigate to appointments page
    cy.contains('Appointments').click();

    // Fill out appointment form
    cy.get('input[name="customer"]').type('John Doe');
    cy.get('input[name="vehicle"]').type('Toyota');
    cy.get('input[name="date"]').type('2099-12-31');
    cy.get('button[type="submit"]').click();

    // Check appointment appears in list
    cy.contains('John Doe').should('exist');
    cy.contains('Toyota').should('exist');
    cy.contains('2099-12-31').should('exist');
  });
});