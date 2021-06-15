import {Organization} from '../../../src/types'

describe.skip('DataExplorer - Geo Map Type Customization Options', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.createMapVariable(id)
        cy.fixture('routes').then(({orgs, explorer}) => {
          cy.visit(`${orgs}/${id}${explorer}`)
          cy.getByTestID('tree-nav')
          cy.setFeatureFlags([{flag: 'mapGeo', value: true}])
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
  })
})
