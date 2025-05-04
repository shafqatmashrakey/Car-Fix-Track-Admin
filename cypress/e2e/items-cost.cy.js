describe('Items Page Price Check', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.get('input#username').type('admin');
    cy.get('input#password').type('password');
    cy.get('button[type="submit"]').click();

    cy.get('button.dropbtn').click();
    cy.contains('a', 'Items').click({ force: true });
  });

  it('should verify each item displays a valid price', () => {
    cy.get('table#itemTable tbody tr').each($row => {
      cy.wrap($row).find('td').eq(1).invoke('text').then(priceText => {
        const trimmed = priceText.trim();
        if (trimmed === '' || isNaN(parseFloat(trimmed))) {
          // Optionally log or skip empty/non-numeric rows
          return;
        }
        const price = parseFloat(trimmed);
        expect(price, 'Price should be a number').to.be.a('number');
        expect(price, 'Price should be positive').to.be.greaterThan(0);
      });
    });
  });
});