import {Organization} from '../../../src/types'
import {lines} from '../../support/commands'
describe('The Annotations UI functionality, on a graph (xy line) graph type', () => {
  beforeEach(() => {
    cy.flush()
    return cy.signin().then(() =>
      cy.get('@org').then(({id: orgID}: Organization) =>
        cy.createDashboard(orgID).then(({body}) =>
          cy.fixture('routes').then(({orgs}) => {
            cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
            return cy
              .setFeatureFlags({
                useGiraffeGraphs: true,
              })
              .then(() => {
                cy.createBucket(orgID, name, 'devbucket')
                // have to add large amount of data to fill the window so that the random click for annotation works
                cy.writeData(lines(3000), 'devbucket')

                // make a dashboard cell
                cy.getByTestID('add-cell--button').click()
                cy.getByTestID('selector-list devbucket').should(
                  'have.length.of.at.least',
                  1
                )
                cy.getByTestID('selector-list devbucket').click()

                cy.getByTestID('selector-list m').should(
                  'have.length.of.at.least',
                  1
                )
                cy.getByTestID('selector-list m').clickAttached()

                cy.getByTestID('selector-list v').should(
                  'have.length.of.at.least',
                  1
                )
                cy.getByTestID('selector-list v').clickAttached()

                cy.getByTestID(`selector-list tv1`).should(
                  'have.length.of.at.least',
                  1
                )
                cy.getByTestID(`selector-list tv1`).clickAttached()

                cy.getByTestID('time-machine-submit-button').click()

                cy.getByTestID('overlay').within(() => {
                  cy.getByTestID('page-title').click()
                  cy.getByTestID('renamable-page-title--input')
                    .clear()
                    .type('blah')
                  cy.getByTestID('save-cell--button').click()
                })

                cy.getByTestID('toggle-annotations-controls').click()
              })
          })
        )
      )
    )
  })

  it('can create an annotation on the xy line graph', () => {
    cy.getByTestID('cell blah')
  })
})
