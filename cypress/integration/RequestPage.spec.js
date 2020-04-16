import { createSelector } from '../utils';

const requestId = '123ABC';
const firstName = 'some';
const lastName = 'last';
// TODO: Add coordinates
const requestObj = { immediacy: '1', firstName, lastName };

describe('Request Page', () => {
  beforeEach(() => {
    cy.callFirestore('set', `requests/${requestId}`, requestObj);
    cy.visit(`/request/${requestId}`);
  });

  it('Shows request info', () => {
    cy.get(createSelector('request-info')).should('exist');
  });
});
