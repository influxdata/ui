import {Organization} from '../../../src/types'
import {set} from '../../../src/shared/utils/featureFlag'

describe('Home Page Tests', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(() => {
        cy.getByTestID('home-page--header').should('be.visible')
        set('alertsActivity', true)
        set('notebooks', true)
      })
    })
  })

  it('should load empty Alerts Activity dashboard', () => {
    cy.getByTestID('alerts-activity')
      .scrollIntoView()
      .should('be.visible')
    cy.getByTestID('alerts-activity-table-container')
      .find('.event-row')
      .should('have.length', 0)
  })

  it('should populate and load populated Alerts Activity dashboard', () => {
    cy.getByTestID('alerts-activity')
      .scrollIntoView()
      .should('be.visible')
    cy.getByTestID('alerts-activity-table-container')
      .find('.event-row')
      .should('have.length', 0)

    createChecks()
    exportMockAlertsActivity()

    // Random amount of wait for the export data to be available on home page
    cy.wait(1000)

    cy.visit('/')
    cy.getByTestID('alerts-activity')
      .scrollIntoView()
      .should('be.visible')
    cy.getByTestID('alerts-activity-table-container')
      .find('.event-row')
      .should('have.length.gte', 2)
  })
})

const exportMockAlertsActivity = () => {
  const script1 = `import "influxdata/influxdb/v1{rightArrow}
import "influxdata/influxdb/monitor{rightArrow}

from(bucket: "_tasks"{rightArrow}
  |> range(start: -1d{rightArrow}
|> v1.fieldsAsCols()
|> distinct(column: "name"{rightArrow}
|> keep(columns: ["_value", "taskID", "status"{rightArrow}{rightArrow}
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
  cy.wait(0)
  cy.getByTestID('flows-delete-cell')
    .first()
    .click({force: true})
  cy.wait(0)
  cy.getByTestID('flows-delete-cell')
    .first()
    .click({force: true})
  cy.wait(0)
  cy.getByTestID('flows-delete-cell')
    .first()
    .click({force: true})

  // Name this Notebook
  cy.getByTestID('page-title').click()
  cy.getByTestID('renamable-page-title--input')
    .clear()
    .type('Notebook1')

  // Click on main page add button
  // Add 1st Cell
  cy.getByTestID('add-flow-btn--rawFluxEditor').click()
  cy.focused()

  cy.getByTestID('flux-editor')
    .scrollIntoView()
    .focused()
    .type(Cypress.platform === 'darwin' ? '{cmd}a' : '{ctrl}a')
    .type(script1)

  // Add 2nd Cell
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

  // FIXME: Temporary wait until we figure out a better solution
  cy.wait(2000)
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
