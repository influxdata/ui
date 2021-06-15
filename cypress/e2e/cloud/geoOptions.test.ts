import {Organization} from '../../../src/types'
import {set} from 'src/shared/utils/featureFlag'

describe.skip('DataExplorer - Geo Map Type Customization Options', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.createMapVariable(id)
        cy.fixture('routes').then(({orgs, explorer}) => {
          cy.visit(`${orgs}/${id}${explorer}`)
          cy.getByTestID('tree-nav')
          set('mapGeo', true)
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
