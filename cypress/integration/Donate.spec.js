import { createSelector } from '../utils';

describe('Donate Page', () => {
  beforeEach(() => {
    cy.visit('/donate');
  });

  it('Shows donate page content', () => {
    cy.get(createSelector('donate-content')).should('exist');
  });
});
