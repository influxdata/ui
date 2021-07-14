import {
  addAnnotation,
  clearLocalStorage,
  setupData,
  startEditingAnnotation,
} from '../util/annotationsSetup'

describe('Annotations administrative functions like the tests being on and off', () => {
  afterEach(clearLocalStorage)
  beforeEach(() => setupData(cy))

  it('can create an annotation that is scoped to a dashboard cell', () => {
    // create a new cell
    cy.getByTestID('button')
      .click()
      .then(() => {
        // Look at this article for removing flakiness https://www.cypress.io/blog/2020/07/22/do-not-get-too-detached/
        cy.getByTestID('selector-list schmucket').should('be.visible')
        cy.getByTestID('selector-list schmucket').click()
        cy.getByTestID(`selector-list m`).should('be.visible')
        cy.getByTestID(`selector-list m`).click()
        cy.getByTestID('selector-list v')
          .click()
          .then(() => {
            cy.getByTestID(`selector-list tv1`)
              .click()
              .then(() => {
                cy.getByTestID('time-machine-submit-button').click()
              })
          })
      })
    cy.getByTestID('overlay').within(() => {
      cy.getByTestID('page-title').click()
      cy.getByTestID('renamable-page-title--input')
        .clear()
        .type('newCell')
      cy.getByTestID('save-cell--button').click()
    })

    // there should be no annotations in this cell
    cy.getByTestID('cell newCell').within(() => {
      cy.get('line').should('not.exist')
    })

    // create a new annotation in it
    cy.getByTestID('cell newCell').within(() => {
      cy.getByTestID('giraffe-inner-plot').click({shiftKey: true})
    })

    cy.getByTestID('overlay--container').within(() => {
      cy.getByTestID('edit-annotation-message').should('be.visible')
      cy.getByTestID('edit-annotation-message').click()
      cy.getByTestID('edit-annotation-message').focused()
      cy.getByTestID('edit-annotation-message').type('annotation in newCell')
      cy.getByTestID('annotation-submit-button').click()
    })

    // should have the annotation created and the tooltip should says "annotation in newCell"
    cy.getByTestID('cell newCell').within(() => {
      cy.getByTestID('giraffe-inner-plot').trigger('mouseover')
    })
    cy.getByTestID('giraffe-annotation-tooltip').contains(
      'annotation in newCell'
    )
  })
  it('cannot create an annotation when the shift key is NOT pressed down', () => {
    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID('giraffe-inner-plot').click()
    })

    cy.getByTestID('overlay--container').should('not.exist')
  })

  it('can hide the Annotations Control bar after clicking on the Annotations Toggle Button', () => {
    cy.getByTestID('toggle-annotations-controls').click()
    cy.getByTestID('annotations-control-bar').should('not.exist')
  })

  it('can show a tooltip when annotation is hovered on in the graph', () => {
    addAnnotation(cy)

    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID('giraffe-inner-plot').trigger('mouseover')
    })
    cy.getByTestID('giraffe-annotation-tooltip').contains('im a hippopotamus')
  })

  it('can cancel an annotation edit process by clicking on the cancel button in the edit annotation form', () => {
    addAnnotation(cy)

    // should have the annotation created, lets click it to show the modal.
    startEditingAnnotation(cy)

    cy.getByTestID('edit-annotation-message')
      .clear()
      .type('lets edit this annotation...')

    cy.getByTestID('edit-annotation-cancel-button').click()

    // annotation tooltip should say the old name
    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID('giraffe-inner-plot').trigger('mouseover')
    })
    cy.getByTestID('giraffe-annotation-tooltip').contains('im a hippopotamus')
  })
})
