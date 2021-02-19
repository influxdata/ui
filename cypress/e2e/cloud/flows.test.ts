import {Organization} from '../../src/types'

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

    cy.getByTestID('time-machine-submit-button').should('be.visible')

    cy.getByTestID('page-title').click()
    cy.getByTestID('renamable-page-title--input').type('My Flow {enter}')

    cy.getByTestID('panel-add-btn-0').click()

    cy.getByTestID('add-flow-btn--visualization').click()

    cy.getByTestID('flows-delete-cell')
      .eq(1)
      .click()

    cy.getByTestID('flow-bucket-selector').click()
    cy.getByTestID('flow-bucket-selector--defbuck').click()

    cy.getByTestID('time-machine-submit-button').click()

    cy.getByTestID('panel-add-btn-0').click()

    cy.getByTestID('add-flow-btn--visualization').click()

    cy.getByTestID('slide-toggle').click()

    cy.get('.flow-panel--header')
      .eq(0)
      .click()

    // test for presentation mode state

    cy.getByTestID('slide-toggle').click()
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

  it('can export a task with all the neccesary variables', () => {
    const taskName = 'the greatest task of all time'

    cy.getByTestID('create-flow--button')
      .first()
      .click()

    cy.getByTestIDSubStr('panel-add-btn')
      .first()
      .click()
      .then(() => {
        cy.getByTestID('add-flow-btn--toBucket').click()
      })

    cy.getByTestID('flow-bucket-selector')
      .last()
      .click()
      .then(() => {
        cy.getByTestID('flow-bucket-selector--defbuck').click()
      })

    cy.getByTestID('task-form-save').click()
    cy.getByTestID('task-form-name').type(taskName)
    cy.getByTestID('task-form-schedule-input').type('24h')
    cy.getByTestID('task-form-export').click()

    cy.getByTestID('notification-success').should('be.visible')

    cy.getByTestID('nav-item-tasks').click()
    cy.contains(taskName).click()

    cy.contains('timeRangeStart').should('be.visible')
    cy.contains('timeRangeStop').should('be.visible')
    cy.contains('windowPeriod').should('be.visible')
    cy.contains('name').should('be.visible')
    cy.contains('every').should('be.visible')
    cy.contains('offset').should('be.visible')
  })
})
