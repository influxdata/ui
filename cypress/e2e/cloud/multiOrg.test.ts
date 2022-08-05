describe('Multi Org UI', () => {
  // visit the home page after login
  beforeEach(() => {
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(({id}: any) => {
          cy.log('signed in')
          cy.setFeatureFlags({
            quartzIdentity: true,
            multiOrg: true,
            uiUnificationFlag: true,
          }).then(() => {
            cy.log('provisioning')

            cy.quartzProvision({
              accountType: 'pay_as_you_go',
            }).then(() => {
              cy.log('visiting')

              cy.visit('/')
              cy.getByTestID('multiaccountorg-global-header').should(
                'be.visible'
              )
            })
          })
        })
      })
    )
  })

  it('should have the dropdown and be able to select/switch the Account', function() {
    // open the account dropdown
    const accountDropdown = cy.getByTestID(
      'multiaccountorg-global-header--account-dropdown'
    )
    accountDropdown.click()

    cy.getByTestID('multiaccountorg-global-header--account-menu').should(
      'be.visible'
    )

    cy.getByTestID(
      'multiaccountorg-global-header--account-menu-Settings'
    ).should('be.visible')

    const mainMenuSettings = cy.getByTestID(
      'multiaccountorg-global-header--account-menu-Settings'
    )

    mainMenuSettings.click()

    // This is where it's gonna be impossible to test unless we make a call to IDPE.

    cy.getByTestID(
      'multiaccountorg-global-header--account-menu-Billing'
    ).should('be.visible')

    // Click the settings page

    // Click the billing page

    // click the switch org button
    // const switchOrgsButton = cy.getByTestID(
    //   'global-header-account-dropdown--switch-button'
    // )
    // switchOrgsButton.click()

    // // verify that the input field is visible
    // const searchOrgInputField = cy.getByTestID('dropdown-input-typeAhead--menu')
    // searchOrgInputField.should('be.visible')

    // // type in the org name
    // const accountName = 'Veganomicon'
    // const accountId = 'ac3d3c04b8f1a545'
    // searchOrgInputField.type(accountName)

    // // select the org
    // const accountDropdownItem = cy.getByTestID(`typeAhead-item--0`)
    // accountDropdownItem.click()

    // // verify that the org id was visited
    // cy.url().then($url => {
    //   expect($url).to.include(accountId)
    // })
  })

  // Assuming that the user has more than one account
  it('should have the dropdown and be able to select/switch the Organization', function() {
    // open the dropdown
    const orgDropdown = cy.getByTestID('global-header-org-dropdown')
    orgDropdown.click()

    // click the switch org button
    const switchOrgsButton = cy.getByTestID(
      'global-header-org-dropdown--switch-button'
    )
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
    cy.url().then($url => {
      expect($url).to.include(orgId)
    })
  })

  it('should have the user avatar and user initials and be able to open the user option popover by clicking on the avatar', function() {
    const avatarButton = cy.getByTestID('global-header-user-avatar')

    avatarButton.should('exist')
    // check avatarButton text to say "JS" (from mock data)
    avatarButton.should('have.text', 'JS')

    // open the popover
    avatarButton.click()

    const userOptionsPopover = cy.getByTestID('global-header--user-popover')
    userOptionsPopover.should('be.visible')

    userOptionsPopover.should('contain.text', 'Jane Smith')
    userOptionsPopover.should('contain.text', 'test@influxdata.com')

    userOptionsPopover.should('contain', 'Log Out')
    userOptionsPopover.should('contain', 'Profile')
  })
})
