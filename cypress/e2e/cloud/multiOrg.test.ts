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

  it.skip('should have the dropdown and be able to select/switch the Account', function() {
    // open the account dropdown
    const accountDropdown = cy.getByTestID('global-header-account-dropdown')
    accountDropdown.click()

    // click the switch org button
    const switchOrgsButton = cy.getByTestID('global-header-account-dropdown--switch-button')
    switchOrgsButton.click()

    // verify that the input field is visible
    const searchOrgInputField = cy.getByTestID('dropdown-input-typeAhead--menu')
    searchOrgInputField.should('be.visible')

    // type in the org name
    const accountName = 'Veganomicon'
    const accountId = 'ac3d3c04b8f1a545'
    searchOrgInputField.type(accountName)

    // select the org
    const accountDropdownItem = cy.getByTestID(`typeAhead-item--0`)
    accountDropdownItem.click()

    // verify that the org id was visited
    cy.url().then(($url) => {
      expect($url).to.include(accountId)
    })

  })

  // Assuming that the user has more than one account
  it('should have the dropdown and be able to select/switch the Organization', function() {
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
    const orgId = 'ac3d3c04b8f1a545'
    searchOrgInputField.type(orgName)

    // select the org
    const orgDropdownItem = cy.getByTestID(`typeAhead-item--0`)
    orgDropdownItem.click()

    // verify that the org id was visited
    cy.url().then(($url) => {
      expect($url).to.include(orgId)
    })

  })
})
