describe('Flux Dynamic Help Panel in Notebooks', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
  })

  it('can use the dynamic flux function selector to build a query', () => {
      cy.setFeatureFlags({
        fluxDynamicDocs: true,
      }).then(() => {
        cy.wait(1000)

        cy.getByTestID('nav-item-flows').should('be.visible')
        cy.getByTestID('nav-item-flows').click()

        // open Write a flux script
        cy.getByTestID('preset-script')
        .first()
        .click()
        cy.get('.flow-panel').should('be.visible')

        cy.get('.flows-config-function-button')
        cy.getByTestID('button').click()

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

        // should see injected function in editor: DONE
        // TO DO: update test once inject functionality is working.

      })
  })
})
