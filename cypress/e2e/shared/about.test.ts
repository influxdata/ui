import {Organization} from '../../../src/types'

describe('About Page', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.visit(`/orgs/${id}/about`)
        cy.getByTestID('about-page--header').should('be.visible')
      })
    })
  })

  it('should display everything correctly', () => {
    cy.getByTestID('common-ids--panel').within(() => {
      cy.getByTestID('code-snippet--userid').should('exist')
      cy.getByTestID('copy-btn--userid').should('not.be.disabled')

      cy.getByTestID('code-snippet--orgid').should('exist')
      cy.getByTestID('copy-btn--orgid').should('not.be.disabled')
    })

    cy.getByTestID('organization-profile--panel').within(() => {
      cy.getByTestID('rename-org--button').click()
    })

    cy.getByTestID('danger-confirmation--button').click()
    cy.getByTestID('form--element-error').should('not.exist')
    cy.getByTestID('create-org-name-input').clear()

    // check the error state
    cy.getByTestID('form--element-error')
      .should('exist')
      .contains('Name is required')
    cy.getByTestID('rename-org-submit--button').should('be.disabled')

    const newOrgName = `hard@knock.life${Math.random()}`

    cy.intercept('PATCH', 'api/v2/orgs/*').as('patchOrg')

    cy.getByTestID('create-org-name-input').type(newOrgName)
    cy.getByTestID('rename-org-submit--button')
      .should('not.be.disabled')
      .click()

    cy.wait('@patchOrg')

    cy.getByTestID('notification-success')
      .should('be.visible')
      .contains(newOrgName)

    cy.getByTestID('org-profile--name').contains(newOrgName)
    cy.getByTestID('danger-zone--org-name').contains(newOrgName)
  })
})
