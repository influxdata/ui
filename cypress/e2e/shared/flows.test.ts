import {Organization} from '../../src/types'
import {lines} from '../../support/commands'

describe('Flows', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) =>
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${id}`)
          cy.getByTestID('tree-nav')

          cy.window().then(win => {
            win.influx.set('notebooks', true)
          })

          cy.getByTestID('nav-item-flows').click()
        })
      )
    })
  })

  it('CRUD a flow from the index page', () => {
    cy.getByTestID('create-flow--button')
      .first()
      .click()

    // ensure that the page has navigated
    cy.getByTestID('notebook-submit-button')
    cy.getByTestID('page-title').click()
    cy.getByTestID('renamable-page-title--input').type('My Flow {enter}')

    cy.getByTestID('panel-add-btn-0').click()

    cy.getByTestID('add-flow-btn--visualization').click()

    cy.getByTestID('flows-delete-cell')
      .eq(1)
      .click()

    cy.getByTestID('notebook-submit-button').click()

    cy.getByTestID('panel-add-btn-0').click()

    cy.getByTestID('add-flow-btn--visualization').click()

    cy.getByTestID('slide-toggle').click()

    cy.get('.flow-panel--header')
      .eq(0)
      .click()

    // test for presentation mode state

    cy.getByTestID('slide-toggle').click()
  })

  it.only('Happy path - flow', () => {
    // make a notebook
    cy.getByTestID('create-flow--button')
      .first()
      .click()

    // ensure that the page has navigated
      // and that the submit button is disabled
    cy.getByTestID('time-machine-submit-button')
    .should('be.disabled')

    cy.writeData(lines(10))

    cy.getByTestID('flow-bucket-selector')
      .click()

    cy.getByTestID('flow-bucket-selector--defbuck').click()

    cy.getByTestID('time-machine-submit-button')
    .should('not.be.disabled')

    cy.getByTestID('schema-fields-list')
      .within(() => {
        cy.getByTestID('list-item').should('have.length', 3)
        cy.contains('tk1').should('exist')
      })

    cy.getByTestID('schema-filter-input')
    .type('m')

    cy.getByTestID('schema-fields-list')
      .within(() => {
        cy.getByTestID('list-item').should('have.length', 1)
        cy.contains('measurement').should('exist')
        cy.getByTestID('list-item')
          .eq(0)
          .click()
      })
    cy.getByTestID('schema-filter-input')
      .clear()
    cy.getByTestID('schema-fields-list')
      .within(() => {
        cy.getByTestID('list-item').should('have.length', 3)
        cy.contains('tk1').should('exist')
      })

    cy.getByTestID('selected-filter--m measurement = m')
      .should('exist')
      cy.getByTestID('selected-filter--m--delete measurement = m')
      .click({ force: true })
    cy.getByTestID('selected-filters-list')
      .within(() => {
        cy.get('.cf-label').should('have.length', 0)
      })

    cy.getByTestID('time-machine-submit-button')
      .click()

    cy.getByTestID('time-machine-submit-button')
    .should('have.class', 'cf-button--loading')
    .should('not.have.class', 'cf-button--loading')
  })

  it('can create a bucket from the metric selector and verify it is selected', () => {
    const newBucketName = 'IDontGiveABuck'
    cy.getByTestID('create-flow--button')
      .first()
      .click()

    cy.getByTestID('flow-bucket-selector')
      .click()
      .then(() => {
        cy.getByTestID('flow-bucket-selector--create').click()
      })

    cy.getByTestID('overlay').should('exist')

    cy.getByTestID('bucket-form-name').type(newBucketName)
    cy.getByTestID('bucket-form-submit')
      .click()
      .then(() => {
        cy.getByTestID('flow-bucket-selector').within(() => {
          cy.contains(newBucketName).should('exist')
        })
      })
  })
})
