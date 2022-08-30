import {Organization} from '../../../src/types'

// to see list of monaco-editor widgets to check:
// document.querySelectorAll('[widgetid]')

describe('Editor+LSP communication', () => {
  const runTest = editorSelector => {
    it('receives LSP-triggered server events', () => {
      cy.getByTestID(editorSelector).then(() => {
        cy.getByTestID('flux-editor', {timeout: 30000})
          .should('be.visible')
          .monacoType('foo |> bar')
          .within(() => {
            cy.get('.squiggly-error', {timeout: 30000}).should('be.visible')
          })
        cy.getByTestID('flux-editor').monacoType('{selectall}{del}')
      })
    })

    it('has a roundtrip request-response, from the editor to the LSP server', () => {
      cy.getByTestID(editorSelector).then(() => {
        cy.getByTestID('flux-editor', {timeout: 30000})
          .monacoType('{selectall} {backspace}')
          .monacoType('from(')
          .within(() => {
            cy.get('[widgetid="editor.widget.suggestWidget"]', {
              timeout: 30000,
            }).should('be.visible')
          })
          .monacoType(`{selectall}{del}`)
      })
    })
  }

  describe('in Flows:', () => {
    before(() => {
      cy.flush()
      cy.signin()
      cy.get('@org').then(({id}: Organization) =>
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${id}`)
        })
      )
      cy.getByTestID('version-info')
      cy.getByTestID('nav-item-flows').should('be.visible')
      cy.getByTestID('nav-item-flows').click()

      cy.getByTestID('preset-new')
        .first()
        .click()
      cy.getByTestID('time-machine-submit-button').should('be.visible')

      cy.get('.flow-divider--button')
        .first()
        .click()
      cy.get('.insert-cell-menu.always-on').contains('Add Another Panel')
      cy.getByTestID('add-flow-btn--rawFluxEditor')
        .last()
        .click()
      cy.getByTestID('flux-editor').should('be.visible')
    })

    runTest('flux-editor')
  })

  describe('in DataExplorer', () => {
    before(() => {
      cy.flush()
      cy.signin()
      cy.get('@org').then(({id}: Organization) => {
        cy.createMapVariable(id)
        cy.fixture('routes').then(({orgs, explorer}) => {
          cy.visit(`${orgs}/${id}${explorer}`)
          cy.getByTestID('tree-nav').should('be.visible')
        })
      })
      cy.getByTestID('switch-to-script-editor')
        .should('be.visible')
        .click()
    })

    runTest('time-machine--bottom')
  })

  describe('in Script Editor', () => {
    before(() => {
      cy.flush()
      cy.signin()
      cy.get('@org').then(({id}: Organization) => {
        cy.visit(`/orgs/${id}/data-explorer`)
        cy.getByTestID('tree-nav').should('be.visible')
        cy.setFeatureFlags({
          newDataExplorer: true,
        }).then(() => {
          cy.wait(1200)
          cy.getByTestID('flux-query-builder-toggle').then($toggle => {
            cy.wrap($toggle).should('be.visible')
            // Switch to Flux Query Builder if not yet
            if (!$toggle.hasClass('active')) {
              // hasClass is a jQuery function
              $toggle.click()
              cy.getByTestID('flux-query-builder--menu').contains('New Script')
            }
          })
        })
      })
    })

    runTest('flux-editor')
  })
})
