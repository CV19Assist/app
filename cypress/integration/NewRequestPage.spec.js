import { createSelector } from '../utils';

describe('New Request Page', () => {
  before(() => {
    cy.logout();
  });
  beforeEach(() => {
    cy.visit('/new-request');
  });

  it('Shows request form with valid initial state', () => {
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
    cy.get(`${createSelector('phone')} > p.Mui-error`).should('exist');
    cy.get(`${createSelector('email')} > p.Mui-error`).should('exist');
  });

  it('Submits Request', () => {
    const phoneNumber = '123-456-7890';
    const email = 'test@example.com';
    cy.get(createSelector('need-other')).click();
    cy.get(createSelector('submit-request')).should('exist');
    cy.get(createSelector('otherDetails')).type('Additional details here');
    cy.get(createSelector('firstName')).type('Joe');
    cy.get(createSelector('lastName')).type('Smith');
    cy.get(createSelector('phone')).type(phoneNumber);
    cy.get(createSelector('email')).type(email);
    cy.get(createSelector('submit-request')).click();
    cy.callFirestore('get', 'requests', {
      orderBy: ['createdAt', 'desc'],
      limit: 1,
    }).then(([lastRequest]) => {
      expect(lastRequest).to.have.property('needs');
      expect(lastRequest).to.have.property('immediacy', 1);
      expect(lastRequest).to.have.property('generalLocationName');
      expect(lastRequest).to.have.property(
        'generalLocationName',
        'Madison, WI',
      );
      expect(lastRequest).to.have.property('preciseLocation');
      expect(lastRequest).to.have.property('createdAt');
      cy.callFirestore('get', `requests_public/${lastRequest.id}`).then(
        (publicRequest) => {
          cy.log('public request object', publicRequest);
          expect(publicRequest).to.have.nested.property('d.status', 1);
          expect(publicRequest).to.have.nested.property('d.needs');
          expect(publicRequest).to.have.nested.property('d.createdAt');
        },
      );
      cy.callFirestore('get', `requests_contact/${lastRequest.id}`).then(
        (requestContact) => {
          cy.log('public request object', requestContact);
          expect(requestContact).to.have.property('phone', phoneNumber);
          expect(requestContact).to.have.property('email', email);
        },
      );
    });
  });

  it('Sets needs from the type query param', () => {
    cy.visit('/new-request?type=grocery-pickup');
    cy.get(createSelector('need-other')).find('input').should('not.be.checked');
    cy.get(createSelector('need-grocery-pickup'))
      .find('input')
      .should('be.checked');
  });

  describe('when authenticated', () => {
    before(() => {
      cy.login();
    });

    it('Includes createdBy in new request object', () => {
      const phoneNumber = '123-456-7890';
      const email = 'test@example.com';
      cy.get(createSelector('need-other')).click();
      cy.get(createSelector('submit-request')).should('exist');
      cy.get(createSelector('otherDetails')).type('Additional details here');
      cy.get(createSelector('firstName')).type('Joe');
      cy.get(createSelector('lastName')).type('Smith');
      cy.get(createSelector('phone')).type(phoneNumber);
      cy.get(createSelector('email')).type(email);
      cy.get(createSelector('submit-request')).click();
      cy.waitUntil(() =>
        cy
          .callFirestore('get', 'requests', {
            orderBy: ['createdAt', 'desc'],
            limit: 1,
          })
          .then(
            (requests) =>
              requests &&
              requests.length &&
              requests[0].createdBy === Cypress.env('TEST_UID'),
          ),
      );
      cy.callFirestore('get', 'requests', {
        orderBy: ['createdAt', 'desc'],
        limit: 1,
      }).then(([lastRequest]) => {
        expect(lastRequest).to.have.property(
          'createdBy',
          Cypress.env('TEST_UID'),
        );
        cy.callFirestore('get', `requests_public/${lastRequest.id}`).then(
          (publicRequest) => {
            cy.log('public request object', publicRequest);
            expect(publicRequest).to.have.nested.property(
              'd.createdBy',
              Cypress.env('TEST_UID'),
            );
          },
        );
      });
    });
  });
});
