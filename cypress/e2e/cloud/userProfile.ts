import {
  multipleAccounts,
  multipleOrgs,
  setupProfile,
  singleAccount,
  singleOrg,
} from '../util/userProfileSetup'

describe('User profile page', () => {
  before(() => {
    setupProfile()
  })

  beforeEach(() => {
    // Maintain a session for all tests so that we don't need to log in each time.
    // Cypress 10 may deprecate this in favor of the (currently experimental) https://docs.cypress.io/api/commands/session
    Cypress.Cookies.preserveOnce('sid')
  })

  after(() => {
    cy.request({
      method: 'PUT',
      url: 'api/v2/quartz/accounts/resetAllAccountOrgs',
    })
  })

  describe('displays the `user details` form field', () => {
    it('displays the `user details` form field', () => {
      cy.getByTestID('user-profile--page')
        .contains('User Profile')
        .should('be.visible')

      cy.getByTestID('user-profile--user-details-header')
        .contains('User Details')
        .should('be.visible')
    })

    it("displays the user's email", () => {
      cy.getByTestID('user-profile--email')
        .contains('Email')
        .should('be.visible')

      cy.getByTestID('user-profile--email-input').should(
        'have.attr',
        'value',
        'test@influxdata.com'
      )
    })

    it("displays the user's first name", () => {
      cy.getByTestID('user-profile--firstname')
        .contains('First name')
        .should('be.visible')
      cy.getByTestID('user-profile--firstname-input').should(
        'have.attr',
        'value',
        'Marty'
      )
    })

    it("displays the user's last name", () => {
      cy.getByTestID('user-profile--lastname')
        .contains('Last name')
        .should('be.visible')
      cy.getByTestID('user-profile--lastname-input').should(
        'have.attr',
        'value',
        'McFly'
      )
    })
  })

  describe('displays the `change default account/org` form field', () => {
    describe('user has multiple accounts, or multiple orgs', () => {
      describe('displays the `user defaults` form', () => {
        it('displays the `user defaults` form field', () => {
          cy.getByTestID('user-profile--change-account-header')
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
          it('displays the `change default account` form field', () => {
            cy.getByTestID('user-profile--change-account-header')
              .contains('Default Account')
              .should('be.visible')
            cy.getByTestID('user-profile--change-account-dropdown')
              .contains('Veganomicon')
              .should('be.visible')
          })

          it('changes the default account using the dropdown', () => {
            cy.intercept({
              path: '/api/v2/quartz/accounts/default',
              method: 'PUT',
            }).as('putQuartzDefaultAccount')

            cy.getByTestID('user-profile--change-account-dropdown').click()
            cy.getByTestID('user-profile--change-account-dropdown')
              .getByTestID('dropdown-item')
              .contains('Influx')
              .click()

            cy.getByTestID('user-profile--save-button').click()

            cy.wait('@putQuartzDefaultAccount').then(() => {
              // In cypress, it may :look: as though these notifications were not generated, because this test closes them as soon as they appear.
              cy.getByTestID('notification-success')
                .contains('Saved changes to your profile.')
                .should('exist')
                .then(() => {
                  cy.getByTestID('user-profile--change-account-dropdown')
                    .contains('Influx')
                    .should('be.visible')

                  cy.getByTestID('user-profile--save-button').should(
                    'have.attr',
                    'disabled'
                  )

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

            cy.getByTestID('user-profile--change-account-dropdown').click()

            cy.getByTestID('user-profile--change-account-dropdown')
              .getByTestID('input-field')
              .type('Vega')
              .then(() => {
                cy.getByTestID('user-profile--change-account-dropdown')
                  .getByTestID('dropdown-item')
                  .contains('Veganomicon')
                  .click()
              })

            cy.getByTestID('user-profile--change-account-header').click()

            cy.getByTestID('user-profile--save-button').click()

            cy.wait('@putQuartzDefaultAccount').then(() => {
              cy.getByTestID('user-profile--change-account-dropdown')
                .contains('Veganomicon')
                .should('be.visible')
              cy.getByTestID('notification-success')
                .contains('Saved changes to your profile.')
                .should('exist')

              cy.getByTestID('user-profile--save-button').should(
                'have.attr',
                'disabled'
              )

              cy.getByTestID('notification-success--dismiss').click({
                force: true,
              })
            })
          })
        })

        describe('allows the user to change their default org', () => {
          it('displays the `change default org` form field', () => {
            cy.getByTestID('user-profile--default-org-header')
              .contains('Default Organization')
              .should('be.visible')
            cy.getByTestID('user-profile--current-account-header')
              .contains('Account')
              .should('be.visible')
            cy.getByTestID('user-profile--current-account-input').should(
              'have.attr',
              'value',
              'Influx'
            )

            cy.getByTestID('user-profile--default-org-header')
              .contains('Default Organization')
              .should('be.visible')
            cy.getByTestID('user-profile--default-org-dropdown')
              .contains('Test Org 0')
              .should('be.visible')
          })

          it('changes the default org using the dropdown', () => {
            cy.intercept({
              path: '/api/v2/quartz/accounts/**/orgs/default',
              method: 'PUT',
            }).as('putQuartzDefaultOrg')

            cy.getByTestID('user-profile--default-org-dropdown').click()
            cy.getByTestID('user-profile--default-org-dropdown')
              .getByTestID('dropdown-item')
              .contains('Test Org 2')
              .click()

            cy.getByTestID('user-profile--change-account-header').click()

            cy.getByTestID('user-profile--save-button').click()

            cy.wait('@putQuartzDefaultOrg').then(() => {
              cy.getByTestID('notification-success')
                .contains('Saved changes to your profile.')
                .should('exist')
                .then(() => {
                  cy.getByTestID('user-profile--default-org-dropdown')
                    .contains('Test Org 2')
                    .should('be.visible')

                  cy.getByTestID('user-profile--save-button').should(
                    'have.attr',
                    'disabled'
                  )

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

            cy.getByTestID('user-profile--default-org-dropdown')
              .click()
              .getByTestID('input-field')
              .type('Test Org 5')
              .then(() => {
                cy.getByTestID('user-profile--default-org-dropdown')
                  .getByTestID('dropdown-item')
                  .contains('Test Org 5')
                  .click()
              })

            cy.getByTestID('user-profile--save-button').click()

            cy.wait('@putQuartzDefaultOrg').then(() => {
              cy.getByTestID('user-profile--default-org-dropdown')
                .contains('Test Org 5')
                .should('be.visible')
              cy.get('.cf-notification-container')
                .contains('Saved changes to your profile.')
                .should('exist')

              cy.getByTestID('user-profile--save-button').should(
                'have.attr',
                'disabled'
              )

              cy.getByTestID('notification-success--dismiss').click({
                force: true,
              })
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

            cy.getByTestID('user-profile--change-account-dropdown')
              .type('Inf')
              .then(() => {
                cy.getByTestID('user-profile--change-account-dropdown')
                  .getByTestID('dropdown-item')
                  .contains('Influx')
                  .click()
              })

            // Default Org
            cy.getByTestID('user-profile--default-org-dropdown')
              .click()
              .getByTestID('input-field')
              .type('Test Org 1')
              .then(() => {
                cy.getByTestID('user-profile--default-org-dropdown')
                  .getByTestID('dropdown-item')
                  .contains('Test Org 1')
                  .click()
              })

            cy.getByTestID('user-profile--save-button').click()

            cy.wait(['@putQuartzDefaultOrg', '@putQuartzDefaultAccount']).then(
              () => {
                cy.getByTestID('user-profile--change-account-dropdown')
                  .contains('Influx')
                  .should('be.visible')

                cy.getByTestID('user-profile--default-org-dropdown')
                  .contains('Test Org 1')
                  .should('be.visible')

                cy.get('.cf-notification-container')
                  .contains('Saved changes to your profile.')
                  .should('exist')

                cy.getByTestID('user-profile--save-button').should(
                  'have.attr',
                  'disabled'
                )

                cy.getByTestID('notification-success--dismiss').click({
                  force: true,
                })
              }
            )
          })
        })

        describe('notifies the user if the attempt to save preferences fails', () => {
          it('notifies if the default org did not change', () => {
            cy.intercept('PUT', 'api/v2/quartz/accounts/**/orgs/default', {
              statusCode: 500,
              body: {
                message: 'Internal server error',
              },
            }).as('putQuartzDefaultOrg')
            cy.getByTestID('user-profile--default-org-dropdown').click()
            cy.getByTestID('user-profile--default-org-dropdown')
              .getByTestID('dropdown-item')
              .contains('Test Org 2')
              .click()

            cy.getByTestID('user-profile--change-account-header').click()
            cy.getByTestID('user-profile--save-button').click()

            cy.wait('@putQuartzDefaultOrg').then(() => {
              cy.getByTestID('notification-error--children')
                .contains(
                  'Failed to save all changes to your profile. Please try again.'
                )
                .should('exist')

              cy.getByTestID('notification-error--dismiss').click({force: true})

              cy.getByTestID('user-profile--default-org-dropdown').click()
              cy.getByTestID('user-profile--default-org-dropdown')
                .getByTestID('dropdown-item')
                .contains('Test Org 1')
                .should('be.visible')

              cy.getByTestID('user-profile--save-button').should(
                'not.have.attr',
                'disabled'
              )

              cy.getByTestID('user-profile--email').click()
            })
          })

          it('notifies if the default account did not change', () => {
            cy.intercept('PUT', 'api/v2/quartz/accounts/default', {
              statusCode: 500,
              body: {
                message: 'Internal server error',
              },
            }).as('putQuartzDefaultAccount')

            cy.getByTestID('user-profile--change-account-dropdown').click()
            cy.getByTestID('user-profile--change-account-dropdown')
              .getByTestID('dropdown-item')
              .contains('Veganomicon')
              .click()

            cy.getByTestID('user-profile--save-button').click()

            cy.wait('@putQuartzDefaultAccount').then(() => {
              cy.getByTestID('notification-error--children')
                .contains(
                  'Failed to save all changes to your profile. Please try again.'
                )
                .should('exist')

              cy.getByTestID('notification-error--dismiss').click({force: true})

              cy.getByTestID('user-profile--change-account-dropdown').click()
              cy.getByTestID('user-profile--change-account-dropdown')
                .getByTestID('dropdown-item')
                .contains('Influx')
                .should('be.visible')

              cy.getByTestID('user-profile--save-button').should(
                'not.have.attr',
                'disabled'
              )

              cy.getByTestID('user-profile--email').click()
            })
          })
        })
      })
    })

    describe('user has only one account, or only one org', () => {
      beforeEach(() => {
        setupProfile()
      })

      it('displays no `change defaults` form if there is only one account, and only org in that account', () => {
        cy.intercept('GET', '/api/v2/quartz/accounts', {
          statusCode: 200,
          body: singleAccount,
        }).as('getAccounts')

        cy.intercept('GET', 'api/v2/quartz/accounts/**/orgs', {
          statusCode: 200,
          body: singleOrg,
        }).as('getOrgs')

        cy.getByTestID('user-profile--user-details-header')
          .contains('User Details')
          .should('be.visible')

        cy.getByTestID('user-profile--change-account-header').should(
          'not.exist'
        )

        cy.getByTestID('user-profile--default-org-header').should('not.exist')

        cy.getByTestID('user-profile--save-button').should('not.exist')
      })

      it('displays everything but the `switch default account` form if there is only one account', () => {
        cy.intercept('GET', '/api/v2/quartz/accounts', {
          statusCode: 200,
          body: singleAccount,
        }).as('getAccounts')

        cy.intercept('GET', 'api/v2/quartz/accounts/**/orgs', {
          statusCode: 200,
          body: multipleOrgs,
        }).as('getOrgs')

        cy.getByTestID('user-profile--user-details-header')
          .contains('User Details')
          .should('be.visible')

        cy.getByTestID('user-profile--default-org-header')
          .contains('Default Organization')
          .should('be.visible')

        cy.getByTestID('user-profile--save-button')
          .contains('Save Changes')
          .should('be.visible')

        cy.getByTestID('user-profile--change-account-header').should(
          'not.exist'
        )
      })

      it('displays everything but the `switch default org` form if there is only one org in the current account', () => {
        cy.intercept('GET', '/api/v2/quartz/accounts', {
          statusCode: 200,
          body: multipleAccounts,
        }).as('getAccounts')

        cy.intercept('GET', 'api/v2/quartz/accounts/**/orgs', {
          statusCode: 200,
          body: singleOrg,
        }).as('getOrgs')

        cy.getByTestID('user-profile--user-details-header')
          .contains('User Details')
          .should('be.visible')

        cy.getByTestID('user-profile--save-button')
          .contains('Save Changes')
          .should('be.visible')

        cy.getByTestID('user-profile--change-account-header').should(
          'be.visible'
        )

        cy.getByTestID('user-profile--default-org-header').should('not.exist')
      })
    })
  })
})
