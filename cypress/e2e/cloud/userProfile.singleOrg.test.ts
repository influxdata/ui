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
    provider: 'AWS',
    regionCode: 'us-east-1',
    regionName: 'US East (N. Virginia)',
  },
]

export const multipleOrgs = [
  {
    id: '1',
    name: 'org 1 of 2',
    isDefault: true,
    isActive: true,
    provider: 'Azure',
    regionCode: 'westeurope',
    regionName: 'Amsterdam',
  },
  {
    id: '2',
    name: 'org 2 of 2',
    isDefault: false,
    isActive: false,
    provider: 'AWS', // Azure, AWS, GCP
    regionCode: 'us-east-1',
    regionName: 'US East (N. Virginia)',
  },
]

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
          // cy.wait($time) is necessary to consistently ensure sufficient time for the feature flag override.
          // The flag reset happens via redux, (it's not a network request), so we can't cy.wait($intercepted_route).
          cy.wait(1200).then(() => {
            cy.visit('/me/profile')
          })
        })
      })
    )
  )
}

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
    cy.fixture('multiOrgAccounts1.json').then(quartzAccounts => {
      cy.intercept('GET', '/api/v2/quartz/accounts', quartzAccounts).as(
        'getAccounts'
      )
    })

    cy.getByTestID('user-profile--page')
      .contains('User Profile')
      .should('be.visible')
    cy.getByTestID('user-profile--user-details-header')
      .contains('User Details')
      .should('be.visible')

    cy.getByTestID('user-profile--email').contains('Email').should('be.visible')
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
