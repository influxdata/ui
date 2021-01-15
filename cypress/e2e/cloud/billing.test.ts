import {Organization} from '../../../src/types'

describe('Billing Page', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.window().then(w => {
          w.influx.set('unity-billing', true)
        })

        cy.visit(`/orgs/${id}/unity-billing`)
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
