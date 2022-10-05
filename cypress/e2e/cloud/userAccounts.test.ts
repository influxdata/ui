import {Organization} from '../../../src/types'

const doSetup = cy => {
  cy.flush().then(() => {
    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.visit(`/orgs/${id}/accounts/settings`)
        cy.setFeatureFlags({
          multiAccount: true,
          multiOrg: true,
        }).then(() => {
          cy.wait(300)
        })
      })
    })
  })
}

describe('Account Page tests', () => {
  describe('User with more than one account', () => {
    before(() => {
      // For this test, intercept all GET and POST requests to the accounts API
      // Otherwise, attempts to revise quartz-mock cause flaking issues in other tests
      // that presume the current account name has not changed.

      cy.intercept('GET', '/api/v2/quartz/accounts', {
        statusCode: 200,
        body: [
          {id: 416, isActive: true, isDefault: false, name: 'Influx'},
          {id: 415, isActive: false, isDefault: true, name: 'Veganomicon'},
        ],
      })
      doSetup(cy)
    })

    it('can get to the account page and rename the active account', () => {
      // first ensure that we get 2 accounts from Quartz
      cy.getByTestID('account-settings--header').should('be.visible')
      cy.getByTestID('input--active-account-name').should('be.visible')

      // rename the current account
      const firstNewAccountName = 'Bruno-no-no-no'
      const newAccountProps = {
        id: 416,
        isActive: true,
        isDefault: false,
        name: firstNewAccountName,
      }

      cy.intercept('PATCH', '/api/v2/quartz/accounts/416', {
        statusCode: 200,
        body: newAccountProps,
      })

      cy.intercept('GET', '/api/v2/quartz/accounts', {
        statusCode: 200,
        body: newAccountProps,
      })

      cy.getByTestID('input--active-account-name')
        .clear()
        .type(firstNewAccountName)
      cy.getByTestID('rename-account--button').click()
      cy.getByTestID('notification-success').should('be.visible')
      cy.contains(firstNewAccountName)

      // rename it again
      const secondNewAccountName = 'Bruno-yes-yes-yes'
      newAccountProps.name = secondNewAccountName

      cy.intercept('PATCH', '/api/v2/quartz/accounts/416', {
        statusCode: 200,
        body: newAccountProps,
      })
      cy.intercept('GET', '/api/v2/quartz/accounts', {
        statusCode: 200,
        body: newAccountProps,
      })

      cy.getByTestID('input--active-account-name').should('be.visible')
      cy.getByTestID('input--active-account-name')
        .clear()
        .type(secondNewAccountName)
      cy.getByTestID('rename-account--button').click()
      cy.getByTestID('notification-success').should('be.visible')
      cy.contains(secondNewAccountName)
    })
  })
})
