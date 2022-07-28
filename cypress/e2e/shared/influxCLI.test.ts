describe('Influx CLI onboarding', () => {
    beforeEach(() => {
        cy.flush()
    cy.signin()
    cy.setFeatureFlags({onboardCLI: true})
    })
})