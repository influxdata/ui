import {clearLocalStorage, setupData} from '../util/annotationsSetup'

describe('Annotations, but in a different test suite', () => {
  afterEach(clearLocalStorage)
  beforeEach(() => setupData(cy))

  describe('administrative functions like the tests being on and off', () => {
    it('cannot create an annotation when the shift key is NOT pressed down', () => {
      cy.getByTestID('cell blah').within(() => {
        cy.getByTestID('giraffe-inner-plot').click()
      })

      cy.getByTestID('overlay--container').should('not.exist')
    })
  })
})
