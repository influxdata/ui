describe('Home Page Tests', () => {
  // Create tests for the home page. Issue: https://github.com/influxdata/ui/issues/939
  beforeEach(() => {
    cy.flush()
    cy.signin()
  })

  it('loads home page', () => {
    cy.getByTestID('home-page--header').should('exist')
  })
})
