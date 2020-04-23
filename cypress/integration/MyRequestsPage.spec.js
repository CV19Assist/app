import firebase from 'firebase/app';
import 'firebase/firestore';
import { createSelector } from '../utils';

const userUid = 'AAAATEST_USER';
describe('My Requests Page', () => {
  it('Redirects to /login if user is not logged in', () => {
    cy.logout();
    cy.visit('/my-requests');
    cy.url().should('include', 'login');
  });
  // Skipped due to failure in CI as seen here:
  // * https://dashboard.cypress.io/projects/2imhey/runs/11/failures/af33e2d6-b791-4a26-a378-7a377b64c951
  // * https://github.com/CV19Assist/app/runs/610896123?check_suite_focus=true#step:12:362
  // TODO: Unskip this once auth issue in CI is addressed
  describe('when logged in', () => {
    beforeEach(() => {
      cy.login(userUid);
      cy.callFirestore('delete', 'requests');
      cy.reload();
      cy.visit('/my-requests');
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
