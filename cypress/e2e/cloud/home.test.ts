import {Organization} from '../../../src/types'

describe('Home Page Tests', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(() => {
        cy.getByTestID('home-page--header').should('be.visible')
        cy.window().then(w => {
          w.influx.set('alertsStatuses', true)
          w.influx.set('notebooks', true)
        })

        cy.wait(1000)
      })
    })
  })

  it('should load empty Alerts Statuses dashboard', () => {
    cy.getByTestID('alerts-statuses')
      .scrollIntoView()
      .should('be.visible')
    cy.getByTestID('alerts-statuses-table-container')
      .find('.event-row')
      .should('have.length', 0)
  })

  it('should populate and load populated Alerts Statuses dashboard', () => {
    cy.getByTestID('alerts-statuses')
      .scrollIntoView()
      .should('be.visible')
    cy.getByTestID('alerts-statuses-table-container')
      .find('.event-row')
      .should('have.length', 0)

    createChecks()
    exportMockAlertsStatuses()

    cy.visit('/')
    cy.getByTestID('alerts-statuses-table-container')
      .find('.event-row')
      .should('have.length', 2)
  })
})

const exportMockAlertsStatuses = () => {
  const script1 = `import "influxdata/influxdb/v1"
import "influxdata/influxdb/monitor"

from(bucket: "_tasks")
  |> range(start: -1d)
|> v1.fieldsAsCols()
|> distinct(column: "name")
|> keep(columns: ["_value", "taskID", "status"])
|> rename(columns: {
  "taskID": "_check_id"{del}{del}
})
{leftarrow}{leftarrow}{del}{del}|> map(fn: (r) => ({r with
  _field: "_message",_measurement: "statuses",_time: now(),_check_name: r._value,_level: (if r._value == "Alpha" then "ok" else "crit"){del}{del}{del}
{backspace}}))`

  // Go to Notebooks page
  cy.getByTestID('nav-item-flows').click()
  cy.getByTestID('create-flow--button')
    .first()
    .click()
  cy.getByTestID('flows-delete-cell')
    .first()
    .click()
  cy.getByTestID('flows-delete-cell')
    .first()
    .click()
  cy.getByTestID('flows-delete-cell')
    .first()
    .click()

  // Name this Notebook
  cy.getByTestID('page-title').click()
  cy.getByTestID('renamable-page-title--input')
    .clear()
    .type('Notebook1')

  // Click on main page add button
  // Add 1st Cell
  cy.getByTestID('add-flow-btn--rawFluxEditor').click()
  cy.getByTestID('flux-editor').type(script1)

  // Add 2rd Cell
  cy.getByTestID('panel-add-btn-0').click()
  cy.getByTestID('add-flow-btn--toBucket').click()
  cy.getByTestID('flow-bucket-selector').click()
  cy.getByTestID('flow-bucket-selector--_monitoring').click()

  // Change Dropdown from Preview to Run
  cy.getByTestID('square-button')
    .first()
    .click()
  cy.getByTestID('flow-run-button').click()

  // Run the Notebook
  cy.getByTestID('time-machine-submit-button').click()
}

const createChecks = () => {
  const PAGE_LOAD_SLA = 10000

  const measurement = 'my_meas'
  const field = 'my_field'
  const stringField = 'string_field'

  cy.get('@org').then(({id: orgID}: Organization) => {
    cy.writeData([
      `${measurement} ${field}=0,${stringField}="string1"`,
      `${measurement} ${field}=1,${stringField}="string2"`,
    ])
    cy.fixture('routes').then(({orgs, alerting}) => {
      cy.visit(`${orgs}/${orgID}${alerting}`)
      cy.getByTestID('tree-nav')
    })
  })

  cy.get('[data-testid="resource-list--body"]', {timeout: PAGE_LOAD_SLA})

  // User can only see all panels at once on large screens
  cy.getByTestID('alerting-tab--checks').click({force: true})

  cy.get<string>('@defaultBucketListSelector').then(
    (defaultBucketListSelector: string) => {
      cy.log('create first check')
      createCheck(defaultBucketListSelector, measurement, field)

      createDeadmanCheck(defaultBucketListSelector, measurement, field)
    }
  )
}

const createDeadmanCheck = (
  defaultBucketListSelector: string,
  measurement: string,
  field: string
) => {
  cy.log('create second check')
  cy.getByTestID('create-check').click()
  cy.getByTestID('create-deadman-check').click()

  cy.log('select measurement and field')
  cy.getByTestID(defaultBucketListSelector).should('be.visible')
  cy.getByTestID(defaultBucketListSelector).click()
  cy.wait('@measurementQueryBeta')
  cy.getByTestID(`selector-list ${measurement}`).should('be.visible')
  cy.getByTestID(`selector-list ${measurement}`).click()
  cy.wait('@fieldQueryBeta')
  cy.getByTestID(`selector-list ${field}`).should('be.visible')
  cy.getByTestID(`selector-list ${field}`).click()

  cy.log('name the check; save')
  cy.getByTestID('overlay').within(() => {
    cy.getByTestID('page-title')
      .contains('Name this Check')
      .click()
    cy.getByTestID('renamable-page-title--input')
      .clear()
      .type('Beta{enter}')
  })
  cy.getByTestID('save-cell--button').click()

  cy.log('assert the number of check cards')
  cy.getByTestID('check-card').should('have.length', 2)
}

const createCheck = (
  defaultBucketListSelector: string,
  measurement: string,
  field: string
) => {
  cy.getByTestID('create-check').click()
  cy.getByTestID('create-threshold-check').click()

  cy.log('select measurement and field')
  cy.intercept('POST', '/query', req => {
    if (req.body.query.includes('_measurement')) {
      req.alias = 'measurementQuery'
    }
  })
  cy.intercept('POST', '/query', req => {
    if (req.body.query.includes('distinct(column: "_field")')) {
      req.alias = 'fieldQuery'
    }
  })

  cy.getByTestID(defaultBucketListSelector).click()
  cy.wait('@measurementQuery')
  cy.getByTestID(`selector-list ${measurement}`).should('be.visible')
  cy.getByTestID(`selector-list ${measurement}`).click()
  cy.wait('@fieldQuery')
  cy.getByTestID(`selector-list ${field}`).should('be.visible')
  cy.getByTestID(`selector-list ${field}`).click()

  cy.log('name the check; save')
  cy.getByTestID('overlay').within(() => {
    cy.getByTestID('page-title')
      .contains('Name this Check')
      .click()
    cy.getByTestID('renamable-page-title--input')
      .clear()
      .type('Alpha{enter}')
  })
  cy.getByTestID('checkeo--header alerting-tab').click()
  cy.getByTestID('schedule-check')
    .clear()
    .type('2s')
  cy.getByTestID('add-threshold-condition-CRIT').click()
  cy.getByTestID('save-cell--button').click()

  cy.getByTestID('overlay').should('not.exist')
  // bust the /query cache
  cy.reload()
  cy.intercept('POST', '/query', req => {
    if (req.body.query.includes('_measurement')) {
      req.alias = 'measurementQueryBeta'
    }
  })
  cy.intercept('POST', '/query', req => {
    if (req.body.query.includes('distinct(column: "_field")')) {
      req.alias = 'fieldQueryBeta'
    }
  })
}
