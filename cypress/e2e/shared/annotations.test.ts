import {Organization} from '../../../src/types'
import {
  addRangeAnnotation,
  checkAnnotationText,
  clearLocalStorage,
  setupData,
  testAddAnnotation,
  testEditAnnotation,
  testEditRangeAnnotation,
  testDeleteAnnotation,
} from '../util/annotationsSetup'

describe('The Annotations UI functionality, test suite one', () => {
  const singleStatSuffix = 'line-plus-single-stat'
  const bandSuffix = 'band'

  afterEach(clearLocalStorage)

  describe('annotations on a graph + single stat graph type', () => {
    beforeEach(() => setupData(cy, singleStatSuffix))
    it('can create an annotation on the single stat + line graph', () => {
      testAddAnnotation(cy)
    })
    it('can edit an annotation for the single stat + line graph', () => {
      testEditAnnotation(cy)
    })
    it('can delete an annotation for the single stat + line graph', () => {
      testDeleteAnnotationTest(cy)
    })
    it('can add a range annotation for the xy single stat + line graph', () => {
      addRangeAnnotation(cy)
      checkAnnotationText(cy, 'range annotation here!')
    })
    it('can add and edit a range annotation for the single stat + line graph', () => {
      testEditRangeAnnotation(cy)
    })
    it('can add and then delete a range annotation for the single stat + line graph', () => {
      addRangeAnnotation(cy)
      testDeleteAnnotation(cy)
    })
  })

  describe('annotations on a band plot graph type', () => {
    beforeEach(() => setupData(cy, bandSuffix))
    it('can create an annotation on the band plot', () => {
      testAddAnnotation(cy)
    })
    it('can edit an annotation for the band plot', () => {
      testEditAnnotation(cy)
    })
    it('can delete an annotation for the band plot ', () => {
      testDeleteAnnotationTest(cy)
    })

    it('can add a range annotation for the band plot', () => {
      addRangeAnnotation(cy, 'band-chart')
      checkAnnotationText(cy, 'range annotation here!')
    })
    it('can add and edit a range annotation for the band plot', () => {
      testEditRangeAnnotation(cy, 'band-chart')
    })
    it('can add and then delete a range annotation for the band plot', () => {
      addRangeAnnotation(cy, 'band-chart')
      testDeleteAnnotation(cy)
    })
  })

  describe('point annotations only, range annotations are off: ', () => {
    beforeEach(() => setupData(cy, '', false))

    it('hides the range/point annotation type picker when range annotations are OFF', () => {
      cy.getByTestID('cell blah').within(() => {
        cy.getByTestID('giraffe-inner-plot').click({shiftKey: true})
      })
      cy.getByTestID('overlay--container').within(() => {
        cy.getByTestID('annotation-form-point-type-option').should('not.exist')
        cy.getByTestID('annotation-form-range-type-option').should('not.exist')
      })
    })
  })

  describe('annotations on a graph (xy line) graph type: ', () => {
    beforeEach(() => setupData(cy))
    it('can create an annotation on the xy line graph', () => {
      testAddAnnotation(cy)
    })
    it('can edit an annotation  for the xy line graph', () => {
      testEditAnnotation(cy)
    })
    it('can delete an annotation  for the xy line graph', () => {
      testDeleteAnnotationTest(cy)
    })
    it('can add a range annotation for the xy line graph', () => {
      addRangeAnnotation(cy)
      checkAnnotationText(cy, 'range annotation here!')
    })
    it('can add and edit a range annotation for the xy line graph', () => {
      testEditRangeAnnotation(cy)
    })
    it('can add and then delete a range annotation for the xy line graph', () => {
      addRangeAnnotation(cy)
      testDeleteAnnotation(cy)
    })

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
  })
})
