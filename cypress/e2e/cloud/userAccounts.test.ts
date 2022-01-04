import {Organization} from '../../../src/types'

const doSetup = (cy, numAccounts: number) => {
  cy.signin().then(() => {
    cy.get('@org').then(({id}: Organization) => {
      cy.setFeatureFlags({
        uiUnificationFlag: true,
        multiAccount: true,
      }).then(() => {
        cy.quartzProvision({
          accountType: 'free',
          numAccounts,
        }).then(() => {
          cy.visit(`/orgs/${id}/accounts/settings`)
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

    cy.getByTestID('user-account-switch-btn').click()

    cy.getByTestID('switch-account--dialog').within(() => {
      const prefix = 'accountSwitch-toggle-choice'

      cy.getByTestID(`${prefix}-0-ID`).should('be.visible')
      cy.getByTestID(`${prefix}-0-ID`).contains('Influx')
      cy.getByTestID(`${prefix}-0-ID--input`).should('be.checked')

      cy.getByTestID(`${prefix}-1-ID`).should('be.visible')
      cy.getByTestID(`${prefix}-1-ID`).contains('Veganomicon (default)')

      cy.getByTestID(`${prefix}-2-ID`).should('be.visible')
      cy.getByTestID(`${prefix}-2-ID`).contains('Stradivarius')

      // at first; the switch button should be disabled:
      cy.getByTestID('actually-switch-account--btn').should('be.disabled')

      // now:  select another option:
      cy.getByTestID(`${prefix}-2-ID`).click()

      // check that it is selected before checking the button enabled state:
      cy.getByTestID(`${prefix}-2-ID--input`).should('be.checked')

      // now; the button should be enabled:
      cy.getByTestID('actually-switch-account--btn').should('be.enabled')
    })
  })
})

describe('Account Page; user with one account', () => {
  beforeEach(() => cy.flush().then(() => doSetup(cy, 1)))

  it('can get to the page and get the accounts, and the switch button is NOT showing', () => {
    cy.getByTestID('account-settings--header').should('be.visible')
    cy.getByTestID('user-account-switch-btn').should('not.exist')

    cy.getByTestID('account-active-name--block').contains('Veganomicon')
  })
})
