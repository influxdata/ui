describe('Checkout Page should not be accessible for non-free users', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.setFeatureFlags({
          multiOrg: true,
        }).then(() => {
          cy.get('@org').then(() => {
            cy.getByTestID('home-page--header').should('be.visible')
            cy.quartzProvision({
              accountType: 'pay_as_you_go',
            }).then(() => {
              cy.visit(`/checkout`)
            })
          })
        })
      })
    )
  )

  it('should render a 404', () => {
    cy.getByTestID('not-found').should('exist')
  })
})
