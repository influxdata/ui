import {Organization} from '../../src/types'

describe('Subscriptions', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.get('@org').then(({id}: Organization) =>
      cy.fixture('routes').then(({orgs}) => {
        cy.visit(`${orgs}/${id}`)
      })
    )
    cy.getByTestID('version-info')
    cy.getByTestID('nav-item-flows').should('be.visible')
    cy.getByTestID('nav-item-flows').click()
  })

  it('C a subscription from the index page', () => {
    const now = Date.now()
    cy.writeData(
      [
        `test,container_name=cool dopeness=12 ${now - 1000}000000`,
        `test,container_name=beans dopeness=18 ${now - 1200}000000`,
        `test,container_name=cool dopeness=14 ${now - 1400}000000`,
        `test,container_name=beans dopeness=10 ${now - 1600}000000`,
      ],
      'defbuck'
    )
    cy.getByTestID('preset-new')
      .first()
      .click()

    cy.getByTestID('time-machine-submit-button').should('be.visible')

    cy.getByTestID('page-title')
      .first()
      .click()
    cy.getByTestID('renamable-page-title--input').type('My Flow {enter}')

    cy.getByTestID('sidebar-button')
      .first()
      .click()
    cy.getByTestID('Delete--list-item').click()

    cy.getByTestID('panel-add-btn--1').click()
    cy.getByTestID('add-flow-btn--queryBuilder').click()
    cy.getByTestID('selector-list defbuck')
      .first()
      .click()
    cy.getByTestID('selector-list test')
      .first()
      .click()

    cy.getByTestID('time-machine-submit-button').click()

    cy.getByTestID('panel-add-btn-1').click()

    cy.getByTestID('add-flow-btn--visualization').click()
  })
})
