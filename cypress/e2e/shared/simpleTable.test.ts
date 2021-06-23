import {Organization} from '../../../src/types'
import {lines} from '../../support/commands'

describe('simple table interactions', () => {
  const simpleSmall = 'simple-small'
  const simpleLarge = 'simple-large'
  beforeEach(() => {
    cy.flush()
    cy.signin().then(() => {
      cy.get('@org').then(({id: orgID}: Organization) => {
        cy.fixture('routes').then(({orgs, explorer}) => {
          cy.visit(`${orgs}/${orgID}${explorer}`)
          cy.getByTestID('tree-nav')
          cy.setFeatureFlags({simpleTable: true}).then(() => {
            cy.createBucket(orgID, name, simpleLarge)
            cy.writeData(lines(300), simpleLarge)
            cy.createBucket(orgID, name, simpleSmall)
            cy.writeData(lines(30), simpleSmall)
            cy.reload()
          })
        })
      })
    })
  })

  it('should render correctly after switching from a dataset with more pages to one with fewer', () => {
    cy.getByTestID('query-builder').should('exist')

    // show raw data view of data with 100 pages
    cy.getByTestID(`selector-list ${simpleLarge}`).should('be.visible')
    cy.getByTestID(`selector-list ${simpleLarge}`).click()

    cy.getByTestID('selector-list m').should('be.visible')
    cy.getByTestID('selector-list m').clickAttached()

    cy.getByTestID('selector-list v').should('be.visible')
    cy.getByTestID('selector-list v').clickAttached()

    cy.getByTestID('selector-list tv1').clickAttached()

    cy.getByTestID('time-machine-submit-button').click()

    cy.getByTestID('raw-data--toggle').click()
    cy.getByTestID('simple-table').should('exist')

    // click last page
    cy.getByTestID('pagination-item')
      .last()
      .should('be.visible')
    cy.getByTestID('pagination-item')
      .last()
      .click()
    // verify correct number of pages
    cy.getByTestID('pagination-item')
      .last()
      .contains('100')

    // show raw data view of data with 10 pages
    cy.getByTestID(`selector-list ${simpleSmall}`).should('be.visible')
    cy.getByTestID(`selector-list ${simpleSmall}`).click()

    cy.getByTestID('selector-list m').should('be.visible')
    cy.getByTestID('selector-list m').clickAttached()

    cy.getByTestID('selector-list v').should('be.visible')
    cy.getByTestID('selector-list v').clickAttached()

    cy.getByTestID('selector-list tv1').clickAttached()

    cy.getByTestID('time-machine-submit-button').click()

    // verify table still exists
    cy.getByTestID('simple-table').should('exist')
    // verify page 1 is selected
    cy.getByTestID('pagination-item')
      .first()
      .within(() => {
        cy.getByTestID('button').should(
          'have.class',
          'cf-button cf-button-md cf-button-tertiary cf-button-square active'
        )
      })
    // verify correct number of pages
    cy.getByTestID('pagination-item')
      .last()
      .should('be.visible')
    cy.getByTestID('pagination-item')
      .last()
      .contains('10')
  })
})
