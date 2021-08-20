import {Organization} from '../../../src/types'

describe('Orgs', () => {
  beforeEach(() => {
    cy.flush()
  })

  describe('when there is a user with no orgs', () => {
    beforeEach(() => {
      cy.signin().then(() => {
        cy.get('@org').then(({id}: Organization) => cy.deleteOrg(id))
      })
      // Have to clear local storage to work around this bug: https://github.com/influxdata/ui/issues/2427
      cy.clearLocalStorage()
      cy.visit('/')
    })

    it('forwards the user to the No Orgs Page', () => {
      cy.url().should('contain', 'no-org')
      cy.contains('Sign In').click()
      cy.location('pathname').should('eq', '/signin')
    })
  })
})
