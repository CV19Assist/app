import { createSelector } from '../utils';

const requestId = '123ABC';

describe('Request Page', () => {
  describe('without auth', () => {
    it('Shows not found message if request does not exist', () => {
      cy.visit(`/requests/asdf`);
      cy.get(createSelector('request-not-found')).should('exist');
    });
  });
  describe('with auth', () => {
    const phone = '123-456-7890';
    const email = 'test@example.com';
    before(() => {
      // TODO: Add coordinates
      const firstName = 'some';
      const lastName = 'last';
      const requestObj = {
        immediacy: 1,
        firstName,
        lastName,
        phone,
        email,
        generalLocationName: 'Madison, WI',
        createdBy: 'ABC123',
      };
      Promise.all([
        cy.callFirestore('set', `requests/${requestId}`, requestObj),
        cy.callFirestore('set', `requests_public/${requestId}`, {
          d: requestObj,
        }),
        cy.callFirestore('set', `requests_contact/${requestId}`, {
          email,
          phone,
        }),
      ]);
      cy.visit(`/requests/${requestId}`);
    });

    it('Renders request info', () => {
      cy.get(createSelector('request-info')).should('exist');
    });

    it.skip('Supports accepting the request', () => {
      cy.get(createSelector('request-assign-button')).click();
      cy.get(createSelector('request-action-dialog')).should('exist');
      cy.get(createSelector('request-action-submit-button')).click();
      // Confirm that correct data is written to Firestore
      cy.callFirestore('get', `requests_public/${requestId}`).then(
        (request) => {
          cy.log('request', request);
          expect(request).to.have.nested.property(
            'd.owner',
            Cypress.env('TEST_UID'),
          );
          expect(request).to.have.nested.property('d.status', 10);
          expect(request).to.have.nested.property('d.ownerInfo.takenAt');
        },
      );
      cy.callFirestore('get', 'requests_actions', {
        where: ['requestId', '==', requestId],
      }).then((requestActions) => {
        const [requestAction] = requestActions;
        cy.log('request action', requestAction);
        expect(requestAction).to.have.property(
          'createdBy',
          Cypress.env('TEST_UID'),
        );
        expect(requestAction).to.have.property('kind', 10); // took ownership
      });
    });

    it.skip('Supports releasing an already accepted request', () => {
      cy.get(createSelector('request-assign-button')).click();
      cy.get(createSelector('request-action-dialog')).should('exist');
      cy.get(createSelector('request-action-comment')).type('test');
      cy.get(createSelector('request-action-submit-button')).click();
      // Confirm that correct data is written to Firestore
      cy.callFirestore('get', `requests_public/${requestId}`).then(
        (request) => {
          cy.log('request', request);
          expect(request).to.have.nested.property(
            'd.owner',
            Cypress.env('TEST_UID'),
          );
          expect(request).to.have.nested.property('d.status', 1); // switch status back
          expect(request).to.have.nested.property('d.ownerInfo.takenAt');
        },
      );
      cy.callFirestore('get', 'requests_actions', {
        where: ['requestId', '==', requestId],
      }).then((requestActions) => {
        const [requestAction] = requestActions;
        cy.log('request action', requestAction);
        expect(requestAction).to.have.property(
          'createdBy',
          Cypress.env('TEST_UID'),
        );
        expect(requestAction).to.have.property('kind', 5); // took ownership
      });
      cy.callFirestore('get', 'requests_discussions', {
        where: ['requestId', '==', requestId],
      }).then((requestActions) => {
        const [requestAction] = requestActions;
        cy.log('request action', requestAction);
        expect(requestAction).to.have.property(
          'createdBy',
          Cypress.env('TEST_UID'),
        );
        expect(requestAction).to.have.property('kind', 5); // took ownership
      });
    });

    it.skip('Supports closing a request once completed', () => {
      cy.get(createSelector('request-info')).should('exist');
    });

    it.skip('Allows admins to make a private comment on the request', () => {
      cy.get(createSelector('request-info')).should('exist');
    });

    it.skip('Allows request creator to make private comment on the request', () => {
      cy.get(createSelector('request-info')).should('exist');
    });

    it.skip('Allows owner to make private comment on the request', () => {
      cy.get(createSelector('request-info')).should('exist');
    });
  });
});
