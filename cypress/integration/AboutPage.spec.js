import { createSelector } from '../utils';

describe('About Page', () => {
  beforeEach(() => {
    cy.visit('/about');
  });

  it('Shows about page content', () => {
    cy.get(createSelector('about-content')).should('exist');
  });
});
