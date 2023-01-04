import {Organization} from '../../../src/types'
import {makeQuartzUseIDPEOrgID} from 'cypress/support/Utils'

// This variable stores the current IDPE orgid and syncs it with the quartz-mock orgid.
let idpeOrgID: string

interface SetupParams {
  accountType: string
  orgHasOtherUsers: boolean
  orgCount?: number
  orgIsSuspendable?: boolean
}

const setupTest = (setupParams: SetupParams) => {
  cy.flush().then(() =>
    cy.signin().then(() => {
      cy.request({
        method: 'GET',
        url: 'api/v2/orgs',
      }).then(res => {
        // Store the IDPE org ID so that it can be cloned when intercepting quartz.
        if (res.body.orgs) {
          idpeOrgID = res.body.orgs[0].id
        }
        const {accountType, orgCount, orgHasOtherUsers} = setupParams

        if (orgHasOtherUsers) {
          cy.intercept('GET', `api/v2/quartz/orgs/**/users`, {
            body: [
              {
                id: '234234324',
                firstName: 'User',
                lastName: 'McUserface',
                email: 'user@influxdata.com',
                role: 'owner',
              },
              {
                id: '234234234324',
                firstName: 'Josh',
                lastName: 'Ritter',
                email: 'josh@influxdata.com',
                role: 'owner',
              },
            ],
          })
        }

        makeQuartzUseIDPEOrgID(idpeOrgID, accountType, orgCount)

        cy.visit(`orgs/${idpeOrgID}/accounts/settings`)
      })
    })
  )
}

const doSetup = cy => {
  cy.flush().then(() => {
    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.visit(`/orgs/${id}/accounts/settings`)
        cy.wait(300)
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

describe('Free account Deletion', () => {
  const deleteFreeAccount = () => {
    cy.getByTestID('delete-free-account--button').should('be.visible').click()
    cy.getByTestID('notification-warning').should('not.exist')

    cy.url()
      .should('include', `/accounts/settings/delete`)
      .then(() => {
        cy.getByTestID('delete-free-account--overlay')
          .should('be.visible')
          .within(() => {
            cy.getByTestID('delete-free-account--button').should('be.disabled')

            cy.getByTestID('agree-terms--input').click()
            cy.getByTestID('agree-terms--checkbox').should('be.checked')
            cy.getByTestID('variable-type-dropdown--button')
              .should('be.visible')
              .click()
            cy.contains("It doesn't work for my use case")
              .should('be.visible')
              .click()
            cy.getByTestID('delete-free-account--button')
              .should('not.be.disabled')
              .click()
          })
        cy.location().should(loc => {
          expect(loc.href).to.eq(`https://www.influxdata.com/mkt_cancel/`)
        })
      })
  }

  const displayRemoveUsersWarning = () => {
    cy.getByTestID('delete-free-account--button').should('exist').click()

    cy.getByTestID('notification-warning')
      .should('exist')
      .contains('All additional users must be removed')

    cy.getByTestID('go-to-users--link').click()

    cy.url().should('include', `/members`)
  }

  it('allows the user to delete a free account if there is only one org, with only one user', () => {
    setupTest({
      accountType: 'free',
      orgHasOtherUsers: false,
      orgCount: 1,
    })

    deleteFreeAccount()
  })

  it('displays a `must remove users` warning if trying to delete a free account with a single org, which has multiple users', () => {
    setupTest({
      accountType: 'free',
      orgHasOtherUsers: true,
      orgCount: 1,
    })
    // wait until api request to /users is complete
    cy.intercept('GET', '**/users').as('getusers')
    cy.wait('@getusers')
    cy.wait(2000)
    displayRemoveUsersWarning()
  })
})
