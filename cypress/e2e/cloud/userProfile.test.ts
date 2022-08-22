// Utility Functions
export const setupProfile = (): Promise<any> => {
  return Cypress.Promise.resolve(
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(() => {
          cy.request({
            method: 'PUT',
            url: 'api/v2/quartz/accounts/resetAllAccountOrgs',
          })
          cy.visit('/')
          cy.getByTestID('home-page--header').should('be.visible')
          cy.setFeatureFlags(userProfileFeatureFlags).then(() => {
            // cy.wait($time) is necessary to consistently ensure sufficient time for the feature flag override.
            // The flag reset happens via redux, (it's not a network request), so we can't cy.wait($intercepted_route).
            cy.wait(1000).then(() => {
              cy.visit('/me/profile')
            })
          })
        })
      })
    )
  )
}

// Constants
const userProfileFeatureFlags = {
  quartzIdentity: true,
  multiOrg: true,
}

export const singleAccount = [
  {
    id: 1,
    name: 'single account',
    isDefault: true,
    isActive: true,
  },
]

export const multipleAccounts = [
  {
    id: 1,
    name: 'account 1 of 2',
    isDefault: true,
    isActive: true,
  },
  {
    id: 2,
    name: 'account 2 of 2',
    isDefault: false,
    isActive: false,
  },
]

export const singleOrg = [
  {
    id: '1',
    name: 'single org',
    isDefault: true,
    isActive: true,
  },
]

export const multipleOrgs = [
  {
    id: '1',
    name: 'org 1 of 2',
    isDefault: true,
    isActive: true,
  },
  {
    id: '2',
    name: 'org 2 of 2',
    isDefault: false,
    isActive: false,
  },
]

