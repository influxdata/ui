describe('Influx CLI onboarding', () => {
  const isIOxOrg = Boolean(Cypress.env('useIox'))
  
  beforeEach(() => {
    cy.flush()
    cy.signin()
  })

  it('should load the main home-page that has the cli tile', function () {
    cy.skipOn(isIOxOrg)
    cy.getByTestID('home-page--header').should('exist')
  })

  describe('InfluxCLI', () => {
    beforeEach(() => {
      cy.getByTestID('homepage-wizard-tile--cli').click()
    })
    it('runs through the cli wizard pages', function () {
      cy.getByTestID('subway-nav').should('exist')

      // first page is overview
      cy.contains('Hello, Time-Series World!')

      // second page is install dependencies
      cy.getByTestID('cli-next-button').click()
      cy.contains('Install Dependencies')

      // third page is initialize client
      cy.getByTestID('cli-next-button').click()
      cy.contains('Initialize Client')

      // fourth page is write data
      cy.getByTestID('cli-next-button').click()
      cy.contains('Write Data')

      // fifth page is execute query
      cy.getByTestID('cli-next-button').click()
      cy.contains('Execute a Flux Query')

      // sixth page is execute aggregate query
      cy.getByTestID('cli-next-button').click()
      cy.contains('Execute a Flux Aggregate Query')

      // seventh page is finish
      cy.getByTestID('cli-next-button').click()
      cy.contains('Congrats!')
    })
    describe('Subway Nav Bar', () => {
      it('navigates to the correct page when the respective navigation button is clicked', function () {
        cy.get('h1').contains('Hello, Time-Series World!')

        cy.getByTestID('cli-prev-button').should('be.disabled')

        cy.contains(/^Install Dependencies$/).click()
        cy.get('h1').contains('Install Dependencies')

        cy.getByTestID('cli-prev-button').should('not.be.disabled')

        cy.contains(/^Initialize Client$/).click()
        cy.get('h1').contains('Initialize Client')

        cy.contains(/^Write Data$/).click()
        cy.get('h1').contains('Write Data')

        cy.contains(/^Execute a Flux Query$/).click()
        cy.contains('Execute a Flux Query')

        cy.contains(/^Execute an Aggregate Query$/).click()
        cy.get('h1').contains('Execute a Flux Aggregate Query')

        cy.contains(/^Finish$/).click()
        cy.contains('Congrats!')

        cy.getByTestID('cli-next-button').should('be.disabled')
      })
    })
  })
})
