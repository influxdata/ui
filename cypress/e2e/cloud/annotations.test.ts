import {Organization} from '../../../src/types'

describe('Annotations', () => {
    beforeEach(() => {
      cy.flush()
      cy.signin().then(() =>
        cy.fixture('routes').then(({orgs}) => {
          cy.get('@org').then(({id: orgID}: Organization) => {
            cy.visit(`${orgs}/${orgID}/dashboards-list`)
            cy.getByTestID('tree-nav')
          })
        })
      )
    })

    it("can create an annotation when control bar open", () => {
        cy.get('@org').then(({id: orgID}: Organization) => {
          cy.createDashboard(orgID).then(({body}) => {
            cy.fixture('routes').then(({orgs}) => {
              cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
              cy.getByTestID('tree-nav')
            })
          })
        })
        
        cy.getByTestID('annotations-control-bar').should('be.visible')
      })

      it("text for created annotation shows up in tooltip", () => {
        cy.get('@org').then(({id: orgID}: Organization) => {
          cy.createDashboard(orgID).then(({body}) => {
            cy.fixture('routes').then(({orgs}) => {
              cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
              cy.getByTestID('tree-nav')
            })
          })
        })
    
      })
})