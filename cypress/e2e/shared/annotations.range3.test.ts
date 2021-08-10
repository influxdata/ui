import {
  addAnnotation,
  clearLocalStorage,
  setupData,
} from 'cypress/e2e/util/annotationsSetup'

describe('Annotations, but in a different test suite', () => {
  afterEach(clearLocalStorage)
  beforeEach(() => setupData(cy))

  describe('administrative functions like the tests being on and off', () => {
    it('can show a tooltip when annotation is hovered on in the graph', () => {
      addAnnotation(cy)

      cy.getByTestID('cell blah').within(() => {
        cy.getByTestID('giraffe-inner-plot').trigger('mouseover')
      })
      cy.getByTestID('giraffe-annotation-tooltip').contains('im a hippopotamus')
    })
  })
})
