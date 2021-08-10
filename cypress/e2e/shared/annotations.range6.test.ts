import {
  addRangeAnnotation,
  startEditingAnnotation,
} from 'cypress/e2e/util/annotationsSetup'

describe('range annotations', () => {
  it('can add a range annotation, then edit it and switch back and forth from point->range and the endtime stays the same', () => {
    addRangeAnnotation(cy)
    startEditingAnnotation(cy)

    // verify there is an end time:
    cy.getByTestID('endTime-testID').should('be.visible')

    // verify that it is range annotation (the range selector option is selected)
    cy.getByTestID('annotation-form-range-type-option--input').should(
      'be.checked'
    )

    // get the 'end time' value:
    cy.getByTestID('endTime-testID')
      .invoke('val')
      .then(endTimeValue => {
        // switch it to a point annotation
        cy.getByTestID('annotation-form-point-type-option').click()

        // the endTime input should disappear
        cy.getByTestID('endTime-testID').should('not.exist')

        // switch back to range:
        cy.getByTestID('annotation-form-range-type-option').click()

        cy.getByTestID('endTime-testID')
          .should('be.visible')
          .invoke('val')
          .then(endTimeValue2 => {
            expect(endTimeValue).to.equal(endTimeValue2)
          })
      })
  })
})
