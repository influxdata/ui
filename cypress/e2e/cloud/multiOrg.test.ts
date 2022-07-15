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
  it.only('should have the dropdown and be able to select/switch the Organization', function() {
    // open the dropdown
    const orgDropdown = cy.getByTestID('global-header-org-dropdown')
    orgDropdown.click()

    // click the switch org button
    const switchOrgsButton = cy.getByTestID('global-header-org-dropdown--switch-button')
    switchOrgsButton.click()

    // verify that the input field is visible
    const searchOrgInputField = cy.getByTestID('dropdown-input-typeAhead--menu')
    searchOrgInputField.should('be.visible')

    // type in the org name
    const orgName = 'Test Org 2'
    const orgId = 'aa87ab3e-a705-4c19-b16a-090e344a4c11' // TODO: need quartz-mock to send consistent ID's
    searchOrgInputField.type(orgName)

    // select the org
    const orgDropdownItem = cy.getByTestID(`global-header-org-dropdown-typeAhead-item--0`)
    orgDropdownItem.click()

    // verify that the org id was visited
    cy.url().then(($url) => {
      expect($url).to.include(orgId)
    })

  })
})
