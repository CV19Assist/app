import { createSelector } from '../utils';

describe('Contact Page', () => {
  beforeEach(() => {
    cy.visit('/contact');
  });

  it('Shows contact page content', () => {
    cy.get(createSelector('contact-content')).should('exist');
  });
});
