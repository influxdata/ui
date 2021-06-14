import {Organization} from '../../../src/types'
import {set} from '../../../src/shared/utils/featureFlag'

// Skipping this until we get the CI/CD pipeline worked out for the `/quartz/me` endpoint
describe.skip('Billing Page', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.getByTestID('tree-nav')
        set('unityBilling', true)

        cy.visit(`/orgs/${id}/billing`)
      })
    })

    cy.getByTestID('billing-page--header').should('be.visible')
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
