import { createSelector } from '../utils';

describe('Request Page', () => {
  beforeEach(() => {
    cy.visit('/request');
  });

  it('Shows request form', () => {
    cy.get(createSelector('request-form')).should('exist');
  });

  it.skip('Submits Request', () => {
    // TODO: Add test which fills out a request and confirms in database
    cy.get(createSelector('submit-request')).should('exist');
    cy.callFirestore('get', 'aggregates/unfulfilledNeedsInfo', {
      orderBy: ['createdAt', 'desc'],
      limit: 1,
    }).then((lastRequest) => {
      expect(lastRequest).to.have.property('needs');
      expect(lastRequest).to.have.property('createdAt');
    });
  });

  describe('query params', () => {
    it.skip('Sets needs from the type query param', () => {
      cy.get(createSelector('request-content')).should('exist');
    });
  });
});
