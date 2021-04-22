import {Organization} from '../../../src/types'

describe('Billing Page', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.getByTestID('tree-nav')
        cy.window().then(w => {
          // I hate to add this, but the influx object isn't ready yet
          cy.wait(1000)
          w.influx.set('unityBilling', true)
        })

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
