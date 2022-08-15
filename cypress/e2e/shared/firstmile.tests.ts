describe('First mile experience', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
  })

  it('should load the main home-page that has the language tiles', function() {
    cy.getByTestID('home-page--header').should('exist')
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
      cy.getByTestID('python-next-button').click()
      cy.contains('Install Dependencies')

      // third page is create token
      cy.getByTestID('python-next-button').click()
      cy.contains('Tokens')

      // fourth page is initialize client
      cy.getByTestID('python-next-button').click()
      cy.contains('Initialize Client')

      // fifth page is write data
      cy.getByTestID('python-next-button').click()
      cy.contains('Write Data')

      // sixth page is execute query
      cy.getByTestID('python-next-button').click()
      cy.contains('Execute a Flux Query')

      // seventh page is execute aggregate query
      cy.getByTestID('python-next-button').click()
      cy.contains('Execute an Aggregate Query')

      // eight page is finish
      cy.getByTestID('python-next-button').click()
      cy.contains('Congrats!')
    })

    describe('Subway Nav Bar', () => {
      it('navigates to the correct page when the respective navigation button is clicked', function() {
        cy.get('h1').contains('Hello, Time-Series World!')

        cy.getByTestID('python-prev-button').should('be.disabled')

        cy.contains(/^Install Dependencies$/).click()
        cy.get('h1').contains('Install Dependencies')

        cy.contains('Previous').should('not.be.disabled')

        cy.contains(/^Tokens$/).click()
        cy.get('h1').contains('Tokens')

        cy.contains(/^Initialize Client$/).click()
        cy.get('h1').contains('Initialize Client')

        cy.contains(/^Write Data$/).click()
        cy.get('h1').contains('Write Data')

        cy.contains(/^Execute a Simple Query$/).click()
        cy.contains('Execute a Flux Query')

        cy.contains(/^Execute an Aggregate Query$/).click()
        cy.get('h1').contains('Execute an Aggregate Query')

        cy.contains(/^Finish$/).click()
        cy.contains('Congrats!')

        cy.getByTestID('python-next-button').should('be.disabled')
      })
    })
  })
})
