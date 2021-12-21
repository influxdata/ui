import {Organization} from '../../src/types'

describe('Secrets', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.get('@org').then(({id}: Organization) =>
      cy.fixture('routes').then(({orgs}) => {
        cy.visit(`${orgs}/${id}/settings/`)
      })
    )
    cy.getByTestID('tree-nav')
    cy.getByTestID('secrets--tab').click()
  })

  it('Secrets page base functionality', () => {
    cy.intercept('PATCH', '**/secrets').as('upsertSecret')
    cy.intercept('DELETE', '**/secrets/**').as('deleteSecret')

    // Empty state exists and displays context appropriate text
    cy.getByTestID('empty-state').should('be.visible')
    cy.getByTestID('empty-state').contains('Secrets')

    // Create secrets via the API, check visibility and sorting
    cy.get('@org').then(({id: orgID}: Organization) => {
      cy.upsertSecret(orgID, {toEverybody: 'rupees baby'})
        .then((resp: Response) => {
          expect(resp.status).to.eq(204)
          cy.reload()
          cy.getByTestID('secret-card--toEverybody').should('be.visible')
          cy.getByTestID('copy-to-clipboard--toEverybody').should('exist')

          // Cannot currently test copy to clipboard functionality as react copy to clipboard has a
          // fallback mechanism that forces Cypress to create a prompt that causes test execution to hang
          // This is being tracked in Cypress with this issue: https://github.com/cypress-io/cypress/issues/2851

          // Once that is resolved and Cypress is upgraded accordingly this should work:
          // Test copy to clipboard via button
          // cy.getByTestID('copy-to-clipboard--toEverybody')
          //   .click({force: true})
          //   .then(() => {
          //     cy.task('getClipboard').should('eq', 'toEverybody')
          //   })
        })
        // Create a second secret via the API, make sure it's visible and test sorting
        .upsertSecret(orgID, {CocaColaRecipe: 'lol'})
      cy.reload()
      cy.getByTestID('secret-card--toEverybody').should('exist')
      cy.getByTestID('secret-card--toEverybody').should('be.visible')
      cy.getByTestID('secret-card--CocaColaRecipe').should('exist')
      cy.getByTestID('secret-card--CocaColaRecipe').should('be.visible')

      // Leaving commented out copy to clipboard tests per the above comment - JF
      // Test copy to clipboard via clicking key name
      // cy.getByTestID('secret-card--name CocaColaRecipe')
      //   .click()
      //   .then(() => {
      //     cy.task('getClipboard').should('eq', 'CocaColaRecipe')
      //   })

      cy.get('span')
        .filter('[data-testid*="secret-card--"]')
        .should('have.length', 2)

      const aToZ = ['CocaColaRecipe', 'toEverybody']
      const zToA = aToZ.slice().reverse()

      cy.get('span')
        .filter('[data-testid*="secret-card--"]')
        .each((val, index) => {
          expect(val.text()).to.equal(aToZ[index])
        })

      cy.getByTestID('resource-sorter').click()
      cy.getByTestID('resource-sorter--id-desc').click()
      cy.get('span')
        .filter('[data-testid*="secret-card--"]')
        .each((val, index) => {
          expect(val.text()).to.equal(zToA[index])
        })

      // Delete API created secrets via the UI
      cy.getByTestID('context-delete-menu toEverybody--button').click({
        force: true,
      })
      cy.getByTestID('context-delete-menu toEverybody--confirm-button').should(
        'exist'
      )
      cy.getByTestID('context-delete-menu toEverybody--confirm-button').click({
        force: true,
      })
      cy.wait('@deleteSecret')
        .its('response.statusCode')
        .should('eq', 204)
      // After deletion that secret should no longer exist
      cy.getByTestID('secret-card--toEverybody').should('not.exist')

      // Create new secret via UI, then edit it once created
      const secretName = 'Shhhhh'
      cy.getByTestID('button-add-secret')
        .first() // There's a second one in the empty state.
        .click()
      cy.getByTestID('variable-form-save').should('be.disabled')
      cy.getByTestID('input--secret-name')
        .first()
        .type(secretName)
      cy.getByTestID('variable-form-save').should('be.disabled')
      cy.getByTestID('input--secret-value')
        .last()
        .type("I'm a secret!")
      cy.getByTestID('variable-form-save').should('be.enabled')
      cy.getByTestID('variable-form-save').click()
      cy.wait('@upsertSecret')
        .its('response.statusCode')
        .should('eq', 204)
      cy.getByTestID(`secret-card--${secretName}`).should('exist')
      cy.getByTestID(`secret-card--${secretName}`).should('be.visible')
      cy.getByTestID(`secret-card--name-${secretName}`).click()
      cy.getByTestID('input-field').should('be.disabled')
      cy.getByTestID('input-field').should('have.value', secretName)
      cy.getByTestID('input-field')
        .last()
        .type("I'm hunting rabbits")
      cy.getByTestID('variable-form-save').should('be.enabled')
      cy.getByTestID('variable-form-save').click()
      cy.wait('@upsertSecret')
        .its('response.statusCode')
        .should('eq', 204)
    })
  })
})
