import {Organization} from '../../../src/types'

const doSetup = (cy, numAccounts: number) => {
  cy.flush().then(() => {
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
  })
}

describe('Account Page tests', () => {
  describe('User with 4 accounts', () => {
    beforeEach(() => doSetup(cy, 4))

    it('can change the default account, and then see that it changed on the switch dialog; also checks that the switch button is enabled and disabled correctly', () => {
      cy.getByTestID('account-settings--header').should('be.visible')
      cy.getByTestID('user-account-switch-btn').should('be.visible')
      cy.getByTestID('input--active-account-name').should(
        'have.value',
        'Influx'
      )

      cy.getByTestID('user-account-switch-btn').click()

      const prefix = 'accountSwitch-toggle-choice'

      cy.getByTestID('switch-account--dialog').within(() => {
        cy.getByTestID(`${prefix}-0-ID`).should('be.visible')
        cy.getByTestID(`${prefix}-0-ID`).contains('Influx')
        cy.getByTestID(`${prefix}-0-ID--input`).should('be.checked')

        cy.getByTestID(`${prefix}-1-ID`).should('be.visible')
        cy.getByTestID(`${prefix}-1-ID`).contains('Veganomicon (default)')

        cy.getByTestID(`${prefix}-2-ID`).should('be.visible')
        cy.getByTestID(`${prefix}-2-ID`).contains('Stradivarius')

        cy.getByTestID(`${prefix}-3-ID`).should('be.visible')
        cy.getByTestID(`${prefix}-3-ID`).contains('Yamaha')

        // at first; the switch button should be disabled:
        cy.getByTestID('actually-switch-account--btn').should('be.disabled')

        // the set default button should be *enabled*
        cy.getByTestID('switch-default-account--btn').should('be.enabled')

        // now:  select another option:
        cy.getByTestID(`${prefix}-1-ID`).click()

        // check that it is selected before checking the button enabled state:
        cy.getByTestID(`${prefix}-1-ID--input`).should('be.checked')

        // now; the button should be enabled:
        cy.getByTestID('actually-switch-account--btn').should('be.enabled')

        // and the default button should be *disabled* b/c just chose the default acct:
        cy.getByTestID('switch-default-account--btn').should('be.disabled')

        // ok; now pick the third option:
        cy.getByTestID(`${prefix}-2-ID`).click()

        // check that it is selected before going to the next step:
        cy.getByTestID(`${prefix}-2-ID--input`).should('be.checked')
        cy.getByTestID('switch-default-account--btn').should('be.enabled')

        cy.getByTestID('switch-default-account--btn').click()
      })
      // test that the notification is up:
      cy.getByTestID('notification-success').should('be.visible')

      // now; bring up the dialog again, the default one should be changed:
      cy.getByTestID('user-account-switch-btn').click()

      cy.getByTestID('switch-account--dialog').within(() => {
        cy.getByTestID(`${prefix}-0-ID`).should('be.visible')
        cy.getByTestID(`${prefix}-0-ID`).contains('Influx')
        cy.getByTestID(`${prefix}-0-ID--input`).should('be.checked')

        cy.getByTestID(`${prefix}-1-ID`).should('be.visible')
        cy.getByTestID(`${prefix}-1-ID`).contains('Veganomicon')

        cy.getByTestID(`${prefix}-2-ID`).should('be.visible')
        cy.getByTestID(`${prefix}-2-ID`).contains('Stradivarius (default)')
      })
    })
  })

  describe('User with one account', () => {
    beforeEach(() => doSetup(cy, 1))

    it('can get to the page and get the accounts, and the switch button is NOT showing', () => {
      cy.getByTestID('account-settings--header').should('be.visible')
      cy.getByTestID('user-account-switch-btn').should('not.exist')

      cy.getByTestID('input--active-account-name').should(
        'have.value',
        'Veganomicon'
      )
    })
  })

  describe('User with two accounts', () => {
    beforeEach(() => doSetup(cy, 2))

    it('can get to the account page and rename the active account', () => {
      cy.getByTestID('account-settings--header').should('be.visible')

      cy.getByTestID('input--active-account-name').should(
        'have.value',
        'Influx'
      )

      cy.getByTestID('input--active-account-name').clear()
      cy.getByTestID('input--active-account-name').should('have.value', '')

      // what can I say?  i am a fan
      const newName = 'Bruno-no-no-no'
      cy.getByTestID('input--active-account-name').type(newName)
      cy.getByTestID('rename-account--button').click()

      // test that the notification is up:
      cy.getByTestID('notification-success').should('be.visible')

      // now; bring up the dialog, the active name should be changed:
      cy.getByTestID('user-account-switch-btn').click()

      const prefix = 'accountSwitch-toggle-choice'

      cy.getByTestID('switch-account--dialog').within(() => {
        cy.getByTestID(`${prefix}-0-ID`).should('be.visible')
        cy.getByTestID(`${prefix}-0-ID`).contains(newName)
        cy.getByTestID(`${prefix}-0-ID--input`).should('be.checked')
        cy.getByTestID('multi-account-switch-cancel').click()
      })

      // circle-ci and e2e tests got unstable, so best to put all the toys back
      // (reset the name)
      cy.getByTestID('account-settings--header').should('be.visible')

      cy.getByTestID('input--active-account-name')
        .clear()
        .type('Influx')
      cy.getByTestID('rename-account--button').click()

      // test that the notification is up:
      cy.getByTestID('notification-success').should('be.visible')

      // now; bring up the dialog again, the active name should be changed:
      cy.getByTestID('user-account-switch-btn').click()

      cy.getByTestID('switch-account--dialog').within(() => {
        cy.getByTestID(`${prefix}-0-ID`).should('be.visible')
        cy.getByTestID(`${prefix}-0-ID`).contains('Influx')
        cy.getByTestID(`${prefix}-0-ID--input`).should('be.checked')
        cy.getByTestID('multi-account-switch-cancel').click()
      })
    })
  })
})