// Tests
describe('User profile page', () => {
  before(() => {
    setupProfile()
  })

  beforeEach(() => {
    // Maintain a session for all tests so that we don't need to log in each time.
    // Cypress 10 may replace this with the (currently experimental) https://docs.cypress.io/api/commands/session
    Cypress.Cookies.preserveOnce('sid')
  })

  after(() => {
    cy.request({
      method: 'PUT',
      url: 'api/v2/quartz/accounts/resetAllAccountOrgs',
    })
  })

  it("displays the user's name and email", () => {
    cy.getByTestID('user-profile--page')
      .contains('User Profile')
      .should('be.visible')
    cy.getByTestID('user-profile--user-details-header')
      .contains('User Details')
      .should('be.visible')

    cy.getByTestID('user-profile--email')
      .contains('Email')
      .should('be.visible')
    cy.getByTestID('user-profile--email-input').should(
      'have.attr',
      'value',
      'test@influxdata.com'
    )

    cy.getByTestID('user-profile--firstname')
      .contains('First name')
      .should('be.visible')
    cy.getByTestID('user-profile--firstname-input').should(
      'have.attr',
      'value',
      'Marty'
    )

    cy.getByTestID('user-profile--lastname')
      .contains('Last name')
      .should('be.visible')
    cy.getByTestID('user-profile--lastname-input').should(
      'have.attr',
      'value',
      'McFly'
    )
  })

  describe('multi-org users', () => {
    it('allows the user to change their default account', () => {
      cy.intercept('PUT', '/api/v2/quartz/accounts/default', {
        statusCode: 204,
        data: '',
      }).as('putQuartzDefaultAccount')

      cy.getByTestID('user-profile--save-button').should(
        'have.attr',
        'disabled'
      )

      cy.getByTestID('user-profile--change-account-header')
        .contains('Default Account')
        .should('be.visible')
      cy.getByTestID('user-profile--change-account-dropdown')
        .contains('Veganomicon')
        .should('be.visible')
        .click()

      cy.getByTestID('user-profile--change-account-dropdown')
        .getByTestID('dropdown-item')
        .contains('Influx')
        .click()

      cy.fixture('multiOrgAccounts1.json').then(quartzAccounts => {
        quartzAccounts[0].isDefault = true
        quartzAccounts[1].isDefault = false

        cy.intercept('GET', '/api/v2/quartz/accounts', quartzAccounts).as(
          'getAccounts'
        )
      })

      cy.getByTestID('user-profile--save-button')
        .should('be.visible')
        .click()

      cy.wait('@putQuartzDefaultAccount').then(() => {
        // Force-clicks on notifications are work-arounds to ensure they're visible in cypress.
        cy.getByTestID('notification-success')
          .contains('Saved changes to your profile.')
          .should('exist')
          .click({force: true})

        cy.getByTestID('user-profile--change-account-dropdown')
          .contains('Influx')
          .should('be.visible')

        cy.getByTestID('user-profile--save-button').should(
          'have.attr',
          'disabled'
        )

        cy.getByTestID('notification-success--dismiss').click({force: true})

        // Confirm that the user can also change default accounts when using the typeahead.
        cy.getByTestID('user-profile--change-account-dropdown')
          .should('be.visible')
          .click()

        cy.getByTestID('user-profile--change-account-dropdown')
          .should('be.visible')
          .getByTestID('input-field')
          .type('Vega')

        cy.getByTestID('user-profile--change-account-dropdown')
          .getByTestID('dropdown-item')
          .contains('Veganomicon')
          .click()

        // Reset to default fixture, where Veganomicon is default.
        cy.fixture('multiOrgAccounts1.json').then(quartzAccounts => {
          cy.intercept('GET', '/api/v2/quartz/accounts', quartzAccounts).as(
            'getAccounts'
          )
        })

        cy.getByTestID('user-profile--save-button')
          .should('be.visible')
          .click()

        cy.wait('@putQuartzDefaultAccount').then(() => {
          cy.getByTestID('notification-success')
            .contains('Saved changes to your profile.')
            .should('exist')
            .click({
              force: true,
            })

          cy.getByTestID('user-profile--change-account-dropdown')
            .contains('Veganomicon')
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

    it('allows the user to change their default org', () => {
      cy.intercept('PUT', '/api/v2/quartz/accounts/**/orgs/default', {
        statusCode: 204,
        data: '',
      }).as('putQuartzDefaultOrg')

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

      // Confirm that the user can change default orgs solely by clicking in the dropdown.
      cy.getByTestID('user-profile--default-org-dropdown')
        .contains('Test Org 0')
        .should('be.visible')
        .click()

      cy.getByTestID('user-profile--default-org-dropdown')
        .getByTestID('dropdown-item')
        .contains('Test Org 2')
        .should('be.visible')
        .click()

      cy.getByTestID('user-profile--save-button')
        .should('be.visible')
        .click()

      cy.wait('@putQuartzDefaultOrg').then(() => {
        cy.getByTestID('notification-success')
          .contains('Saved changes to your profile.')
          .should('exist')
          .click({force: true})

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

      // Confirm that the user can also change default accounts when using the typeahead.
      cy.getByTestID('user-profile--default-org-dropdown')
        .click()
        .getByTestID('input-field')
        .type('Test Org 5')

      cy.getByTestID('user-profile--default-org-dropdown')
        .getByTestID('dropdown-item')
        .contains('Test Org 5')
        .click()

      cy.getByTestID('user-profile--save-button').click()

      cy.wait('@putQuartzDefaultOrg').then(() => {
        cy.getByTestID('notification-success')
          .contains('Saved changes to your profile.')
          .should('exist')
          .click({force: true})

        cy.getByTestID('user-profile--default-org-dropdown')
          .contains('Test Org 5')
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

    it('allows the user to change both their default account and org', () => {
      cy.intercept('PUT', '/api/v2/quartz/accounts/default', {
        statusCode: 204,
        data: '',
      }).as('putQuartzDefaultAccount')

      cy.intercept('PUT', '/api/v2/quartz/accounts/**/orgs/default', {
        statusCode: 204,
        data: '',
      }).as('putQuartzDefaultOrg')

      cy.getByTestID('user-profile--change-account-dropdown').type('Inf')
      cy.getByTestID('user-profile--change-account-dropdown')
        .getByTestID('dropdown-item')
        .contains('Influx')
        .click()

      cy.getByTestID('user-profile--default-org-dropdown')
        .click()
        .getByTestID('input-field')
        .type('Test Org 1')

      cy.getByTestID('user-profile--default-org-dropdown')
        .getByTestID('dropdown-item')
        .contains('Test Org 1')
        .click()

      cy.fixture('multiOrgAccounts1.json').then(quartzAccounts => {
        quartzAccounts[0].isDefault = true
        quartzAccounts[1].isDefault = false

        cy.intercept('GET', '/api/v2/quartz/accounts', quartzAccounts).as(
          'getAccounts'
        )
      })

      cy.getByTestID('user-profile--save-button').click()

      cy.wait(['@putQuartzDefaultOrg', '@putQuartzDefaultAccount']).then(() => {
        cy.getByTestID('notification-success')
          .contains('Saved changes to your profile.')
          .should('exist')
          .click({force: true})

        cy.getByTestID('user-profile--change-account-dropdown')
          .contains('Influx')
          .should('be.visible')

        cy.getByTestID('user-profile--default-org-dropdown')
          .contains('Test Org 1')
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

    it("notifies if the user's preferences were not saved", () => {
      cy.intercept('PUT', 'api/v2/quartz/accounts/**/orgs/default', {
        statusCode: 500,
        body: {
          message: 'Internal server error',
        },
      }).as('putQuartzDefaultOrg')

      cy.intercept('PUT', 'api/v2/quartz/accounts/default', {
        statusCode: 500,
        body: {
          message: 'Internal server error',
        },
      }).as('putQuartzDefaultAccount')

      // Failing to change a default org
      cy.getByTestID('user-profile--default-org-dropdown').click()
      cy.getByTestID('user-profile--default-org-dropdown')
        .getByTestID('dropdown-item')
        .contains('Test Org 2')
        .click()

      cy.getByTestID('user-profile--change-account-header').click()
      cy.getByTestID('user-profile--save-button').click()

      cy.wait('@putQuartzDefaultOrg').then(() => {
        cy.getByTestID('notification-error')
          .contains(
            'Failed to save all changes to your profile. Please try again.'
          )
          .should('exist')
          .click({force: true})

        cy.getByTestID('user-profile--default-org-dropdown').click()
        cy.getByTestID('user-profile--default-org-dropdown')
          .getByTestID('dropdown-item')
          .contains('Test Org 1')
          .should('be.visible')

        cy.getByTestID('user-profile--save-button').should(
          'not.have.attr',
          'disabled'
        )

        cy.getByTestID('notification-error--dismiss').click({
          force: true,
        })

        // Failing to change a default account
        cy.getByTestID('user-profile--change-account-dropdown').click()
        cy.getByTestID('user-profile--change-account-dropdown')
          .getByTestID('dropdown-item')
          .contains('Veganomicon')
          .click()

        cy.getByTestID('user-profile--save-button').click()

        cy.wait('@putQuartzDefaultAccount').then(() => {
          cy.getByTestID('notification-error')
            .contains(
              'Failed to save all changes to your profile. Please try again.'
            )
            .should('exist')
            .click({force: true})

          cy.getByTestID('user-profile--change-account-dropdown').click()
          cy.getByTestID('user-profile--change-account-dropdown')
            .getByTestID('dropdown-item')
            .contains('Influx')
            .should('be.visible')
          cy.getByTestID('user-profile--save-button').should(
            'not.have.attr',
            'disabled'
          )

          cy.getByTestID('notification-error--dismiss').click({
            force: true,
          })
        })
      })
    })
  })

  describe('single-org users', () => {
    beforeEach(() => {
      setupProfile()
    })

    it("doesn't show the `change defaults` form if there is only one account and one org.", () => {
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

      cy.getByTestID('user-profile--change-account-header').should('not.exist')

      cy.getByTestID('user-profile--default-org-header').should('not.exist')

      cy.getByTestID('user-profile--save-button').should('not.exist')
    })

    it("doesn't show the `switch default account` fieldset if there is only one account", () => {
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

      cy.getByTestID('user-profile--change-account-header').should('not.exist')
    })

    it("doesn't show the `switch default org` fieldset if there is only one org in the current account", () => {
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

      cy.getByTestID('user-profile--change-account-header').should('be.visible')

      cy.getByTestID('user-profile--default-org-header').should('not.exist')
    })
  })
})
