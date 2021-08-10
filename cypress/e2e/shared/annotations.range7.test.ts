import {
  addRangeAnnotation,
  reloadAndHandleAnnotationDefaultStatus,
  startEditingAnnotation,
} from 'cypress/e2e/util/annotationsSetup'

describe('range annotations', () => {
  it('can add a range annotation, then edit it and change to a point annotation', () => {
    addRangeAnnotation(cy)
    reloadAndHandleAnnotationDefaultStatus()
    startEditingAnnotation(cy)

    // verify that it is range annotation (the range selector option is selected)
    cy.getByTestID('annotation-form-range-type-option--input').should(
      'be.checked'
    )

    // switch it to a point annotation
    cy.getByTestID('annotation-form-point-type-option').click()

    // verify that it is point  annotation now
    cy.getByTestID('annotation-form-point-type-option--input').should(
      'be.checked'
    )

    // the endTime input should disappear
    cy.getByTestID('endTime-testID').should('not.exist')

    // save it
    cy.getByTestID('annotation-submit-button').click()

    // reload to make sure it gets to the backend
    reloadAndHandleAnnotationDefaultStatus()
    startEditingAnnotation(cy)

    // make sure it is (still) a point annotation:
    cy.getByTestID('endTime-testID').should('not.exist')
    cy.getByTestID('annotation-form-point-type-option--input').should(
      'be.checked'
    )
  })
})
