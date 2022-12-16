import {Organization} from '../../../src/types'
import {points} from '../../support/commands'

const setupData = (cy: Cypress.Chainable) =>
  cy.flush().then(() =>
    cy.signin().then(() => {
      cy.setFeatureFlags({zoomRequery: true})
      return cy.get('@org').then(({id: orgID, name}: Organization) =>
        cy.createDashboard(orgID).then(({body}) =>
          cy.fixture('routes').then(({orgs}) => {
            cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
            return cy.then(() => {
              cy.createBucket(orgID, name, 'devbucket')
              /*
                note:
                  graph types vary in the presentation of the line
                  for example, "Graph" presents a line less steep than "Graph + Single Stat"
                  use enough points and a time difference that works for all graph types
                  10 points and 5 minute time difference works well
              */
              cy.writeData(points(10, 600_000), 'devbucket')

              cy.intercept('POST', '/api/v2/query?*').as('makeQuery')
              // make a dashboard cell
              cy.getByTestID('add-cell--button').click()
              cy.wait('@makeQuery')
              cy.wait('@makeQuery')
              cy.getByTestID('selector-list devbucket').should(
                'have.length.of.at.least',
                1
              )
              cy.getByTestID('selector-list devbucket').click()
              cy.wait('@makeQuery')
              cy.wait('@makeQuery')
              cy.getByTestID('selector-list m').should(
                'have.length.of.at.least',
                1
              )
              cy.getByTestID('selector-list m').clickAttached()
              cy.wait('@makeQuery')
              cy.wait('@makeQuery')
              cy.getByTestID('selector-list v').should(
                'have.length.of.at.least',
                1
              )
              cy.getByTestID('selector-list v').clickAttached()
              cy.wait('@makeQuery')
              cy.wait('@makeQuery')
              cy.getByTestID('view-type--dropdown').click()
              cy.getByTestID('view-type--xy').click()

              cy.getByTestID(`selector-list tv1`).should(
                'have.length.of.at.least',
                1
              )
              cy.getByTestID(`selector-list tv1`).clickAttached()
              cy.wait('@makeQuery')
              cy.wait('@makeQuery')

              cy.getByTestID('time-machine-submit-button').click()
              cy.wait('@makeQuery')

              cy.getByTestID('page-title').click()
              cy.getByTestID('renamable-page-title--input')
                .clear()
                .type('blah{enter}')
              cy.getByTestID('save-cell--button').click()
            })
          })
        )
      )
    })
  )

describe('Adaptive Zoom', () => {
  beforeEach(() => setupData(cy))

  it('makes a query when zooming in', () => {
    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID('giraffe-layer-line').then(([canvas]) => {
        const {offsetWidth, offsetHeight} = canvas
        const {x, y} = canvas.getBoundingClientRect()
        cy.wrap(canvas).trigger('mousedown', {
          pageX: x + offsetWidth / 4,
          pageY: y + offsetHeight / 2,
          force: true,
          shiftKey: true,
        })
        cy.wrap(canvas).trigger('mousemove', {
          pageX: x + (offsetWidth * 3) / 4,
          pageY: y + offsetHeight / 2,
          force: true,
          shiftKey: true,
        })
        cy.wrap(canvas).trigger('mouseup', {force: true, shiftKey: true})
        cy.wait('@makeQuery')
          .its('response.body')
          .should('have.length.greaterThan', 2) // we need more than just a carriage return and newline
      })
    })
  })
})
