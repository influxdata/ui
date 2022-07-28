describe('Influx CLI onboarding', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.setFeatureFlags({firstMile: true})
    cy.setFeatureFlags({onboardCLI: true})
  })

  it('should load the main home-page that has the language tiles', function() {
    cy.getByTestID('home-page--header').should('exist')
    cy.getByTestID('language-tiles--scrollbox').should('exist')
  })

  describe('InfluxCLI', () => {
    beforeEach(() => {
      cy.getByTestID('homepage-wizard-tile--cli').click()
    })
  })
})
