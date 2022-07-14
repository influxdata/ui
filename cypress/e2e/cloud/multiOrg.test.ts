describe('Multi Org UI', () => {
  // visit the home page after login
  beforeEach(() => {
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(() => {
          cy.setFeatureFlags({
            quartzIdentity: true,
            multiOrg: true,
          }).then(() => {
            cy.quartzProvision({
              accountType: 'pay_as_you_go',
            }).then(() => {
              cy.getByTestID('multiaccountorg-global-header').should('exist');
            })
          })
        })
      })
    )
  })

  it('should be able to view all accounts and switch the Account from the dropdown', function() {
  })

  // Assuming that the user has more than one account
  it.only('should have the dropdown to select/switch the Organization', function() {
    const orgDropdown = cy.getByTestID('global-header-org-dropdown')
    orgDropdown.click()

    const switchOrgsButton = cy.getByTestID('global-header-org-dropdown--switch-button')
    switchOrgsButton.click()

  })
})
