import {Organization} from '../../../src/types'

// Skipping this until we get the CI/CD pipeline worked out for the `/quartz/me` endpoint
describe.skip('Billing Page', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.getByTestID('tree-nav')
        cy.setFeatureFlags({unityBilling: true}).then(() => {
          cy.visit(`/orgs/${id}/billing`)
          cy.getByTestID('billing-page--header').should('be.visible')
        })
      })
    })
  })

  it('should display the free billing page', () => {
    cy.getByTestID('cloud-upgrade--button').should('be.visible')
    cy.getByTestID('title-header--name')
      .should('not.have.value', 'blockedNotificationRules')
      .and('not.have.value', 'blockedNotificationEndpoints')

    cy.getByTestID('payg-grid--container').scrollIntoView()
    cy.getByTestID('payg-button--upgrade').should('be.visible')
  })
})
