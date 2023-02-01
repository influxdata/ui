import {Organization} from '../../../src/types'

const DEFAULT_FLUX_EDITOR_TEXT =
  '// Start by selecting data from the schema browser or typing flux here'

// to see list of monaco-editor widgets to check:
// document.querySelectorAll('[widgetid]')

describe.skip('Editor+LSP communication', () => {
  const runTest = editorSelector => {
    it('receives LSP-triggered server events', () => {
      cy.getByTestID(editorSelector).then(() => {
        cy.getByTestID('flux-editor', {timeout: 30000})
          .should('be.visible')
          .monacoType('{selectall} {backspace}')
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

    it('does not have a composition block', () => {
      cy.getByTestID(editorSelector).then(() => {
        cy.getByTestID('flux-editor', {timeout: 30000}).within(() => {
          cy.get('#schema-composition-sync-icon').should('have.length', 0)
          cy.get('.composition-sync').should('have.length', 0)
        })
      })
    })
  }

  describe('in Flows:', () => {
    before(() => {
      cy.flush()
      cy.signin()
      cy.setFeatureFlags({schemaComposition: true, showNotebooksForCI: true})
      cy.get('@org').then(({id}: Organization) =>
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${id}`)
          cy.createNotebook(id).then(() => {
            cy.reload()
          })
        })
      )
      // Double check that the new schemaComposition flag does not interfere.
      cy.getByTestID('version-info')

      cy.getByTestID('nav-item-flows').should('be.visible')
      cy.getByTestID('nav-item-flows').click()

      cy.getByTestID('preset-new').first().click()
      cy.getByTestID('time-machine-submit-button').should('be.visible')

      cy.get('.flow-divider--button').first().click()
      cy.get('.insert-cell-menu.always-on').contains('Add Another Panel')
      cy.getByTestID('add-flow-btn--rawFluxEditor').last().click()
      cy.getByTestID('flux-editor').should('be.visible')
    })

    runTest('flux-editor')
  })

  describe('in DataExplorer', () => {
    before(() => {
      cy.flush()
      cy.signin()
      cy.setFeatureFlags({
        schemaComposition: true,
      })
      cy.get('@org').then(({id}: Organization) => {
        cy.createMapVariable(id)
        cy.fixture('routes').then(({orgs, explorer}) => {
          cy.visit(`${orgs}/${id}${explorer}`)
          cy.getByTestID('tree-nav').should('be.visible')
        })
      })
      // Double check that the new schemaComposition flag does not interfere.
      cy.getByTestID('switch-to-script-editor').should('be.visible').click()
    })

    runTest('time-machine--bottom')
  })

  describe('in Script Editor', () => {
    const setScriptToFlux = () => {
      return cy.isIoxOrg().then(isIox => {
        if (isIox) {
          cy.getByTestID('query-builder--new-script')
            .should('be.visible')
            .click()
          cy.getByTestID('script-dropdown__flux').should('be.visible').click()
          cy.getByTestID('overlay--container').within(() => {
            cy.getByTestID('script-query-builder--no-save')
              .should('be.visible')
              .click()
          })
        }
        return cy.getByTestID('flux-editor').within(() => {
          cy.get('textarea.inputarea').should(
            'have.value',
            DEFAULT_FLUX_EDITOR_TEXT
          )
        })
      })
    }

    before(() => {
      cy.flush()
      cy.signin()
      cy.setFeatureFlags({
        newDataExplorer: true,
        schemaComposition: false,
        saveAsScript: true,
        enableFluxInScriptBuilder: true,
      })
      cy.get('@org').then(({id}: Organization) => {
        cy.visit(`/orgs/${id}/data-explorer`)
        cy.getByTestID('tree-nav').should('be.visible')
        cy.getByTestID('script-query-builder-toggle').then($toggle => {
          cy.wrap($toggle).should('be.visible')
          // Switch to Script Editor if not yet
          if ($toggle.hasClass('active')) {
            // active means showing the old Data Explorer
            // hasClass is a jQuery function
            $toggle.click()
            cy.getByTestID('script-query-builder--menu').contains('New Script')
          }
          return setScriptToFlux()
        })
      })
    })

    runTest('flux-editor')
  })
})
