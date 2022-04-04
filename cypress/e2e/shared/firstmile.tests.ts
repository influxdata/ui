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
      cy.contains('Hello, Time-Series World!')

      // second page is install dependencies
      cy.contains('Next').click()
      cy.contains('Install Dependencies')

      // third page is create token
      cy.contains('Next').click()
      cy.contains('Create a Token')

      // fourth page is initalize client
      cy.contains('Next').click()
      cy.contains('Initalize Client')

      // fifth page is write data
      cy.contains('Next').click()
      cy.contains('Write Data')

      // sixth page is execute query
      cy.contains('Next').click()
      cy.contains('Execute a Flux Query')

      // seventh page is execute aggregate query
      cy.contains('Next').click()
      cy.contains('Execute an Aggregate Query')

      // eight page is finish
      cy.contains('Next').click()
      cy.contains('Congrats!')
    })
  })
})
