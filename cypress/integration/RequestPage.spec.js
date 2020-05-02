import { createSelector } from '../utils';

const requestId = '123ABC';

describe('Request Page', () => {
  before(() => {
    // TODO: Add a test which has a request
    // TODO: Add coordinates
    // const firstName = 'some';
    // const lastName = 'last';
    // const requestObj = {
    //   immediacy: '1',
    //   firstName,
    //   lastName,
    //   createdBy: Cypress.env('TEST_UID'),
    // };
    // cy.callFirestore('set', `requests/${requestId}`, requestObj);
    cy.visit(`/requests/${requestId}`);
  });

  it('Shows not found message if request does not exist', () => {
    cy.get(createSelector('request-not-found'), { timeout: 30000 }).should('exist');
  });

  // it.skip('Shows not found message if request does not exist', () => {
  //   cy.get(createSelector('request-info')).should('exist');
  // });
});
