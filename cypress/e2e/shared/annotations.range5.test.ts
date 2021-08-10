import {clearLocalStorage, setupData} from 'cypress/e2e/util/annotationsSetup'

describe('range annotations', () => {
  afterEach(clearLocalStorage)
  beforeEach(() => setupData(cy))

  it('shows the range/point annotation type picker when range annotations are on', () => {
    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID('giraffe-inner-plot').click({shiftKey: true})
    })
    cy.getByTestID('overlay--container').within(() => {
      cy.getByTestID('annotation-form-point-type-option').should('be.visible')
      cy.getByTestID('annotation-form-range-type-option').should('be.visible')
    })
  })
})
