import { createSelector } from '../utils';

describe('Contact Page', () => {
  beforeEach(() => {
    cy.visit('/contact');
  });

  it('Submits contact to contacts collection and shows success message', () => {
    const email = 'test@email.com';
    const name = 'some user';
    const phone = '1231231234';
    const message = 'some test message';
    cy.get(createSelector('contact-form')).should('exist');
    cy.get(createSelector('name')).type(name);
    cy.get(createSelector('email')).type(email);
    cy.get(createSelector('phone')).type(phone);
    cy.get(createSelector('message')).type(message);
    cy.get(createSelector('submit-contact')).click();
    // Confirm submitted message appears
    cy.get(createSelector('submitted-message')).should('exist');
    // Confirm data is written to DB under contacts collection
    cy.callFirestore('get', 'contacts', { limit: 1 }).then((contacts) => {
      expect(contacts[0]).to.have.property('createdAt');
      expect(contacts[0]).to.have.property('name', name);
      expect(contacts[0]).to.have.property('email', email);
      expect(contacts[0]).to.have.property('phone', phone);
      expect(contacts[0]).to.have.property('message', message);
    });
  });
});
