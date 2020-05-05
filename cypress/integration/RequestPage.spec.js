import { createSelector } from '../utils';

const requestId = '123ABC';

describe('Request Page', () => {
  describe('when not authenticated', () => {
    it('Shows not found message if request does not exist', () => {
      cy.visit(`/requests/asdf`);
      cy.get(createSelector('request-not-found')).should('exist');
    });
  });

  describe('when authenticated', () => {
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
      // Seed request info in Firestore
      cy.callFirestore('set', `requests/${requestId}`, requestObj);
      cy.callFirestore('set', publicPath, {
        d: requestObj,
      });
      cy.callFirestore('set', `requests_contact/${requestId}`, {
        email,
        phone,
      });
      // Authenticate user
      cy.login();
      // Visit request page
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

    it('Supports closing a request once completed', () => {
      // Confirm that correct data is written to Request
      cy.callFirestore('set', publicPath, {
        d: { status: 10, owner: Cypress.env('TEST_UID') },
      });
      cy.get(createSelector('request-complete-button')).click();
      cy.get(createSelector('request-action-dialog')).should('exist');
      cy.get(createSelector('request-action-comment')).type('test');
      cy.get(createSelector('request-action-submit-button')).click();
      // Wait for Firestore update to occur before continuing
      cy.waitUntil(() =>
        cy
          .callFirestore('get', publicPath)
          .then((request) => request.d && request.d.status === 20),
      );
      // Confirm that correct data is written to request
      cy.callFirestore('get', publicPath).then((request) => {
        expect(request).to.have.nested.property(
          'd.owner',
          Cypress.env('TEST_UID'),
        );
        expect(request).to.have.nested.property('d.status', 20);
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
        expect(requestAction).to.have.property('kind', 20); // request complete
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
        expect(requestAction).to.have.property('kind', 20); // request complete
      });
    });

    it('Allows owner to make private comment on the request', () => {
      const requestObj = {
        status: 10,
        owner: Cypress.env('TEST_UID'),
      };
      cy.callFirestore('update', `requests/${requestId}`, requestObj);
      cy.callFirestore('update', publicPath, {
        d: requestObj,
      });
      cy.get(createSelector('add-private-comment')).scrollIntoView().click();
      const testComment = 'test comment';
      cy.get(createSelector('private-comment-input')).type(testComment);
      cy.get(createSelector('submit-private-comment')).click();
      cy.get(createSelector('private-comment')).should('have.length.gte', 2);
      // Confirm that request discussion is created
      cy.callFirestore('get', 'requests_discussions', {
        where: ['requestId', '==', requestId],
        orderBy: ['createdAt', 'desc'],
        limit: 1,
      }).then(([requestAction]) => {
        expect(requestAction).to.have.property(
          'createdBy',
          Cypress.env('TEST_UID'),
        );
        expect(requestAction).to.have.property('kind', 1);
        expect(requestAction).to.have.property('content', testComment);
        expect(requestAction).to.have.property('contentType', 'text');
      });
    });

    it('Allows admins to make a private comment on the request', () => {
      // Set current user to super-admin role
      cy.callFirestore(
        'set',
        `users/${Cypress.env('TEST_UID')}`,
        {
          role: 'system-admin',
        },
        { merge: true },
      );
      const requestObj = {
        status: 10,
        createdBy: 'BCD234',
        owner: 'ABC123',
      };
      cy.callFirestore('set', `requests/${requestId}`, requestObj, {
        merge: true,
      });
      cy.callFirestore(
        'set',
        publicPath,
        {
          d: requestObj,
        },
        { merge: true },
      );
      cy.get(createSelector('add-private-comment')).scrollIntoView().click();
      const testComment = 'test comment';
      cy.get(createSelector('private-comment-input')).type(testComment);
      cy.get(createSelector('submit-private-comment')).click();
      // Displays the comment in the list
      cy.get(createSelector('private-comment')).should('have.length.gte', 2);
      // Confirm that request discussion is created
      cy.callFirestore('get', 'requests_discussions', {
        where: ['requestId', '==', requestId],
        orderBy: ['createdAt', 'desc'],
        limit: 1,
      }).then(([requestAction]) => {
        expect(requestAction).to.have.property(
          'createdBy',
          Cypress.env('TEST_UID'),
        );
        expect(requestAction).to.have.property('kind', 1);
        expect(requestAction).to.have.property('content', testComment);
        expect(requestAction).to.have.property('contentType', 'text');
      });
    });

    // Skipped since this is not currently supported in the UI
    it.skip('Allows request creator to make private comment on the request', () => {
      const requestObj = {
        createdBy: Cypress.env('TEST_UID'),
        status: 10,
        owner: 'ABC123',
      };
      cy.callFirestore('update', `requests/${requestId}`, requestObj);
      cy.callFirestore('update', publicPath, {
        d: requestObj,
      });
      cy.get(createSelector('add-private-comment')).click();
    });
  });
});
