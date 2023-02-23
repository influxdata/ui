import {Organization} from '../../../src/types'

// Chains of actions that involve hovering like below
// cy.getByTestID('task-card')
//      .trigger('mouseover')
//      .then(()
// will pass without this. However, the chain of actions
// implemented here replicates what would realistically occur.

const isIOxOrg = Boolean(Cypress.env('useIox'))
const isTSMOrg = !isIOxOrg

// shouldShowTasks determines whether the flag for 'forcing'
// the display of tasks in iox orgs should be enabled.
const setupTest = (shouldShowTasks: boolean = true) => {
  cy.flush()
  cy.signin()

  cy.setFeatureFlags({showTasksInNewIOx: shouldShowTasks})

  cy.get<Organization>('@org')
    .then(({id: orgID}: Organization) => {
      cy.createToken(orgID, 'test token', 'active', [
        {action: 'write', resource: {type: 'views', orgID}},
        {action: 'write', resource: {type: 'documents', orgID}},
        {action: 'write', resource: {type: 'tasks', orgID}},
      ]).then(({body}) => {
        cy.wrap(body.token).as('token')
      })
    })
    .then(() => {
      cy.fixture('routes').then(({orgs}) => {
        cy.get<Organization>('@org').then(({id}: Organization) => {
          cy.getByTestID('tree-nav').should('be.visible')
          // Tasks link should appear in nav in TSM orgs.
          if (isTSMOrg) {
            cy.getByTestID('nav-item-tasks').should('be.visible').click()
          } else {
            cy.visit(`${orgs}/${id}/tasks`)
          }
        })
      })
    })
}

// Flaky test https://github.com/influxdata/ui/issues/6609
describe('Tasks - IOx', () => {
  it('New IOx orgs do not have Tasks', () => {
    cy.skipOn(isTSMOrg)
    const shouldShowTasks = false

    setupTest(shouldShowTasks)
    cy.getByTestID('nav-item-tasks').should('not.exist')
    cy.contains('404: Page Not Found')
  })
})

describe('Tasks - TSM', () => {
  beforeEach(() => {
    setupTest()
  })

  it('can create a task', () => {
    const taskName = 'Task'
    cy.createTaskFromEmpty(taskName, ({name}) => {
      return `import "influxdata/influxdb/v1"
  v1.tagValues(bucket: "${name}", tag: "_field")
  from(bucket: "${name}")
     |> range(start: -2m)`
    })

    cy.getByTestID('task-save-btn').click()

    cy.getByTestID('notification-success--dismiss').click()

    cy.getByTestID('task-card')
      .should('have.length', 1)
      .and('contain', taskName)
  })

  it('can create a task using http.post', () => {
    const taskName = 'Task'
    cy.createTaskFromEmpty(taskName, () => {
      return `import "http" {enter}
  http.post(url: "https://foo.bar/baz", data: bytes(v: "body"))`
    })

    cy.getByTestID('task-save-btn').click()

    cy.getByTestID('task-card')
      .should('have.length', 1)
      .and('contain', taskName)
  })

  it('can create a cron task', () => {
    const taskName = 'Cron task test'

    cy.createTaskFromEmpty(taskName, ({name}) => {
      return `from(bucket: "${name}")
     |> range(start: -2m)`
    })

    cy.getByTestID('task-card-cron-btn').click()
    cy.getByTestID('task-form-schedule-input')
      .click()
      .clear()
      .type('0 4 8-14 * *')
    cy.getByTestID('task-form-offset-input').click().clear().type('10m')
    cy.getByTestID('task-form-offset-input').should('have.value', '10m')

    cy.getByTestID('task-save-btn').click()

    cy.getByTestID('task-card')
      .contains('Cron task test')
      .get('.cf-resource-meta--item')
      .contains('Scheduled to run 0 4 8-14 * *')

    cy.getByTestID('task-card').then(() => {
      cy.getByTestID('context-menu-task').click()
      cy.getByTestID('context-edit-task').click()
    })

    cy.getByTestID('task-form-schedule-input').should(
      'have.value',
      '0 4 8-14 * *'
    )
  })

  it('can create a task with an option parameter', () => {
    cy.getByTestID('add-resource-dropdown--button').click()
    cy.getByTestID('add-resource-dropdown--new').click()

    cy.focused()

    cy.getByTestID('flux-editor').monacoType(`option task = {
    name: "Option Test",
    every: 24h,
    offset: 20m
  }
  from(bucket: "defbuck")
    |> range(start: -2m)`)

    cy.getByTestID('task-form-name')
      .click()
      .type('Option Test')
      .then(() => {
        cy.getByTestID('task-form-schedule-input').click().clear().type('24h')
        cy.getByTestID('task-form-offset-input').click().clear().type('20m')
      })

    cy.getByTestID('task-save-btn').click()
    cy.getByTestID('notification-success').should('exist')
  })
})
