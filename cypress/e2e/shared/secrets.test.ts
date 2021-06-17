import {Organization} from '../../src/types'

describe('Secrets', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) =>
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${id}/settings/`)
          cy.getByTestID('tree-nav')
          cy.setFeatureFlags({secretsUI: true}).then(() => {
            cy.getByTestID('secrets--tab').click()
          })
        })
      )
    })
  })

  it('Secrets tab setup', () => {
    // Empty state exists and displays context appropriate text
    cy.getByTestID('empty-state').should('be.visible')
    cy.getByTestID('empty-state').contains('Secrets')

    // Create single secret, make sure it's visible
    cy.get('@org').then(({id: orgID}: Organization) => {
      cy.upsertSecret(orgID, {toEverybody: 'rupees baby'})
        .then(() => {
          cy.reload()
          cy.getByTestID('secret-card--toEverybody').should('be.visible')
          cy.getByTestID('copy-to-clipboard--toEverybody').should('exist')

          // Test copy to clipboard via button
          cy.getByTestID('copy-to-clipboard--toEverybody')
            .click({force: true})
            .then(() => {
              cy.task('getClipboard').should('eq', 'toEverybody')
            })
        })
        // Create a second secret, make sure it's visible and test sorting
        .upsertSecret(orgID, {CocaColaRecipe: 'lol'})
        .then(() => {
          cy.reload()
          cy.getByTestID('secret-card--toEverybody').should('exist')
          cy.getByTestID('secret-card--toEverybody').should('be.visible')
          cy.getByTestID('secret-card--CocaColaRecipe').should('exist')
          cy.getByTestID('secret-card--CocaColaRecipe').should('be.visible')

          // Test copy to clipboard via clicking key name
          cy.getByTestID('secret-card--name CocaColaRecipe')
            .click()
            .then(() => {
              cy.task('getClipboard').should('eq', 'CocaColaRecipe')
            })

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
})
