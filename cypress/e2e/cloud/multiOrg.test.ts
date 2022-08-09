// Next steps:

// 0. // Need a separate step for checking whether the user profile avatar works and allows you to get to the page.
// 1. stub network requests so that we can replicate errors
// 2. check whether only one part renders if dont get back full array
// 3. organize and make more concise - see if you can remove anything
// 4. debug the issue arising with quartzMock.

describe('Multi Org Tests', () => {
  before(() => {
    cy.intercept('PUT', '/api/v2/quartz/accounts/resetAllAccountOrgs').as(
      'resetOrgMock'
    )

    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(({id}: Organization) => {
          cy.getByTestID('home-page--header').should('be.visible')
          cy.setFeatureFlags({
            uiUnificationFlag: true,
            quartzIdentity: true,
            multiOrg: true,
          })
            .then(() => {
              cy.request('PUT', '/api/v2/quartz/accounts/resetAllAccountOrgs')
            })
            // .then(() => {
            //   cy.wait('@resetOrgMock')
            // })
            .then(() => {
              cy.wait(2000).then(() => {
                cy.visit('/me/profile')
              })
            })
            .then(() => {
              cy.getByTestID('user-profile-page')
            })
        })
      })
    )
  })

  describe('displays the `user details` data', () => {
    it('displays the `user details` form field', function() {
      cy.getByTestID('user-profile-page')
        .contains('User Profile')
        .should('be.visible')
      cy.getByTestID('user-details-header')
        .contains('User Details')
        .should('be.visible')
    })

    it("displays the user's email", () => {
      cy.getByTestID('user-profile-page--email')
        .contains('Email')
        .should('be.visible')

      cy.getByTestID('user-profile-page--email-input').should(
        'have.attr',
        'value',
        'test@influxdata.com'
      )
    })

    it("displays the user's first name", () => {
      cy.getByTestID('user-profile-page--firstname')
        .contains('First name')
        .should('be.visible')
      cy.getByTestID('user-profile-page--firstname-input').should(
        'have.attr',
        'value',
        'Marty'
      )
    })

    it("displays the user's last name", () => {
      cy.getByTestID('user-profile-page--lastname')
        .contains('Last name')
        .should('be.visible')
      cy.getByTestID('user-profile-page--lastname-input').should(
        'have.attr',
        'value',
        'McFly'
      )
    })
  })
})

