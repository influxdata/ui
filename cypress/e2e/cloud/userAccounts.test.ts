import {Organization} from '../../../src/types'

describe('Account Page (take 2)', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(({id}: Organization) => {
          cy.setFeatureFlags({
            uiUnificationFlag: true,
          }).then(() => {
            cy.quartzProvision({
              accountType: 'free',
            }).then(() => {
              cy.visit(`/orgs/${id}/accounts/about`)
              cy.getByTestID('account-about--header').should('be.visible')

              // cy.visit(`/orgs/${id}/billing`)
              // cy.getByTestID('billing-page--header').should('be.visible')
            })
          })
        })
      })
    )
  )

  it('can get to the page and get the accounts', () => {
    console.log('hi there')
    //cy.pause();
    expect(true).to.equal(true)
  })
})
