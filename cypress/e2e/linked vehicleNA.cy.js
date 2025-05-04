describe('Link Vehicle to Customer', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.get('input#username').type('admin');
    cy.get('input#password').type('password');
    cy.get('button[type="submit"]').click();

    // Handle alert after adding customer
    cy.on('window:alert', (str) => {
      // Optionally assert the alert text
      expect(str).to.contain('New customer added successfully');
    });

    // Go to Customers page and add a customer
    cy.get('button.dropbtn').click();
    cy.contains('a', 'Customers').click({ force: true });
    cy.get('button#addCustomer').click();
    cy.get('input#fname').type('VehicleLink');
    cy.get('input#lname').type('Test');
    cy.get('input#phoneNum').type('5558889999');
    cy.get('input#email').type('vehiclelink@example.com');
    cy.get('input#address').type('456 Cypress Ave');
    cy.get('input#addNewCustomer').click();
  });

  it('should show the linked vehicle under the correct customer', () => {
    // Always log in before checking
    cy.visit('http://localhost:3000');
    cy.get('input#username').type('admin');
    cy.get('input#password').type('password');
    cy.get('button[type="submit"]').click();

    cy.get('button.dropbtn').click();
    cy.contains('a', 'Vehicles').click({ force: true });
    cy.get('button#addVehicle').click();
    cy.get('select#state').select('CA');
    cy.get('input#licensePlate').type('CYTEST123');
    cy.get('input#carMake').type('Honda');
    cy.get('input#carModel').type('Civic');
    cy.get('input#carYear').type('2023');
    cy.get('select#customers').select('VehicleLink Test');
    cy.get('input#addcar').click();

    // Optionally handle alert after adding vehicle
    cy.on('window:alert', (str) => {
      expect(str).to.contain('New vehicle added successfully');
    });

    // Go to Customers page and verify the vehicle is listed under the customer
    cy.get('button.dropbtn').click();
    cy.contains('a', 'Customers').click({ force: true });
    cy.get('table#customerTable').contains('td', 'VehicleLink').parent('tr').within(() => {
      cy.contains('CYTEST123').should('exist');
    });
  });
});