describe('displays the `user defaults` form', () => {
  it('displays the `user defaults` form field', () => {
    cy.getByTestID('user-defaults-change-account-header')
      .contains('Default Account')
      .should('be.visible')

    it('displays the save button', () => {
      cy.getByTestID('user-profile--save-button')
        .contains('Save Changes')
        .should('be.visible')
      cy.getByTestID('user-profile--save-button').should(
        'have.attr',
        'disabled'
      )
    })
  })

  it('displays the `change default account` form field', () => {
    cy.getByTestID('user-defaults-change-account--dropdown-header')
      .contains('Default Account')
      .should('be.visible')
    cy.getByTestID('user-defaults-change-account--dropdown')
      .contains('Veganomicon')
      .should('be.visible')
  })

  it('displays the `change default org` form field', () => {
    cy.getByTestID('user-defaults-change-org--header')
      .contains('Default Organization')
      .should('be.visible')
    cy.getByTestID('change-default-org--current-account-header')
      .contains('Account')
      .should('be.visible')
    cy.getByTestID('change-default-org--current-account-input').should(
      'have.attr',
      'value',
      'Influx'
    )

    cy.getByTestID('change-default-org--default-org-header')
      .contains('Default Organization')
      .should('be.visible')
    cy.getByTestID('change-default-org--default-org-dropdown')
      .contains('Test Org 0')
      .should('be.visible')
  })

  it('changes the default account using the dropdown', function() {
    // Make sure to test notifying the user if the attempt to change accounts fails

    // Successfully change the default account by clicking through the typeahead.
    cy.getByTestID('user-defaults-change-account--dropdown').click()
    cy.getByTestID('user-defaults-change-account--dropdown')
      .get('.global-header--typeahead-item')
      .contains('Influx')
      .click()

    // this is necessary for now because we've gotta click outside the menu for the save to work.
    cy.getByTestID('user-defaults-change-account-header').click({force: true})

    cy.getByTestID('user-profile--save-button').click('center', {
      force: true,
    })

    cy.wait(500).then(() => {
      cy.getByTestID('notification-success')
        .contains('Saved changes to your profile.')
        .should('exist')
        .then(() => {
          cy.getByTestID('user-defaults-change-account--dropdown')
            .contains('Influx')
            .should('be.visible')

          cy.getByTestID('notification-success--dismiss').click({force: true})
        })
    })
  })

  it('changes the default account using the typeahead', () => {
    cy.getByTestID('user-defaults-change-account--dropdown').click()

    // Need to figure out why this is getting applied to two DOM elements instead of one.
    cy.getByTestID('user-defaults-change-account--dropdown-header')
      .type('Vega')
      .then(() => {
        cy.getByTestID('user-defaults-change-account--dropdown')
          .get('.global-header--typeahead-item')
          .contains('Veganomicon')
          .click()
      })

    // this is necessary for now because we've gotta click outside the menu for the save to work.
    cy.getByTestID('user-defaults-change-account-header').click({force: true})

    cy.getByTestID('user-profile--save-button').click('center', {
      force: true,
    })

    cy.wait(500).then(() => {
      cy.getByTestID('user-defaults-change-account--dropdown')
        .contains('Veganomicon')
        .should('be.visible')
      cy.getByTestID('notification-success')
        .contains('Saved changes to your profile.')
        .should('exist')

      cy.getByTestID('notification-success--dismiss').click({force: true})
    })
  })

  it('changes the default org using the dropdown', () => {
    // Make sure to test notifying the user if the attempt to change accounts fails

    // Successfully change the default account by clicking through the typeahead.
    cy.getByTestID('change-default-org--default-org-dropdown').click()
    cy.getByTestID('change-default-org--default-org-dropdown')
      .get('.global-header--typeahead-item')
      .contains('Test Org 2')
      .click()

    // this is necessary for now because we've gotta click outside the menu for the save to work.
    // does not matter what is being clicked here
    cy.getByTestID('user-defaults-change-account-header').click({force: true})

    cy.getByTestID('user-profile--save-button').click('center', {
      force: true,
    })

    cy.wait(500).then(() => {
      cy.getByTestID('notification-success')
        .contains('Saved changes to your profile.')
        .should('exist')
        .then(() => {
          cy.getByTestID('change-default-org--default-org-dropdown')
            .contains('Test Org 2')
            .should('be.visible')

          cy.getByTestID('notification-success--dismiss').click({force: true})
        })
    })
  })

  it('changes the default org using the typeahead', () => {
    // Need to figure out why this is getting applied to two DOM elements instead of one.
    cy.getByTestID('change-default-org--default-org-dropdown')
      .click()
      .getByTestID('input-field')
      .type('Test Org 5')
      .then(() => {
        cy.getByTestID('change-default-org--default-org-dropdown')
          .get('.global-header--typeahead-item')
          .contains('Test Org 5')
          .click()
      })

    cy.getByTestID('user-profile--save-button').click({force: true})

    cy.wait(500).then(() => {
      cy.getByTestID('change-default-org--default-org-dropdown')
        .contains('Test Org 5')
        .should('be.visible')
      cy.get('.cf-notification-container')
        .contains('Saved changes to your profile.')
        .should('exist')

      cy.getByTestID('notification-success--dismiss').click({force: true})
    })
  })

  it('changes the default account and default org simultaneously', () => {
    // Default Account
    cy.getByTestID('user-defaults-change-account--dropdown-header')
      .type('Inf')
      .then(() => {
        cy.getByTestID('user-defaults-change-account--dropdown')
          .get('.global-header--typeahead-item')
          .contains('Influx')
          .click()
      })

    // Default Org
    cy.getByTestID('change-default-org--default-org-dropdown')
      .click()
      .getByTestID('input-field')
      .type('Test Org 1')
      .then(() => {
        cy.getByTestID('change-default-org--default-org-dropdown')
          .get('.global-header--typeahead-item')
          .contains('Test Org 1')
          .click()
      })

    cy.getByTestID('user-profile--save-button').click({force: true})

    cy.wait(500).then(() => {
      cy.getByTestID('user-defaults-change-account--dropdown')
        .contains('Influx')
        .should('be.visible')

      cy.getByTestID('change-default-org--default-org-dropdown')
        .contains('Test Org 1')
        .should('be.visible')

      cy.get('.cf-notification-container')
        .contains('Saved changes to your profile.')
        .should('exist')

      cy.getByTestID('notification-success--dismiss').click({force: true})
    })
  })
})
