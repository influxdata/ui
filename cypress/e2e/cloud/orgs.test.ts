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

      cy.visit('/')
    })

    it('forwards the user to the No Orgs Page', () => {
      cy.url().should('contain', 'no-org')
      cy.contains('Sign In').click()
      if (Cypress.browser.name === 'firefox') {
        // firefox doesn't respect the forwarding to another domain in an iframe
        // so this is as far as it will get
        cy.location('pathname').should('eq', '/signin')
      } else {
        cy.url().should('contain', 'dex')
      }
    })
  })
})
