import { createSelector } from '../utils';

describe('Home', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Shows welcome banner', () => {
    cy.get(createSelector('welcome-banner')).should('exist');
  });
});
