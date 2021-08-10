import {
  addAnnotation,
  checkAnnotationText,
  reloadAndHandleAnnotationDefaultStatus,
} from 'cypress/e2e/util/annotationsSetup'

describe('range annotations', () => {
  it('can create an annotation, and then after turning off annotation mode annotations disappear', () => {
    // create an annotation
    addAnnotation(cy)

    // reload to make sure the annotation was added in the backend as well.
    reloadAndHandleAnnotationDefaultStatus()

    // verify the tooltip shows up
    checkAnnotationText(cy, 'im a hippopotamus')

    // turn off annotations mode
    cy.getByTestID('toggle-annotations-controls').click()

    // verify the annotation does NOT show up
    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID('giraffe-inner-plot').trigger('mouseover')
    })

    cy.getByTestID('giraffe-annotation-tooltip').should('not.exist')
  })
})
