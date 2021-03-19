import {Organization} from '../../../src/types'
import {lines} from '../../support/commands'
describe('The Annotations UI functionality', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin().then(() =>
      cy.fixture('routes').then(({orgs}) => {
        cy.get('@org').then(({id: orgID}: Organization) => {
          cy.visit(`${orgs}/${orgID}/dashboards-list`)
          cy.getByTestID('tree-nav')
        })
      })
    )
    cy.window().then(w => {
      cy.wait(1000)
      w.influx.set('annotations', true)
    })
    cy.get('@org').then(({id: orgID}: Organization) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('tree-nav')
          cy.createBucket(orgID, name, 'schmucket')
          // have to add large amount of data to fill the window so that the random click for annotation works
          cy.writeData(lines(3000), 'schmucket')
        })
      })
    })
    cy.getByTestID('toggle-annotations-controls').click()
    cy.getByTestID('annotations-control-bar').should('be.visible')
    cy.getByTestID('add-cell--button')
      .click()
      .then(() => {
        cy.getByTestID('selector-list schmucket')
          .click()
          .getByTestID(`selector-list m`)
          .click()
          .getByTestID('selector-list v')
          .click()
          .getByTestID(`selector-list tv1`)
          .click()
          .then(() => {
            cy.getByTestID('time-machine-submit-button').click()
          })
      })
    cy.getByTestID('overlay').within(() => {
      cy.getByTestID('page-title').click()
      cy.getByTestID('renamable-page-title--input')
        .clear()
        .type('blah')
      cy.getByTestID('save-cell--button').click()
    })
    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID('giraffe-inner-plot').click()
    })
    cy.getByTestID('overlay--container').within(() => {
      cy.getByTestID('textarea')
        .should('be.visible')
        .click()
        .focused()
        .type('im a hippopotamus')
      cy.getByTestID('add-annotation-submit').click()
    })
  })
  it('can hide the stream in the search bar when the stream is active', () => {
    cy.getByTestID('annotations-search-input')
      .focus()
      .click()
    cy.getByTestID('annotations-searchbar-suggestions').within(() => {
      cy.getByTestID('list-empty-state').should('be.visible')
    })
  })
  it('can hide the pill and stop rendering the stream once X is clicked on the pill', () => {
    // disable default
    cy.getByTestID('annotation-pill default').click()

    // should appear in the suggestions
    cy.getByTestID('annotations-search-input')
      .focus()
      .click()
      .getByTestID('annotations-searchbar-suggestions')
      .within(() => {
        cy.getByTestID('annotations-suggestion default').should('be.visible')
      })
    // the rendering should stop
    cy.get('line').should('not.exist')
  })
  it('can re-display the removed pill and re-render the annotations for that stream', () => {
    // disable default
    cy.getByTestID('annotation-pill default').click()

    // should appear in the suggestions, click on it
    cy.getByTestID('annotations-search-input')
      .focus()
      .click()
      .getByTestID('annotations-searchbar-suggestions')
      .within(() => {
        cy.getByTestID('annotations-suggestion default')
          .should('be.visible')
          .click()
      })

    // the rendering should start
    cy.get('line').should('exist')

    // the pill should be back
    cy.getByTestID('annotation-pill default').should('exist')
  })
  it('can hide the Annotations Control bar after clicking on the Annotations Toggle Button', () => {
    cy.getByTestID('toggle-annotations-controls').click()
    cy.getByTestID('annotations-control-bar').should('not.exist')
  })
  it('can disable writing annotations if Enable-Annotations is disabled', () => {
    cy.getByTestID('annotations-one-click-toggle').click()

    // click on the graph to try adding an annotation
    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID('giraffe-inner-plot').click()
    })

    // should not show an overlay.
    cy.getByTestID('overlay').should('not.exist')
  })
  it('text for created annotation shows up in tooltip', () => {})
})
