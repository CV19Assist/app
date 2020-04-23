import firebase from 'firebase/app';
import 'firebase/firestore';
import { createSelector } from '../utils';

const userUid = 'AAAATEST_USER';
describe('My Requests Page', () => {
  it('Redirects to /login if user is not logged in', () => {
    cy.logout();
    cy.visit('/my-requests');
  });

  describe('when logged in', () => {
    beforeEach(() => {
      cy.login(userUid);
      cy.visit('/my-requests');
      cy.callFirestore('delete', 'requests');
    });
    it('Shows requests created by the current user', () => {
      cy.callFirestore('set', 'requests/ABC123', {
        createdBy: userUid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      cy.callFirestore('set', 'requests/ABC234', {
        needs: {
          other: true,
        },
        createdBy: userUid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      cy.get(createSelector('request-card')).should('have.length', 2);
    });
  });
});
