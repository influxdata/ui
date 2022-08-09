import {Organization} from '../../../src/types'

const doSetup = (cy, numAccounts: number) => {
  cy.flush().then(() => {
    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.setFeatureFlags({
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
  })
}

const prefix = 'accountSwitch-toggle-choice'

describe('Account Page tests', () => {
  describe('User with 4 accounts', () => {
    beforeEach(() => doSetup(cy, 4))

    it('can change the default account', () => {
      const defaultMarker = '(default)'

      // first ensure that we get 4 accounts from Quartz
      cy.getByTestID('account-settings--header').should('be.visible')
      cy.getByTestID('input--active-account-name').should('be.visible')
      cy.getByTestID('user-account-switch-btn').click()
      cy.getByTestID('switch-account--dialog').should('be.visible')
      cy.getByTestID(`${prefix}-0-ID`).should('be.visible')
      cy.getByTestID(`${prefix}-1-ID`).should('be.visible')
      cy.getByTestID(`${prefix}-2-ID`).should('be.visible')
      cy.getByTestID(`${prefix}-3-ID`).should('be.visible')
      cy.getByTestID('multi-account-switch-cancel').click()
      cy.getByTestID('switch-account--dialog').should('not.exist')

      // rename the current account
      const name = '4-accounts-test'
      cy.getByTestID('input--active-account-name')
        .clear()
        .type(name)
      cy.getByTestID('rename-account--button').click()

      cy.getByTestID('notification-success').should('be.visible')

      // active name is our input and "Switch" starts as disabled
      cy.getByTestID('user-account-switch-btn').click()
      cy.getByTestID('switch-account--dialog').should('be.visible')
      cy.getByTestID('actually-switch-account--btn').should('be.disabled')

      // Only one "(default)", which cannot be set again, and not our renamed account
      cy.get('.cf-toggle--visual-input')
        .contains(defaultMarker)
        .should('have.length', 1)
      cy.get('.cf-toggle--visual-input')
        .contains(defaultMarker)
        .click()
      cy.getByTestID('switch-default-account--btn').should('be.disabled')
      cy.get('.cf-toggle--visual-input').not(`:contains(${name}`)

      // Three non-default that can be selected as default
      cy.get('.cf-toggle--visual-input')
        .not(`:contains(${defaultMarker}`)
        .should('have.length', 3)
      cy.get('.cf-toggle--visual-input')
        .not(`:contains(${defaultMarker}`)
        .eq(0)
        .click()
      cy.getByTestID('switch-default-account--btn').should('be.enabled')
      cy.get('.cf-toggle--visual-input')
        .not(`:contains(${defaultMarker}`)
        .eq(1)
        .click()
      cy.getByTestID('switch-default-account--btn').should('be.enabled')
      cy.get('.cf-toggle--visual-input')
        .not(`:contains(${defaultMarker}`)
        .eq(2)
        .click()
      cy.getByTestID('switch-default-account--btn').should('be.enabled')

      // select our renamed account as the default
      cy.get('.cf-toggle--visual-input')
        .contains(name)
        .click()
      cy.getByTestID('switch-default-account--btn').click()

      cy.getByTestID('notification-success').should('be.visible')
      cy.getByTestID('switch-account--dialog').should('not.exist')

      // open the "Switch Account" modal again, our renamed account should be default
      cy.getByTestID('user-account-switch-btn').click()
      cy.getByTestID('switch-account--dialog').should('be.visible')
      cy.get('.cf-toggle--visual-input').contains(`${name} ${defaultMarker}`)

      // close the modal
      cy.getByTestID('multi-account-switch-cancel').click()
      cy.getByTestID('switch-account--dialog').should('not.exist')
    })
  })

  describe('User with one account', () => {
    beforeEach(() => doSetup(cy, 1))

    it('can get to the page and get the accounts, and the switch button is NOT showing', () => {
      cy.getByTestID('account-settings--header').should('be.visible')
      cy.getByTestID('input--active-account-name')
        .invoke('val')
        .should('have.length.greaterThan', 0)
      cy.getByTestID('user-account-switch-btn').should('not.exist')
    })
  })

  describe('User with two accounts', () => {
    beforeEach(() => doSetup(cy, 2))

    it('can get to the account page and rename the active account', () => {
      // first ensure that we get 2 accounts from Quartz
      cy.getByTestID('account-settings--header').should('be.visible')
      cy.getByTestID('input--active-account-name').should('be.visible')
      cy.getByTestID('user-account-switch-btn').click()
      cy.getByTestID('switch-account--dialog').should('be.visible')
      cy.getByTestID(`${prefix}-0-ID`).should('be.visible')
      cy.getByTestID(`${prefix}-1-ID`).should('be.visible')
      cy.getByTestID('multi-account-switch-cancel').click()
      cy.getByTestID('switch-account--dialog').should('not.exist')

      // rename the current account
      const name = 'Bruno-no-no-no'
      cy.getByTestID('input--active-account-name')
        .clear()
        .type(name)
      cy.getByTestID('rename-account--button').click()

      cy.getByTestID('notification-success').should('be.visible')

      // active name should be our input
      cy.getByTestID('user-account-switch-btn').click()
      cy.getByTestID('switch-account--dialog').should('be.visible')
      cy.getByTestID(`${prefix}-0-ID`).should('be.visible')
      cy.getByTestID(`${prefix}-0-ID`).contains(name)
      cy.getByTestID(`${prefix}-0-ID--input`).should('be.checked')
      cy.getByTestID('multi-account-switch-cancel').click()
      cy.getByTestID('switch-account--dialog').should('not.exist')

      // then, rename it again
      const newName = 'Bruno-yes-yes-yes'
      cy.getByTestID('input--active-account-name').should('be.visible')
      cy.getByTestID('input--active-account-name')
        .clear()
        .type(newName)
      cy.getByTestID('rename-account--button').click()

      cy.getByTestID('notification-success').should('be.visible')

      // active name should be our new name
      cy.getByTestID('user-account-switch-btn').click()
      cy.getByTestID('switch-account--dialog').should('be.visible')
      cy.getByTestID(`${prefix}-0-ID`).should('be.visible')
      cy.getByTestID(`${prefix}-0-ID`).contains(newName)
      cy.getByTestID(`${prefix}-0-ID--input`).should('be.checked')
      cy.getByTestID('multi-account-switch-cancel').click()
      cy.getByTestID('switch-account--dialog').should('not.exist')
    })
  })
})
