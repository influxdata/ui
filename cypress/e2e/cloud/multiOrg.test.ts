// To - Do
// Debug quartz-mock issue
// Any more tests (1acc?)
// Clean up by removing forces
// Flip through tests to make sure acting as intended

const userProfileFlags = {
  uiUnificationFlag: true,
  quartzIdentity: true,
  multiOrg: true,
}

describe('User Profile page', () => {
  // Reset the array of mock organizations after the test is over so that it doesn't interfere with other tests.

  after(() => {
    cy.request('PUT', '/api/v2/quartz/accounts/resetAllAccountOrgs')
  })

  describe('user profile avatar', () => {
    before(() => {
      cy.flush().then(() =>
        cy.signin().then(() => {
          cy.request('PUT', '/api/v2/quartz/accounts/resetAllAccountOrgs')
          cy.get('@org').then(() => {
            cy.getByTestID('home-page--header').should('be.visible')
            cy.setFeatureFlags(userProfileFlags).then(() => {
              cy.wait(100).then(() => {
                cy.visit('/')
              })
            })
          })
        })
      )
    })

    it('displays the `user profile` avatar', () => {
      cy.getByTestID('global-header-user-avatar').should('be.visible')
    })

    it('displays the popover links', () => {
      cy.getByTestID('global-header-user-avatar').click()
      cy.getByTestID('global-header-user-popover-profile-button').should(
        'be.visible'
      )

      // New URL will be selected correctly, but logout in remocal will look like a 404.
      // This is expected behavior, as no access to real quartz exists.
      cy.getByTestID('global-header-user-popover-logout-button').should(
        'be.visible'
      )
      cy.getByTestID('global-header-user-avatar').click()
    })

    it('navigates to the `user profile` page', () => {
      cy.getByTestID('global-header-user-avatar').click()
      cy.getByTestID('global-header-user-popover-profile-button').click()
      cy.getByTestID('user-profile-page').should('be.visible')
    })

    it('allows the user to log out', () => {
      cy.getByTestID('global-header-user-avatar').click()
      cy.getByTestID('global-header-user-popover-logout-button').click()
      cy.location('pathname').should('eq', '/logout')
    })
  })

  describe('user profile page', () => {
    before(() => {
      cy.flush().then(() =>
        cy.signin().then(() => {
          cy.get('@org').then(() => {
            cy.getByTestID('home-page--header').should('be.visible')
            cy.setFeatureFlags(userProfileFlags).then(() => {
              cy.wait(100).then(() => {
                cy.visit('/me/profile')
              })
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

      describe('allows the user to change their default account', () => {
        it('displays the `change default account` form field when there is more than one account', () => {
          cy.getByTestID('user-defaults-change-account--dropdown-header')
            .contains('Default Account')
            .should('be.visible')
          cy.getByTestID('user-defaults-change-account--dropdown')
            .contains('Veganomicon')
            .should('be.visible')
        })

        it('changes the default account using the dropdown', function() {
          cy.intercept({
            path: '/api/v2/quartz/accounts/default',
            method: 'PUT',
          }).as('putQuartzDefaultAccount')

          cy.getByTestID('user-defaults-change-account--dropdown').click()
          cy.getByTestID('user-defaults-change-account--dropdown')
            .get('.global-header--typeahead-item')
            .contains('Influx')
            .click()

          // this is necessary for now because we've gotta click outside the menu for the save to work.
          cy.getByTestID('user-defaults-change-account-header').click({
            force: true,
          })

          cy.getByTestID('user-profile--save-button').click('center', {
            force: true,
          })

          cy.wait('@putQuartzDefaultAccount').then(() => {
            cy.getByTestID('notification-success')
              .contains('Saved changes to your profile.')
              .should('exist')
              .then(() => {
                cy.getByTestID('user-defaults-change-account--dropdown')
                  .contains('Influx')
                  .should('be.visible')

                cy.getByTestID('notification-success--dismiss').click({
                  force: true,
                })
              })
          })
        })

        it('changes the default account using the typeahead', () => {
          cy.intercept({
            path: '/api/v2/quartz/accounts/default',
            method: 'PUT',
          }).as('putQuartzDefaultAccount')

          cy.getByTestID('user-defaults-change-account--dropdown').click()

          cy.getByTestID('user-defaults-change-account--dropdown-header')
            .type('Vega')
            .then(() => {
              cy.getByTestID('user-defaults-change-account--dropdown')
                .get('.global-header--typeahead-item')
                .contains('Veganomicon')
                .click()
            })

          cy.getByTestID('user-defaults-change-account-header').click({
            force: true,
          })

          cy.getByTestID('user-profile--save-button').click('center', {
            force: true,
          })

          cy.wait('@putQuartzDefaultAccount').then(() => {
            cy.getByTestID('user-defaults-change-account--dropdown')
              .contains('Veganomicon')
              .should('be.visible')
            cy.getByTestID('notification-success')
              .contains('Saved changes to your profile.')
              .should('exist')

            cy.getByTestID('notification-success--dismiss').click({force: true})
          })
        })
      })

      describe('allows the user to change their default org', () => {
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

        it('changes the default org using the dropdown', () => {
          cy.intercept({
            path: '/api/v2/quartz/accounts/**/orgs/default',
            method: 'PUT',
          }).as('putQuartzDefaultOrg')

          cy.getByTestID('change-default-org--default-org-dropdown').click()
          cy.getByTestID('change-default-org--default-org-dropdown')
            .get('.global-header--typeahead-item')
            .contains('Test Org 2')
            .click()

          cy.getByTestID('user-defaults-change-account-header').click({
            force: true,
          })

          cy.getByTestID('user-profile--save-button').click('center', {
            force: true,
          })

          cy.wait('@putQuartzDefaultOrg').then(() => {
            cy.getByTestID('notification-success')
              .contains('Saved changes to your profile.')
              .should('exist')
              .then(() => {
                cy.getByTestID('change-default-org--default-org-dropdown')
                  .contains('Test Org 2')
                  .should('be.visible')

                cy.getByTestID('notification-success--dismiss').click({
                  force: true,
                })
              })
          })
        })

        it('changes the default org using the typeahead', () => {
          cy.intercept({
            path: '/api/v2/quartz/accounts/**/orgs/default',
            method: 'PUT',
          }).as('putQuartzDefaultOrg')

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

          cy.wait('@putQuartzDefaultOrg').then(() => {
            cy.getByTestID('change-default-org--default-org-dropdown')
              .contains('Test Org 5')
              .should('be.visible')
            cy.get('.cf-notification-container')
              .contains('Saved changes to your profile.')
              .should('exist')

            cy.getByTestID('notification-success--dismiss').click({force: true})
          })
        })
      })

      describe('allows the user to change both their default account and org', () => {
        it('changes the default account and default org simultaneously', () => {
          cy.intercept({
            path: '/api/v2/quartz/accounts/default',
            method: 'PUT',
          }).as('putQuartzDefaultAccount')

          cy.intercept({
            path: '/api/v2/quartz/accounts/**/orgs/default',
            method: 'PUT',
          }).as('putQuartzDefaultOrg')

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

          cy.wait(['@putQuartzDefaultOrg', '@putQuartzDefaultAccount']).then(
            () => {
              cy.getByTestID('user-defaults-change-account--dropdown')
                .contains('Influx')
                .should('be.visible')

              cy.getByTestID('change-default-org--default-org-dropdown')
                .contains('Test Org 1')
                .should('be.visible')

              cy.get('.cf-notification-container')
                .contains('Saved changes to your profile.')
                .should('exist')

              cy.getByTestID('notification-success--dismiss').click({
                force: true,
              })
            }
          )
        })
      })

      describe('notifies the user if the attempt to save preferences fails', () => {
        // Failed to save all changes to your profile.
        it('notifies  if the default org did not change', () => {
          cy.intercept('PUT', 'api/v2/quartz/accounts/**/orgs/default', {
            statusCode: 500,
            body: {
              message: 'Internal server error',
            },
          }).as('putQuartzDefaultOrg')
          cy.getByTestID('change-default-org--default-org-dropdown').click()
          cy.getByTestID('change-default-org--default-org-dropdown')
            .get('.global-header--typeahead-item')
            .contains('Test Org 2')
            .click()

          cy.getByTestID('user-defaults-change-account-header').click({
            force: true,
          })

          cy.getByTestID('user-profile--save-button').click('center', {
            force: true,
          })

          cy.wait('@putQuartzDefaultOrg').then(() => {
            cy.getByTestID('notification-error--children')
              .contains(
                'Failed to save all changes to your profile. Please try again.'
              )
              .should('exist')

            cy.getByTestID('notification-error--dismiss').click({force: true})

            cy.getByTestID('change-default-org--default-org-dropdown').click()
            cy.getByTestID('change-default-org--default-org-dropdown')
              .get('.global-header--typeahead-item')
              .contains('Test Org 1')
          })
        })

        it('notifies if the default account did not change', () => {
          cy.intercept('PUT', 'api/v2/quartz/accounts/default', {
            statusCode: 500,
            body: {
              message: 'Internal server error',
            },
          }).as('putQuartzDefaultAccount')

          cy.getByTestID('user-defaults-change-account--dropdown').click({
            force: true,
          })
          cy.getByTestID('user-defaults-change-account--dropdown')
            .get('.global-header--typeahead-item')
            .contains('Veganomicon')
            .click()

          cy.getByTestID('user-profile--save-button').click('center', {
            force: true,
          })

          cy.wait('@putQuartzDefaultAccount').then(() => {
            cy.getByTestID('notification-error--children')
              .contains(
                'Failed to save all changes to your profile. Please try again.'
              )
              .should('exist')

            cy.getByTestID('notification-error--dismiss').click({force: true})

            cy.getByTestID('user-defaults-change-account--dropdown').click({
              force: true,
            })
            cy.getByTestID('user-defaults-change-account--dropdown')
              .get('.global-header--typeahead-item')
              .contains('Influx')
          })
        })
      })
    })
  })
})
