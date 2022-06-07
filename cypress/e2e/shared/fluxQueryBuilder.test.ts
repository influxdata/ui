import {Organization} from '../../../src/types'

describe('FluxQueryBuilder', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.get('@org').then(({id}: Organization) => {
      cy.fixture('routes').then(({orgs, explorer}) => {
        cy.setFeatureFlags({newDataExplorer: true}).then(() => {
          cy.visit(`${orgs}/${id}${explorer}`)
          cy.getByTestID('tree-nav').should('be.visible')
          // Switch to Flux Query Builder
          cy.getByTestID('slide-toggle').should('be.visible').click()
        })
      })
    })
  })

  describe('schema browser', () => {
    it("exists", () => {
      cy.getByTestID('schema-browser').should('be.visible')
    })
  })
})
