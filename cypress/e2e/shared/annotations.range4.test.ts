import {
  addAnnotation,
  clearLocalStorage,
  setupData,
  startEditingAnnotation,
} from 'cypress/e2e/util/annotationsSetup'

describe('Annotations, but in a different test suite', () => {
  afterEach(clearLocalStorage)
  beforeEach(() => setupData(cy))

  describe('administrative functions like the tests being on and off', () => {
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
})
