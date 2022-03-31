describe('First mile experience', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.setFeatureFlags({firstMile: true})
  })

  it('should load the main home-page that has the language tiles', function() {
    cy.getByTestID('home-page--header').should('exist')
    cy.getByTestID('language-tiles--scrollbox').should('exist')
  })

  describe('Python', () => {
    beforeEach(() => {
      cy.getByTestID('homepage-wizard-language-tile--python').click()
    })
    it('should load python wizard when python tile clicked', function() {
      // subway should exist
      cy.getByTestID('subway-nav').should('exist')
    })

    it("should be able to run through the python's wizard pages", function() {
      // first page is overview
      cy.getByTestID('overview-page-header').should('exist')

      // second page is install dependencies
      cy.getByTestID('next-button').click()
      cy.getByTestID('install-dependencies-page-header').should('exist')

      // third page is create token
      cy.getByTestID('next-button').click()
      cy.getByTestID('tokens-page-header').should('exist')

      // fourth page is initalize client
      cy.getByTestID('next-button').click()
      cy.getByTestID('initialize-client-page-header').should('exist')

      // fifth page is write data
      cy.getByTestID('next-button').click()
      cy.getByTestID('write-data-page-header').should('exist')

      // sixth page is execute query
      cy.getByTestID('next-button').click()
      cy.getByTestID('execute-query-page-header').should('exist')

      // seventh page is execute aggregate query
      cy.getByTestID('next-button').click()
      cy.getByTestID('execute-aggregate-query-page-header').should('exist')

      // eight page is finish
      cy.getByTestID('next-button').click()
      cy.getByTestID('finish-page-header').should('exist')
    })
  })
})
