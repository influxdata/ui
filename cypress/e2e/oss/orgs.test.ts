import {Organization} from '../../../src/types'

describe('Orgs', () => {
  beforeEach(() => cy.flush())

  describe('when there is a user with no orgs', () => {
    beforeEach(() =>
      cy.signin().then(() => {
        cy.get('@org').then(({id}: Organization) => cy.deleteOrg(id))
        cy.visit('/')
      })
    )

    it('forwards the user to the No Orgs Page', () => {
      cy.url().should('contain', 'no-org')
      cy.contains('Sign In').click()
      cy.location('pathname').should('eq', '/signin')
    })
  })

  describe('updating and switching orgs', () => {
    beforeEach(() => {
      cy.signin()
      cy.visit('/')
    })

    it('should be able to rename the org', () => {
      const extraText = '_my_renamed_org_in_e2e'
      cy.getByTestID('user-nav').click()
      cy.getByTestID('user-nav-item-org-settings').click()
      cy.get('span:contains("Settings")').click()
      cy.getByTestID('rename-org--button').click()
      cy.getByTestID('danger-confirmation--button').click()
      cy.getByTestID('create-org-name-input')
        .click()
        .type(extraText)
      cy.getByTestID('rename-org-submit--button').click()
      cy.get('.cf-tree-nav--team')
        .contains(extraText)
        .should('have.length', 1)
    })
  })
})
