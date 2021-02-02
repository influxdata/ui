import {Organization} from '../../../src/types'
describe('DataExplorer - Geo Map Type Customization Options', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.createMapVariable(id)
        cy.fixture('routes').then(({orgs, explorer}) => {
          cy.visit(`${orgs}/${id}${explorer}`)
        })
      })
    })
  })
  describe('map type options customizations for geo type', () => {
    beforeEach(() => {
      cy.getByTestID('view-type--dropdown').click()
      cy.getByTestID(`view-type--geo`).click()
      cy.getByTestID('cog-cell--button').click()
    })

    it('sets proper map type based on selected map type option', () => {
      cy.get('.view-options').within(() => {
        cy.getByTestID('Heat-option').click()
        cy.getByTestID('Heat-option').should(
          'have.class',
          'cf-select-group--option__active'
        )
        cy.getByTestID('geo-heatmap-radius-slider').should('be.visible')
      })
    })
    it('sets values correctly based on slider adjustments for latitude, longitude, zoom values', () => {
      cy.get('.view-options').within(() => {
        cy.getByTestID('Circle-option').click()
        cy.getByTestID('Circle-option').should(
          'have.class',
          'cf-select-group--option__active'
        )
        cy.getByTestID('geo-latitude').invoke('val', 50)
        cy.getByTestID('geo-latitude').should('have.value', 50)

        cy.getByTestID('geo-longitude').invoke('val', 100)
        cy.getByTestID('geo-longitude').should('have.value', 100)

        cy.getByTestID('geo-zoom').invoke('val', 10)
        cy.getByTestID('geo-zoom').should('have.value', 10)
      })
    })
  })
})
