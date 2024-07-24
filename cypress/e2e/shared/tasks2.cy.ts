import {Organization} from '../../../src/types'

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
      cy.fixture('routes').then(() => {
        cy.get<Organization>('@org').then(() => {
          cy.getByTestID('tree-nav').should('be.visible')
          // Tasks link should appear in nav in TSM orgs.
          cy.getByTestID('nav-item-tasks').should('be.visible').click()
        })
      })
    })
}

// No need to separately test "cant get to tasks in new iox orgs",
// as that is already tested in tasks.test.ts.
describe('Tasks - Part 2', () => {
  beforeEach(() => {
    setupTest()
  })

  describe('update & persist data', () => {
    // address a bug that was reported when editing tasks:
    // https://github.com/influxdata/influxdb/issues/15534
    const taskName = 'Task'
    const interval = '12h'
    const offset = '30m'
    beforeEach(() => {
      cy.createTaskFromEmpty(
        taskName,
        ({name}) => {
          return `import "influxdata/influxdb/v1"
    v1.tagValues(bucket: "${name}", tag: "_field")
    from(bucket: "${name}")
      |> range(start: -2m)`
        },
        interval,
        offset
      )
      cy.getByTestID('task-save-btn').should('be.visible').click()
      cy.getByTestID('task-card')
        .should('have.length', 1)
        .and('contain', taskName)

      cy.getByTestID('task-card--name').contains(taskName)

      cy.getByTestID('task-card')
        .should('be.visible')
        .then(() => {
          cy.getByTestID('context-menu-task').should('be.visible').click()
          cy.getByTestID('context-edit-task').should('be.visible').click()
        })
      // verify that the previously input data exists
      cy.getByInputValue(taskName)
      cy.getByInputValue(interval)
      cy.getByInputValue(offset)
    })

    it('can update a task', () => {
      const newTask = 'Taskr[sic]'
      const newInterval = '24h'
      const newOffset = '7h'
      // updates the data
      cy.getByTestIDAndSetInputValue('task-form-name', newTask)
      cy.getByTestIDAndSetInputValue('task-form-schedule-input', newInterval)
      cy.getByTestIDAndSetInputValue('task-form-offset-input', newOffset)

      cy.getByTestID('task-save-btn').should('be.visible').click()
      // checks to see if the data has been updated once saved
      cy.getByTestID('task-card--name').should('be.visible').contains(newTask)
    })

    it('persists data when toggling between scheduling tasks', () => {
      // toggles schedule task from every to cron
      cy.getByTestID('task-card-cron-btn').should('be.visible').click()

      // checks to see if the cron helper text exists
      cy.getByTestID('form--box').should('have.length', 1)

      const cronInput = '0 2 * * *'
      // checks to see if the cron data is set to the initial value
      cy.getByInputValue('')
      cy.getByInputValue(offset)

      cy.getByTestID('task-form-schedule-input').type(cronInput)
      // toggles schedule task back to every from cron
      cy.getByTestID('task-card-every-btn').should('be.visible').click()
      // checks to see if the initial interval data for every persists
      cy.getByInputValue(interval)
      cy.getByInputValue(offset)
      // toggles back to cron from every
      cy.getByTestID('task-card-cron-btn').should('be.visible').click()
      // checks to see if the cron data persists
      cy.getByInputValue(cronInput)
      cy.getByInputValue(offset)
      cy.getByTestID('task-save-btn').should('be.visible').click()
    })

    it('will not permit invalid flux to update task', () => {
      cy.getByTestID('flux-editor').monacoType(
        `{selectAll}{rightArrow}{enter} foo`
      )
      cy.getByTestID('task-save-btn').should('be.visible').click()

      cy.log('error notification will appear')
      cy.getByTestID('notification-error--dismiss').should('be.visible')
      cy.log('task editor will remain open')
      cy.getByInputValue(taskName)
      cy.getByTestID('flux-editor').should('be.visible').click()
    })
  })

  describe('renders the correct name when toggling between tasks', () => {
    // addresses an issue that was reported when clicking tasks
    // this issue could not be reproduced manually | testing:
    // https://github.com/influxdata/influxdb/issues/15552
    const firstTask = 'First_Task'
    const secondTask = 'Second_Task'

    const firstIndex = 0
    const secondIndex = 1
    beforeEach(() => {
      cy.get<Organization>('@org').then(({id}: Organization) => {
        cy.get<string>('@token').then(token => {
          cy.createTask(token, id, firstTask)
          cy.createTask(token, id, secondTask)
        })
      })

      cy.fixture('routes').then(({orgs}) => {
        cy.get<Organization>('@org').then(({id}: Organization) => {
          cy.visit(`${orgs}/${id}/tasks`)
          cy.getByTestID('tree-nav')
        })
      })
    })

    it('when navigating using the navbar', () => {
      // click on the second task
      cy.getByTestID('task-card--name').contains(secondTask)

      cy.getByTestID('task-card')
        .eq(secondIndex)
        .then(() => {
          cy.getByTestID('context-menu-task')
            .eq(secondIndex)
            .should('be.visible')
            .click()
          cy.getByTestID('context-edit-task').should('be.visible').click()
        })
      // verify that it is the correct data
      cy.getByInputValue(secondTask)

      cy.get('.cf-tree-nav--item__active').within(() => {
        // Get the element that has a click handler within the nav item
        cy.get('.cf-tree-nav--item-block').should('be.visible').click()
      })
      // navigate back to the first one to verify that the name is correct
      cy.getByTestID('task-card--name').contains(firstTask)

      cy.getByTestID('task-card')
        .eq(firstIndex)
        .then(() => {
          cy.getByTestID('context-menu-task')
            .eq(firstIndex)
            .should('be.visible')
            .click()
          cy.getByTestID('context-edit-task').should('be.visible').click()
        })
      // verify that it is the correct data
      cy.getByInputValue(firstTask)
    })

    it('when navigating using the cancel button', () => {
      // click on the second task
      cy.getByTestID('task-card--name').contains(secondTask)

      cy.getByTestID('task-card')
        .eq(secondIndex)
        .then(() => {
          cy.getByTestID('context-menu-task')
            .eq(secondIndex)
            .should('be.visible')
            .click()
          cy.getByTestID('context-edit-task').should('be.visible').click()
        })

      // verify that it is the correct data
      cy.getByInputValue(secondTask)
      cy.getByTestID('task-cancel-btn').should('be.visible').click()

      // navigate back to the first task again
      cy.getByTestID('task-card--name').contains(firstTask)

      cy.getByTestID('task-card')
        .eq(firstIndex)
        .then(() => {
          cy.getByTestID('context-menu-task')
            .eq(firstIndex)
            .should('be.visible')
            .click()
          cy.getByTestID('context-edit-task').should('be.visible').click()
        })
      // verify that it is the correct data
      cy.getByInputValue(firstTask)
      cy.getByTestID('task-cancel-btn').should('be.visible').click()
    })

    it('when navigating using the save button', () => {
      // click on the second task
      cy.getByTestID('task-card--name').contains(secondTask)

      cy.getByTestID('task-card')
        .eq(secondIndex)
        .then(() => {
          cy.getByTestID('context-menu-task')
            .eq(secondIndex)
            .should('be.visible')
            .click()
          cy.getByTestID('context-edit-task').should('be.visible').click()
        })
      // verify that it is the correct data
      cy.getByInputValue(secondTask)
      cy.getByTestID('task-save-btn').should('be.visible').click()

      // navigate back to the first task again
      cy.getByTestID('task-card--name').contains(firstTask)

      cy.getByTestID('task-card')
        .eq(firstIndex)
        .then(() => {
          cy.getByTestID('context-menu-task')
            .eq(firstIndex)
            .should('be.visible')
            .click()
          cy.getByTestID('context-edit-task').should('be.visible').click()
        })
      // verify that it is the correct data
      cy.getByInputValue(firstTask)
      cy.getByTestID('task-save-btn').should('be.visible').click()
    })

    it('should persist search term across pages', () => {
      cy.getByTestID('search-widget').should('have.value', '')

      const tasks = [
        {
          name: 'task1',
          every: '3h30s',
          offset: '20m',
          query: `buckets()`,
        },
        {
          name: 'task2',
          every: '3h',
          offset: '30m',
          query: `buckets()`,
        },
      ]

      tasks.forEach(task => {
        cy.getByTestID('add-resource-dropdown--button')
          .should('be.visible')
          .click()
        cy.getByTestID('add-resource-dropdown--new')
          .should('be.visible')
          .click()

        // Fill Task Form
        // focused() waits for monoco editor to get input focus
        // If this isn't present then cypress shifts focus on elements
        // making it seem randomly jumping to elements
        cy.focused()

        cy.getByTestID('flux-editor').monacoType(task.query)
        cy.getByTestIDAndSetInputValue('task-form-name', task.name)
        cy.getByTestIDAndSetInputValue('task-form-schedule-input', task.every)
        cy.getByTestIDAndSetInputValue('task-form-offset-input', task.offset)

        // Save Task
        cy.getByTestID('task-save-btn').should('be.visible').click()
      })

      tasks.forEach(task => {
        // Search for a task
        const name = task.name.slice(-4)
        cy.getByTestIDAndSetInputValue('search-widget', name)
        cy.getByTestID('resource-list--body')
          .children()
          .should('have.length', 1)
        cy.getByTestID('resource-list--body')
          .children()
          .getByTestID('task-card--name')
          .should('be.visible')
          .click()

        // Navigate away from current page back to Tasks List page
        cy.get('.bread-crumb-title').first().click()
        cy.getByTestID('search-widget').should('have.value', name)

        // Validate that the list has correct search results
        cy.getByTestID('resource-list--body')
          .children()
          .should('have.length', 1)
        cy.getByTestID('resource-list--body')
          .children()
          .getByTestID('task-card--name')
          .contains(task.name)
      })

      // Test the browser Back click navigation condition
      tasks.forEach(task => {
        // Search for a task
        const name = task.name.slice(-4)
        cy.getByTestIDAndSetInputValue('search-widget', name)
        cy.getByTestID('resource-list--body')
          .children()
          .should('have.length', 1)
        cy.getByTestID('resource-list--body')
          .children()
          .getByTestID('task-card--name')
          .should('be.visible')
          .click()

        // Navigate away from current page back to Tasks List page
        cy.go('back')
        cy.getByTestID('search-widget').should('have.value', name)

        // Validate that the list has correct search results
        cy.getByTestID('resource-list--body')
          .children()
          .should('have.length', 1)
        cy.getByTestID('resource-list--body')
          .children()
          .getByTestID('task-card--name')
          .contains(task.name)
      })
    })
  })
})
