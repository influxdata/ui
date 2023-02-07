import {
  ANNOTATION_TEXT,
  EDIT_ANNOTATION_TEXT,
  RANGE_ANNOTATION_TEXT,
  addAnnotation,
  addRangeAnnotation,
  checkAnnotationText,
  setupData,
  startEditingAnnotation,
} from '../util/annotationsSetup'
import * as moment from 'moment'

import {DEFAULT_TIME_FORMAT} from '../../../src/utils/datetime/constants'

describe('Annotations, but in a different test suite', () => {
  beforeEach(() => setupData(cy))

  describe('administrative functions like the tests being on and off', () => {
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

    it('can create an annotation, and then after turning off annotation mode annotations disappear', () => {
      // create an annotation
      addAnnotation(cy)

      // verify the tooltip shows up
      checkAnnotationText(cy, ANNOTATION_TEXT)

      // turn off annotations mode
      cy.getByTestID('toggle-annotations-controls').click()

      // verify the annotation does NOT show up
      cy.getByTestID('cell blah').within(() => {
        cy.get('.giraffe-annotation-click-target').should('not.exist')
      })

      cy.getByTestID('giraffe-annotation-tooltip').should('not.exist')
    })

    it('cannot create an annotation when graph is clicked and annotation mode is off', () => {
      // switch off the control bar
      cy.getByTestID('toggle-annotations-controls').click()
      cy.getByTestID('annotations-control-bar').should('not.exist')

      cy.getByTestID('cell blah').within(() => {
        cy.getByTestID('giraffe-inner-plot').click({shiftKey: true})
      })

      cy.getByTestID('overlay--container').should('not.exist')
    })

    it('can show a tooltip when annotation is hovered on in the graph', () => {
      addAnnotation(cy)

      cy.getByTestID('cell blah').within(() => {
        cy.get('.giraffe-annotation-click-target')
          .should('exist')
          .trigger('mouseover')
      })
      cy.getByTestID('giraffe-annotation-tooltip').contains(ANNOTATION_TEXT)
    })

    it('can cancel an annotation edit process by clicking on the cancel button in the edit annotation form', () => {
      addAnnotation(cy)

      // should have the annotation created, lets click it to show the modal.
      startEditingAnnotation(cy)

      cy.getByTestID('overlay--container').should('be.visible')
      cy.getByTestID('annotation-message--form').should('be.visible')

      cy.getByTestID('edit-annotation-message')
        .focused()
        .invoke('val', EDIT_ANNOTATION_TEXT)
        .focused()
        .type('.')
      cy.getByTestID('edit-annotation-cancel-button').click()

      cy.getByTestID('annotation-message--form').should('not.exist')

      // annotation tooltip should say the old name
      cy.getByTestID('cell blah').within(() => {
        cy.get('.giraffe-annotation-click-target')
          .should('exist')
          .trigger('mouseover')
      })

      cy.getByTestID('giraffe-annotation-tooltip').contains(ANNOTATION_TEXT)
    })
  })

  describe('range annotations', () => {
    it('shows the range/point annotation type picker', () => {
      cy.getByTestID('cell blah').within(() => {
        cy.getByTestID('giraffe-inner-plot').click({shiftKey: true})
      })

      cy.getByTestID('overlay--container').within(() => {
        cy.getByTestID('annotation-form-point-type-option').should('be.visible')
        cy.getByTestID('annotation-form-range-type-option').should('be.visible')
      })
    })

    it('can add a range annotation, then edit it and switch back and forth from point->range and the endtime stays the same', () => {
      addRangeAnnotation(cy)

      startEditingAnnotation(cy)

      cy.getByTestID('overlay--container').should('be.visible')

      // verify there is an end time:
      cy.getByTestID('endTime-testID').should('be.visible')

      // verify that it is a range annotation (the range selector option is selected)
      cy.getByTestID('annotation-form-range-type-option--input').should(
        'be.checked'
      )

      // get the 'end time' value:
      cy.getByTestID('endTime-testID')
        .invoke('val')
        .then(endTimeValue => {
          // switch it to a point annotation
          cy.getByTestID('annotation-form-point-type-option')
            .should($el => {
              expect($el).to.have.length(1)
              expect(Cypress.dom.isDetached($el)).to.be.false
              expect($el).to.not.have.class('cf-select-group--option__active')
            })
            .click()

          // the endTime input should disappear
          cy.getByTestID('endTime-testID').should('not.exist')

          // switch back to range:
          cy.getByTestID('annotation-form-range-type-option')
            .should($el => {
              expect($el).to.have.length(1)
              expect(Cypress.dom.isDetached($el)).to.be.false
              expect($el).to.not.have.class('cf-select-group--option__active')
            })
            .click()

          cy.getByTestID('endTime-testID')
            .should('be.visible')
            .invoke('val')
            .then(endTimeValue2 => {
              expect(endTimeValue).to.equal(endTimeValue2)
            })
        })
    })

    it('can add a range annotation, then edit it and change to a point annotation', () => {
      addRangeAnnotation(cy)
      startEditingAnnotation(cy)

      cy.getByTestID('overlay--container').should('be.visible')

      // verify that it is range annotation (the range selector option is selected)
      cy.getByTestID('annotation-form-range-type-option--input').should(
        'be.checked'
      )

      // switch it to a point annotation
      cy.getByTestID('annotation-form-point-type-option')
        .should($el => {
          expect($el).to.have.length(1)
          expect(Cypress.dom.isDetached($el)).to.be.false
          expect($el).to.not.have.class('cf-select-group--option__active')
        })
        .click()

      // verify that it is a point annotation now
      cy.getByTestID('annotation-form-point-type-option--input').should(
        'be.checked'
      )

      // the endTime input should disappear
      cy.getByTestID('endTime-testID').should('not.exist')

      // save it
      cy.getByTestID('annotation-submit-button')
        .should('not.be.disabled')
        .click()

      // make sure the edit was saved successfully
      cy.getByTestID('notification-success').should('be.visible')

      startEditingAnnotation(cy)
      cy.getByTestID('overlay--container').should('be.visible')

      // make sure it is (still) a point annotation:
      cy.getByTestID('endTime-testID').should('not.exist')
      cy.getByTestID('annotation-form-point-type-option--input').should(
        'be.checked'
      )
    })

    it('can add an annotation; that is originally a point and then switch to a range', () => {
      cy.getByTestID('cell blah').within(() => {
        cy.getByTestID('giraffe-inner-plot').click({shiftKey: true})
      })

      cy.getByTestID('overlay--container').should('be.visible')
      cy.getByTestID('annotation-message--form').should('be.visible')

      // edit the Annotation message first becuase it gets focused automatically
      cy.getByTestID('edit-annotation-message')
        .focused()
        .invoke('val', RANGE_ANNOTATION_TEXT)
        .focused()
        .type('.')
      // should be of type 'point'
      cy.getByTestID('annotation-form-point-type-option--input').should(
        'be.checked'
      )

      // confirm that the 'endTime' input is NOT THERE
      cy.getByTestID('endTime-testID').should('not.exist')

      // now: click the button to switch to range:
      cy.getByTestID('annotation-form-range-type-option')
        .should($el => {
          expect($el).not.to.have.class('cf-select-group--option__active')
          expect(Cypress.dom.isDetached($el)).to.be.false
          expect($el).to.have.length(1)
        })
        .click()

      // now, the end time input SHOULD show up
      cy.getByTestID('endTime-testID').should('be.visible')

      // at first the two times are equal; check that; then upgrade the time by 10 minutes; and save it
      cy.getByTestID('startTime-testID')
        .invoke('val')
        .then(startTimeValue => {
          cy.getByTestID('endTime-testID')
            .invoke('val')
            .then(endTimeValue => {
              expect(endTimeValue).to.equal(startTimeValue)

              const newEndTime = moment(endTimeValue, DEFAULT_TIME_FORMAT)
                .add(10, 'minutes')
                .format(DEFAULT_TIME_FORMAT)

              cy.getByTestID('endTime-testID')
                .click()
                .focused()
                .clear()
                .type(newEndTime)

              cy.getByTestID('annotation-submit-button')
                .should($el => {
                  expect($el).to.have.length(1)
                  expect(Cypress.dom.isDetached($el)).to.be.false
                  // eslint-disable-next-line jest/unbound-method
                  expect($el).not.to.be.disabled
                })
                .click()
            })
        })

      cy.getByTestID('annotation-message--form').should('not.exist')

      checkAnnotationText(cy, RANGE_ANNOTATION_TEXT)

      startEditingAnnotation(cy)

      cy.getByTestID('overlay--container').should('be.visible')

      // verify there is an end time:
      cy.getByTestID('endTime-testID').should('be.visible')

      // verify that it is range annotation (the range selector option is selected)
      cy.getByTestID('annotation-form-range-type-option--input').should(
        'be.checked'
      )

      cy.getByTestID('startTime-testID')
        .invoke('val')
        .then(startTimeValue => {
          cy.getByTestID('endTime-testID')
            .invoke('val')
            .then(endTimeValue => {
              expect(endTimeValue).to.not.equal(startTimeValue)

              // should be 10 minutes between them:
              const duration = moment.duration(
                moment(endTimeValue, DEFAULT_TIME_FORMAT).diff(
                  moment(startTimeValue, DEFAULT_TIME_FORMAT)
                )
              )
              const minutes = duration.asMinutes()

              expect(minutes).to.equal(10)
            })
        })
    })
  })
})
