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
    const publicPath = `requests_public/${requestId}`;
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
      cy.callFirestore('set', `requests/${requestId}`, requestObj);
      cy.callFirestore('set', publicPath, {
        d: requestObj,
      });
      cy.callFirestore('set', `requests_contact/${requestId}`, {
        email,
        phone,
      });
      cy.visit(`/requests/${requestId}`);
    });

    it('Renders request info', () => {
      cy.get(createSelector('request-info')).should('exist');
    });

    it('Supports accepting the request', () => {
      cy.get(createSelector('request-assign-button')).click();
      cy.get(createSelector('request-action-dialog')).should('exist');
      cy.get(createSelector('request-action-submit-button')).click();
      // Wait for Firestore update to occur before continuing
      cy.waitUntil(() =>
        cy
          .callFirestore('get', publicPath)
          .then(
            (request) =>
              request.d && request.d.owner === Cypress.env('TEST_UID'),
          ),
      );
      // Confirm that correct data is written to Request
      cy.callFirestore('get', publicPath).then((request) => {
        expect(request).to.have.nested.property(
          'd.owner',
          Cypress.env('TEST_UID'),
        );
        expect(request).to.have.nested.property('d.status', 10);
        expect(request).to.have.nested.property('d.ownerInfo.takenAt');
      });
      // Confirm that request action is created
      cy.callFirestore('get', 'requests_actions', {
        where: ['requestId', '==', requestId],
        limit: 1,
      }).then((requestActions) => {
        const [requestAction] = requestActions;
        expect(requestAction).to.have.property(
          'createdBy',
          Cypress.env('TEST_UID'),
        );
        expect(requestAction).to.have.property('kind', 10); // took ownership
      });
    });

    it('Supports releasing an already accepted request', () => {
      cy.get(createSelector('request-release-button')).click();
      cy.get(createSelector('request-action-dialog')).should('exist');
      cy.get(createSelector('request-action-comment')).type('test');
      cy.get(createSelector('request-action-submit-button')).click();
      // Wait for Firestore update to occur before continuing
      cy.waitUntil(() =>
        cy
          .callFirestore('get', publicPath)
          .then((request) => request.d && request.d.owner === null),
      );
      // Confirm that correct data is written to request
      cy.callFirestore('get', publicPath).then((request) => {
        expect(request).to.have.nested.property('d.owner', null);
        expect(request).to.have.nested.property('d.ownerInfo', null);
        expect(request).to.have.nested.property('d.status', 1); // switch status back
      });
      // Confirm that request action is created
      cy.callFirestore('get', 'requests_actions', {
        where: ['requestId', '==', requestId],
        orderBy: ['createdAt', 'desc'],
      }).then((requestActions) => {
        const [requestAction] = requestActions;
        expect(requestAction).to.have.property(
          'createdBy',
          Cypress.env('TEST_UID'),
        );
        expect(requestAction).to.have.property('kind', 5); // took ownership
      });
      // Confirm that request discussion is created
      cy.callFirestore('get', 'requests_discussions', {
        where: ['requestId', '==', requestId],
        orderBy: ['createdAt', 'desc'],
      }).then((requestActions) => {
        const [requestAction] = requestActions;
        expect(requestAction).to.have.property(
          'createdBy',
          Cypress.env('TEST_UID'),
        );
        expect(requestAction).to.have.property('kind', 5); // took ownership
      });
    });

    it.skip('Supports closing a request once completed', () => {
      cy.get(createSelector('request-complete-button')).click();
      cy.get(createSelector('request-action-dialog')).should('exist');
      cy.get(createSelector('request-action-comment')).type('test');
      cy.get(createSelector('request-action-submit-button')).click();
      // Confirm that correct data is written to Firestore
      cy.callFirestore('get', publicPath).then((request) => {
        cy.log('request', request);
        expect(request).to.have.nested.property(
          'd.owner',
          Cypress.env('TEST_UID'),
        );
        expect(request).to.have.nested.property('d.status', 1); // switch status back
        expect(request).to.have.nested.property('d.ownerInfo.takenAt');
      });
      // Confirm that request action is created
      cy.callFirestore('get', 'requests_actions', {
        where: ['requestId', '==', requestId],
      }).then((requestActions) => {
        const [requestAction] = requestActions;
        expect(requestAction).to.have.property(
          'createdBy',
          Cypress.env('TEST_UID'),
        );
        expect(requestAction).to.have.property('kind', 5); // took ownership
      });
      // Confirm that request discussion is created
      cy.callFirestore('get', 'requests_discussions', {
        where: ['requestId', '==', requestId],
      }).then((requestActions) => {
        const [requestAction] = requestActions;
        expect(requestAction).to.have.property(
          'createdBy',
          Cypress.env('TEST_UID'),
        );
        expect(requestAction).to.have.property('kind', 5); // took ownership
      });
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
