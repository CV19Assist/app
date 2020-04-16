import { createSelector } from '../utils';

describe('New Request Page', () => {
  beforeEach(() => {
    cy.visit('/new-request');
  });

  it('Shows request form', () => {
    cy.get(createSelector('request-form')).should('exist');
    cy.get(createSelector('need-other')).find('input').should('not.be.checked');
    cy.get(createSelector('need-grocery-pickup'))
      .find('input')
      .should('not.be.checked');
  });

  it('Shows error for required fields', () => {
    cy.get(createSelector('submit-request')).click();
    cy.get(`${createSelector('firstName')} > p.Mui-error`).should('exist');
    cy.get(`${createSelector('lastName')} > p.Mui-error`).should('exist');
    cy.get(`${createSelector('phoneNumber')} > p.Mui-error`).should('exist');
    cy.get(`${createSelector('email')} > p.Mui-error`).should('exist');
  });

  it('Submits Request', () => {
    // TODO: Add test which fills out a request and confirms in database
    cy.get(createSelector('submit-request')).should('exist');
    cy.get(createSelector('otherDetails')).type('Additional details here');
    cy.get(createSelector('firstName')).type('Joe');
    cy.get(createSelector('lastName')).type('Smith');
    cy.get(createSelector('phoneNumber')).type('123-456-7890');
    cy.get(createSelector('email')).type('test@example.com');
    // cy.callFirestore('get', 'aggregates/unfulfilledNeedsInfo', {
    //   orderBy: ['createdAt', 'desc'],
    //   limit: 1,
    // }).then((lastRequest) => {
    //   expect(lastRequest).to.have.property('needs');
    //   expect(lastRequest).to.have.property('createdAt');
    // });
  });

  it('Checks the needed type checkbox from query param', () => {
    it('Sets needs from the type query param', () => {
      cy.visit('/request?type=grocery-pickup');
      cy.get(createSelector('need-other'))
        .find('input')
        .should('not.be.checked');
      cy.get(createSelector('need-grocery-pickup'))
        .find('input')
        .should('be.checked');
    });
  });
});
