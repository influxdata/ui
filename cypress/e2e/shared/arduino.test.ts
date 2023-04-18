describe('Arduino onboarding flow', () => {
  const isIOxOrg = Boolean(Cypress.env('useIox'))
  
  beforeEach(() => {
    cy.flush()
    cy.signin()
  })

  it('should load the main home-page that has the arduino tile', function () {
    cy.skipOn(isIOxOrg)
    cy.getByTestID('home-page--header').should('exist')
  })

  describe('Arduino wizard', () => {
    it('runs through the arduino wizard pages', function () {
      cy.getByTestID('homepage-wizard-language-tile--arduino').click()

      cy.getByTestID('subway-nav').should('exist')

      // first page is overview
      cy.contains('Hello, Time-Series World!')

      // second page is prepare ide
      cy.getByTestID('arduino-next-button').click()
      cy.contains('Prepare Arduino IDE')

      // third page is install dependencies
      cy.getByTestID('arduino-next-button').click()
      cy.contains('Install Dependencies')

      // fourth page is initialize client
      cy.getByTestID('arduino-next-button').click()
      cy.contains('Initialize Client')

      // fifth page is write data
      cy.getByTestID('arduino-next-button').click()
      cy.contains('Write Data')

      // sixth page is execute query
      cy.getByTestID('arduino-next-button').click()
      cy.contains('Execute a Flux Query')

      // seventh page is execute aggregate query
      cy.getByTestID('arduino-next-button').click()
      cy.contains('Execute a Flux Aggregate Query')

      // eighth page is finish
      cy.getByTestID('arduino-next-button').click()
      cy.contains('Congrats!')
    })
    describe('Subway Nav Bar', () => {
      it('navigates to the correct page when the respective navigation button is clicked', function () {
        cy.getByTestID('homepage-wizard-language-tile--arduino').click()

        cy.get('h1').contains('Hello, Time-Series World!')

        cy.getByTestID('arduino-prev-button').should('be.disabled')

        cy.contains(/^Prepare Arduino IDE$/).click()
        cy.get('h1').contains('Prepare Arduino IDE')

        cy.contains(/^Install Dependencies$/).click()
        cy.get('h1').contains('Install Dependencies')

        cy.getByTestID('arduino-prev-button').should('not.be.disabled')

        cy.contains(/^Initialize Client$/).click()
        cy.get('h1').contains('Initialize Client')

        cy.contains(/^Write Data$/).click()
        cy.get('h1').contains('Write Data')

        cy.contains(/^Execute a Flux Query$/).click()
        cy.get('h1').contains('Execute a Flux Query')

        cy.contains(/^Execute an Aggregate Query$/).click()
        cy.get('h1').contains('Execute a Flux Aggregate Query')

        cy.contains(/^Finish$/).click()
        cy.contains('Congrats!')

        cy.getByTestID('arduino-next-button').should('be.disabled')
      })
    })
  })
})
