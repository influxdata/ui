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
    it("runs through the python's wizard pages", function() {
      cy.getByTestID('subway-nav').should('exist')

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

    describe('Subway Nav Bar', () => {
      it('navigates to the correct page when the respective navigation button is clicked', function() {
        cy.get('h1').contains('Hello, Time-Series World!')

        cy.contains('Previous').should('be.disabled')

        cy.contains('Install Dependencies').click()
        cy.get('h1').contains('Install Dependencies')

        cy.contains('Previous').should('not.be.disabled')

        cy.contains('Create a Token').click()
        cy.get('h1').contains('Create a Token')

        cy.contains('Initialize Client').click()
        cy.get('h1').contains('Initialize Client')

        cy.contains('Write Data').click()
        cy.get('h1').contains('Write Data')

        cy.contains('Execute a Simple Query').click()
        cy.contains('Execute a Flux Query')

        cy.contains('Execute an Aggregate Query').click()
        cy.get('h1').contains('Execute an Aggregate Query')

        cy.contains('Finish').click()
        cy.contains('Congrats!')

        cy.contains('Next').should('be.disabled')
      })
    })
  })
})
