export const setupProfile = (): Promise<any> => {
  return Cypress.Promise.resolve(
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(() => {
          cy.request({
            method: 'PUT',
            url: 'api/v2/quartz/accounts/resetAllAccountOrgs',
          })
          cy.getByTestID('home-page--header').should('be.visible')
          cy.setFeatureFlags(userProfileFeatureFlags).then(() => {
            // cy.wait($time) is necessary to consistently ensure sufficient time for the feature flag override.
            // The flag reset happens via redux, (it's not a network request), so we can't cy.wait($intercepted_route).
            cy.wait(300).then(() => {
              cy.visit('/me/profile')
            })
          })
        })
      })
    )
  )
}

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
