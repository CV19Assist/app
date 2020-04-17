import { createSelector } from '../utils';

describe('Search Page', () => {
  beforeEach(() => {
    cy.visit('/search');
  });

  it('Shows places dropdown and shows no results', () => {
    cy.get(createSelector('new-location-button')).should('exist');
    cy.get(createSelector('new-location-button')).click();
    cy.get(createSelector('places-autocomplete')).should('exist');

    // Test a bad address
    cy.get(createSelector('address-entry')).type('SomeNonExistentPlace');
    cy.get('.MuiAutocomplete-listbox').should('not.exist');
    cy.get('.MuiAutocomplete-noOptions').should('exist');
  });

  it('Shows places dropdown and validate a few results', () => {
    cy.get(createSelector('new-location-button')).should('exist');
    cy.get(createSelector('new-location-button')).click();
    cy.get(createSelector('places-autocomplete')).should('exist');

    // Test a simple entry
    cy.get(createSelector('address-entry')).type('Madison, WI');
    cy.get('.MuiAutocomplete-listbox').should('exist');
    cy.get('.MuiAutocomplete-listbox')
      .find('li')
      .its('length')
      .should('be.gte', 1);
    cy.get('.MuiAutocomplete-noOptions').should('not.exist');

    cy.get('.MuiAutocomplete-listbox').find('li').first().click();
  });

  // TODO: Add more tests that check actual results.

  // TODO: Decide how best to test the empty results.
  // it('Empty results', () => {
  //   cy.get(createSelector('no-requests-found')).should('exist');
  // });
});
