import {Organization} from '../../src/types'

describe('Secrets', () => {
  beforeEach(() => {
    cy.flush()
    return cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) =>
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${id}/settings/`)
          cy.getByTestID('tree-nav')
          return cy.setFeatureFlags({secretsUI: true}).then(() => {
            return cy.getByTestID('secrets--tab').click()
          })
        })
      )
    })
  })

  it('Can display secrets created via the API and sort said secrets', () => {
    // Empty state exists and displays context appropriate text
    cy.getByTestID('empty-state').should('be.visible')
    cy.getByTestID('empty-state').contains('Secrets')

    // Create secrets via the API, check visibility and sorting
    cy.get('@org').then(({id: orgID}: Organization) => {
      cy.upsertSecret(orgID, {toEverybody: 'rupees baby'})
        .then(() => {
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
        .then(() => {
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

          cy.getByTestID('resource-sorter')
            .click()
            .then(() => {
              cy.getByTestID('resource-sorter--id-desc')
                .click()
                .then(() => {
                  cy.get('span')
                    .filter('[data-testid*="secret-card--"]')
                    .each((val, index) => {
                      expect(val.text()).to.equal(zToA[index])
                    })
                })
            })
        })
    })
  })

  it('Can perform basic CRUD via the UI', () => {
    cy.intercept('PATCH', '**/secrets').as('upsertSecret')
    cy.intercept('DELETE', '**/secrets').as('deleteSecret')
    cy.getByTestID('button-add-secret')
      .first() // There's a second one in the empty state.
      .click()
      .then(() => {
        cy.getByTestID('variable-form-save').should('be.disabled')
        cy.getByTestID('input-field')
          .first()
          .type('Shhhhh')
        cy.getByTestID('variable-form-save').should('be.disabled')
        cy.getByTestID('input-field')
          .last()
          .type("I'm hunting wabbits")
        cy.getByTestID('variable-form-save').should('be.enabled')
        cy.getByTestID('variable-form-save').click()
        cy.wait('@upsertSecret')
          .its('response.statusCode')
          .should('eq', 204)
          .then(() => {
            cy.getByTestID('secret-card--Shhhhh').should('exist')
            cy.getByTestID('secret-card--Shhhhh').should('be.visible')
            cy.getByTestID('secret-card--name-Shhhhh')
              .click()
              .then(() => {
                cy.getByTestID('input-field')
                  .first()
                  .type('This should do nothing')
                cy.getByTestID('input-field')
                  .first()
                  .should('not.contain.text', 'This should do nothing')
                cy.getByTestID('input-field')
                  .last()
                  .type("I'm hunting rabbits")
                cy.getByTestID('variable-form-save').should('be.enabled')
                cy.getByTestID('variable-form-save').click()
                cy.wait('@upsertSecret')
                  .its('response.statusCode')
                  .should('eq', 204)
                  .then(() => {
                    cy.getByTestID('delete-secret-initial--Shhhhh')
                      .click({force: true})
                      .then(() => {
                        cy.getByTestID('delete-secret-confirm--Shhhhh').should(
                          'be.visible'
                        )
                        cy.getByTestID('delete-secret-confirm--Shhhhh').click()
                        cy.wait('@deleteSecret')
                          .its('response.statusCode')
                          .should('eq', 204)
                        // After deletion empty state should be visible
                        cy.getByTestID('empty-state').should('be.visible')
                        cy.getByTestID('empty-state').contains('Secrets')
                      })
                  })
              })
          })
      })
  })
})
