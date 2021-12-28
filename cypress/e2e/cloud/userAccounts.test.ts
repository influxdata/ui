import {Organization} from '../../../src/types'

const doSetup = (cy, numAccounts: number) => {
  cy.signin().then(() => {
    console.log('in nest-0')
    cy.get('@org').then(({id}: Organization) => {
      console.log('in nest-1')
      cy.setFeatureFlags({
        uiUnificationFlag: true,
      }).then(() => {
        console.log('in nest-2')
        cy.quartzProvision({
          accountType: 'free',
          numAccounts,
        }).then(() => {
          cy.visit(`/orgs/${id}/accounts/settings`)
          console.log('in nest-3')
        })
      })
    })
  })
}

describe('Account Page; user with 3 accounts', () => {
  beforeEach(() => doSetup(cy, 3))

  it('can get to the page and get the accounts, and the switch button is showing', () => {
    cy.getByTestID('account-settings--header').should('be.visible')
    cy.getByTestID('user-account-switch-btn').should('be.visible')
    cy.getByTestID('account-active-name--block').contains('Influx')
  })
})

describe('Account Page; user with one account', () => {
  beforeEach(() => cy.flush().then(()=> doSetup(cy, 1)))

  it('can get to the page and get the accounts, and the switch button is NOT showing', () => {
    cy.getByTestID('account-settings--header').should('be.visible')
    cy.getByTestID('user-account-switch-btn').should('not.exist')


    cy.getByTestID('account-active-name--block').contains('Veganomicon')
  })
})