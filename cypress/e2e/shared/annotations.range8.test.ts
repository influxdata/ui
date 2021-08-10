import * as moment from 'moment'
import {DEFAULT_TIME_FORMAT} from 'src/utils/datetime/constants'
import {
  checkAnnotationText,
  clearLocalStorage,
  setupData,
  startEditingAnnotation,
} from 'cypress/e2e/util/annotationsSetup'

describe('range annotations', () => {
  afterEach(clearLocalStorage)
  beforeEach(() => setupData(cy))

  it('can add an annotation; that is originally a point and then switch to a range', () => {
    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID('giraffe-inner-plot').click({shiftKey: true})
    })
    cy.getByTestID('overlay--container').within(() => {
      cy.getByTestID('edit-annotation-message')
        .should('be.visible')
        .click()
        .focused()
        .type('random annotation, should be a range')

      // should be of type 'point'
      cy.getByTestID('annotation-form-point-type-option--input').should(
        'be.checked'
      )

      // confirm that the 'endTime' input is NOT THERE
      cy.getByTestID('endTime-testID').should('not.exist')

      // now: click the button to switch to range:
      cy.getByTestID('annotation-form-range-type-option').click()

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

              cy.getByTestID('annotation-submit-button').click()
            })
        })
    }) // end overlay-container within
    checkAnnotationText(cy, 'random annotation, should be a range')

    startEditingAnnotation(cy)

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
