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

describe('Account Page (take 3)', () => {
  beforeEach(() => doSetup(cy, 3))

  it('can get to the page and get the accounts', () => {
    console.log('hi there')
    //cy.pause();
    expect(true).to.equal(true)
    cy.getByTestID('account-about--header').should('be.visible')
  })
})
