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
    cy.getByTestID('measurement-selector test').click()

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

    cy.getByTestID('time-machine-submit-button').should('be.visible')
    cy.getByTestID('page-title').click()
    cy.getByTestID('renamable-page-title--input').type('My Flow {enter}')

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

  it('can execute preview, see results, change tags, execute preview, see different results', () => {
    const newBucketName = 'lets goooo'
    const now = Date.now()
    cy.get<Organization>('@org').then(({id, name}: Organization) => {
      cy.createBucket(id, name, newBucketName)
    })
    cy.writeData(
      [
        `test,container_name=cool dopeness=12 ${now - 1000}000000`,
        `test,container_name=beans dopeness=18 ${now - 1200}000000`,
        `test,container_name=cool dopeness=14 ${now - 1400}000000`,
        `test,container_name=beans dopeness=10 ${now - 1600}000000`,
      ],
      newBucketName
    )

    cy.getByTestID('create-flow--button')
      .first()
      .click()
    cy.getByTestID('time-machine-submit-button').should('be.visible')

    cy.getByTestID('page-title').click()
    cy.getByTestID('renamable-page-title--input').type('My Flow {enter}')

    // select our bucket
    cy.getByTestID('flow-bucket-selector').click()

    cy.getByTestID(`flow-bucket-selector--${newBucketName}`).click()

    // select measurement and field
    cy.getByTestID('measurement-selector test').click()
    cy.getByTestID('field-selector dopeness').click()

    // select beans tag and click preview
    cy.getByTestID('tag-selector beans').click()
    cy.getByTestID('time-machine-submit-button').click()

    // we should only see beans in the table
    cy.getByTestID('table').should('be.visible')
    cy.getByTestID('table-cell beans')
      .first()
      .should('be.visible')
    cy.getByTestID('table-cell cool').should('not.exist')

    // change tag to cool and click preview
    cy.getByTestID('tag-selector cool').click()
    cy.getByTestID('time-machine-submit-button').click()

    // we should only see cool in the table
    cy.getByTestID('table').should('be.visible')
    cy.getByTestID('table-cell cool')
      .first()
      .should('be.visible')
    cy.getByTestID('table-cell beans').should('not.exist')
  })

  it.only('can export a task with all the necessary variables', () => {
    const taskName = 'the greatest task of all time'

    cy.getByTestID('create-flow--button')
      .first()
      .click()

    cy.getByTestID('time-machine-submit-button').should('be.visible')

    cy.getByTestID('page-title').click()
    cy.getByTestID('renamable-page-title--input').type('My Flow {enter}')

    // Have to get the second add button or we clobber the metric selector - JF
    cy.getByTestIDSubStr('panel-add-btn')
      .first()
      .next() // adding
      .click()

    cy.getByTestID('add-flow-btn--toBucket').click()

    cy.getByTestID('flow-bucket-selector')
      .last()
      .click()

    cy.getByTestID('flow-bucket-selector--defbuck').click()

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
