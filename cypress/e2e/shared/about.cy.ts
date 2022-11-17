import {Organization} from '../../../src/types'

describe('About Page', () => {
  const apiOrgPath =
    Cypress.env('dexUrl') === 'OSS' ? '/api/v2/orgs/*' : '/api/v2/quartz/orgs/*'
  const CLOUD = Cypress.env('dexUrl') === 'OSS' ? false : true

  beforeEach(() => {
    cy.flush()
    cy.signin()

    cy.intercept('GET', apiOrgPath).as('getOrg')
    cy.intercept('GET', `${apiOrgPath}/users`).as('getOrgUsers')
    cy.intercept('GET', `${apiOrgPath}/invites`).as('getOrgInvites')
    cy.intercept('PATCH', apiOrgPath).as('patchOrg')
    cy.get('@org').then((org: Organization) => {
      cy.visit(`/orgs/${org.id}/org-settings`)
      cy.getByTestID('about-page--header').should('be.visible')
    })
  })

  it('should display everything correctly', () => {
    if (CLOUD) {
      cy.wait('@getOrg')
      cy.wait('@getOrgUsers')
      cy.wait('@getOrgInvites')
    }
    cy.getByTestID('code-snippet--userid').should('be.visible')
    cy.getByTestID('copy-btn--userid').should('not.be.disabled')

    cy.getByTestID('code-snippet--orgid').should('be.visible')
    cy.getByTestID('copy-btn--orgid').should('not.be.disabled')

    if (CLOUD) {
      cy.getByTestID('org-profile--labeled-data').contains('Cloud Provider')
    }

    cy.getByTestID('rename-org--button').should('be.visible').click()

    cy.getByTestID('danger-confirmation--button').click()
    cy.getByTestID('form--element-error').should('not.exist')

    // clear the org name
    cy.getByTestID('create-org-name-input').clear()

    // deliberately interact with space-backspace in the input field to trigger validation
    cy.getByTestID('create-org-name-input').type(' {backspace}')

    // check the error state
    cy.getByTestID('form--element-error')
      .should('exist')
      .contains('Name is required')
    cy.getByTestID('rename-org-submit--button').should('be.disabled')

    const newOrgName = `hard@knock.life${Math.random()}`

    cy.getByTestID('create-org-name-input').type(newOrgName)
    cy.getByTestID('rename-org-submit--button')
      .should('not.be.disabled')
      .click()

    cy.wait('@patchOrg')

    cy.getByTestID('notification-success')
      .should('be.visible')
      .contains(newOrgName)

    cy.getByTestID('org-profile--name').contains(newOrgName)
    cy.getByTestID('code-snippet--orgName').contains(newOrgName)
  })
})
