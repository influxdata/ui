import {Organization} from '../../src/types'

describe('flows alert panel', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() =>
        cy.get('@org').then(({id}: Organization) =>
          cy.fixture('routes').then(({orgs}) => {
            cy.visit(`${orgs}/${id}`)
            cy.getByTestID('version-info')
            return cy
              .setFeatureFlags({
                fluxDynamicDocs: true,
              })
              .then(() => {
                cy.getByTestID('nav-item-flows').should('be.visible')
                return cy.getByTestID('nav-item-flows').click()
              })
          })
        )
      )
    )
  )

  it('can use the dynamic flux function selector to build a query', () => {
    // open Write a flux script
    cy.getByTestID('preset-script')
      .first()
      .click()
    cy.get('.flow-panel').should('be.visible')

    cy.get('.flows-config-function-button')
    cy.getByTestID('button').click()

    // cy.get('.view-line').should('be.visible').clear()
    // cy.getByTestID('flux-editor').clear()

    // search for a function
    cy.getByTestID('flux-toolbar-search--input')
      .clear()
      .type('microsecondd') // purposefully misspell "microsecond" so all functions are filtered out

    cy.getByTestID('flux-toolbar--list').within(() => {
      cy.getByTestID('empty-state').should('be.visible')
    })
    cy.getByTestID('flux-toolbar-search--input').type('{backspace}')

    cy.get('.flux-toolbar--list-item').should('contain', 'microsecond')
    cy.get('.flux-toolbar--list-item').should('have.length', 1)

    // hovers over function and see a tooltip
    cy.get('.flux-toolbar--list-item').trigger('mouseover')
    cy.getByTestID('flux-docs--microsecond').should('be.visible')

    // inject function into script editor
    cy.getByTestID('flux--microsecond--inject').click({force: true})

    // should see injected function in editor

    cy.get('.flux-editor--monaco')
    cy.get('.view-lines').contains('import "date" |> millisecond()')
  })
})
