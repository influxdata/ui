import {Organization} from '../../../src/types'

// Chains of actions that involve hovering like below
// cy.getByTestID('task-card')
//      .trigger('mouseover')
//      .then(()
// will pass without this. However, the chain of actions
// implemented here replicates what would realistically occur.

describe('Tasks', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get<Organization>('@org').then(({id: orgID}: Organization) =>
        cy
          .createToken(orgID, 'test token', 'active', [
            {action: 'write', resource: {type: 'views', orgID}},
            {action: 'write', resource: {type: 'documents', orgID}},
            {action: 'write', resource: {type: 'tasks', orgID}},
          ])
          .then(({body}) => {
            cy.wrap(body.token).as('token')
          })
      )
    })

    cy.fixture('routes').then(({orgs}) => {
      cy.get<Organization>('@org').then(({id}: Organization) => {
        cy.visit(`${orgs}/${id}/tasks`)
        cy.getByTestID('tree-nav')
      })
    })
  })

  it('can create a task', () => {
    const taskName = 'Task'
    cy.createTaskFromEmpty(taskName, ({name}) => {
      return `import "influxdata/influxdb/v1{rightarrow}
v1.tagValues(bucket: "${name}", tag: "_field"{rightarrow}
from(bucket: "${name}"{rightarrow}
   |> range(start: -2m{rightarrow}`
    })

    cy.getByTestID('task-save-btn').click()

    cy.getByTestID('notification-success--dismiss').click()

    cy.getByTestID('task-card')
      .should('have.length', 1)
      .and('contain', taskName)

    // TODO: extend to create a template from JSON
    cy.getByTestID('add-resource-dropdown--button').click()
    cy.getByTestID('add-resource-dropdown--import').click()
    cy.getByTestID('task-import--overlay').within(() => {
      cy.get('.cf-overlay--dismiss').click()
    })
  })

  it('can create a task using http.post', () => {
    const taskName = 'Task'
    cy.createTaskFromEmpty(taskName, () => {
      return `import "http"
http.post(url: "https://foo.bar/baz", data: bytes(v: "body"))`
    })

    cy.getByTestID('task-save-btn').click()

    cy.getByTestID('task-card')
      .should('have.length', 1)
      .and('contain', taskName)
  })

  it('keeps user input in text area when attempting to import invalid JSON', () => {
    cy.getByTestID('page-control-bar').within(() => {
      cy.getByTestID('add-resource-dropdown--button').click()
    })

    cy.getByTestID('add-resource-dropdown--import').click()
    cy.contains('Paste').click()
    cy.getByTestID('import-overlay--textarea')
      .click()
      .type('this is invalid JSON')
    cy.get('button[title*="Import JSON"]').click()
    cy.getByTestID('import-overlay--textarea--error').should('have.length', 1)
    cy.getByTestID('import-overlay--textarea').should($s =>
      expect($s).to.contain('this is invalid JSON')
    )
    cy.getByTestID('import-overlay--textarea').type(
      '{backspace}{backspace}{backspace}{backspace}{backspace}'
    )
    cy.get('button[title*="Import JSON"]').click()
    cy.getByTestID('import-overlay--textarea--error').should('have.length', 1)
    cy.getByTestID('import-overlay--textarea').should($s =>
      expect($s).to.contain('this is invalid')
    )
  })

  it('can create a cron task', () => {
    cy.getByTestID('empty-tasks-list').within(() => {
      cy.getByTestID('add-resource-dropdown--button').click()
    })

    cy.getByTestID('add-resource-dropdown--new').click()

    cy.getByTestID('flux-editor').within(() => {
      cy.get('textarea.inputarea')
        .focus()
        .type('from(bucket: "defbuck")\n' + '\t|> range(start: -2m)', {
          delay: 2,
        })
    })

    cy.getByTestID('task-form-name')
      .click()
      .type('Cron task test')
    cy.getByTestID('task-card-cron-btn').click()
    cy.getByTestID('task-form-schedule-input')
      .click()
      .type('0 4 8-14 * *')
    cy.getByTestID('task-form-offset-input')
      .click()
      .type('10m')

    cy.getByTestID('task-save-btn').click()

    cy.getByTestID('task-card')
      .contains('Cron task test')
      .get('.cf-resource-meta--item')
      .contains('Scheduled to run 0 4 8-14 * *')

    cy.getByTestID('task-card')
      .trigger('mouseover')
      .then(() => {
        cy.getByTestID('context-cog-runs').click()
        cy.getByTestID('context-edit-task').click()
      })

    cy.getByTestID('task-form-schedule-input').should(
      'have.value',
      '0 4 8-14 * *'
    )
  })

  it('can create a task with an option parameter', () => {
    cy.getByTestID('empty-tasks-list').within(() => {
      cy.getByTestID('add-resource-dropdown--button')
        .click()
        .then(() => {
          cy.getByTestID('add-resource-dropdown--new').click()
        })
    })

    cy.focused()

    cy.getByTestID('flux-editor').type(
      'option task = \n' +
        '{\n' +
        'name: "Option Test", \n' +
        'every: 24h, \n' +
        'offset: 20m\n' +
        '}\n' +
        'from(bucket: "defbuck")\n' +
        '\t|> range(start: -2m)'
    )

    cy.getByTestID('task-form-name')
      .click()
      .type('Option Test')
      .then(() => {
        cy.getByTestID('task-form-schedule-input')
          .click()
          .type('24h')
        cy.getByTestID('task-form-offset-input')
          .click()
          .type('20m')
      })

    cy.getByTestID('task-save-btn').click()
    cy.getByTestID('notification-success').should('exist')
  })

  describe('When tasks already exist', () => {
    beforeEach(() => {
      cy.get<Organization>('@org').then(({id}: Organization) => {
        cy.get<string>('@token').then(token => {
          cy.createTask(token, id)
        })
      })
      cy.reload()
    })

    it('can edit a task', () => {
      // Disabling the test
      cy.getByTestID('task-card--slide-toggle')
        .should('have.class', 'active')
        .then(() => {
          cy.getByTestID('task-card--slide-toggle')
            .click()
            .then(() => {
              cy.getByTestID('task-card--slide-toggle').should(
                'not.have.class',
                'active'
              )
            })
        })

      // Editing a name
      const newName = 'Task'

      cy.getByTestID('task-card').then(() => {
        cy.getByTestID('task-card--name')
          .trigger('mouseover')
          .then(() => {
            cy.getByTestID('task-card--name-button')
              .click()
              .then(() => {
                cy.getByTestID('task-card--input')
                  .type(newName)
                  .type('{enter}')
              })

            cy.getByTestID('notification-success').should('exist')
            cy.contains(newName).should('exist')
          })
      })

      // Add a label
      cy.getByTestID('task-card').within(() => {
        cy.getByTestID('inline-labels--add').click()
      })

      const labelName = 'l1'
      cy.getByTestID('inline-labels--popover--contents').type(labelName)
      cy.getByTestID('inline-labels--create-new').click()
      cy.getByTestID('create-label-form--submit').click()

      // Delete the label
      cy.getByTestID(`label--pill--delete ${labelName}`).click({force: true})
      cy.getByTestID('inline-labels--empty').should('exist')
    })

    it('can delete a task', () => {
      cy.getByTestID('task-card')
        .first()
        .trigger('mouseover')
        .then(() => {
          cy.getByTestID('context-delete-menu')
            .click()
            .then(() => {
              cy.getByTestID('context-delete-task')
                .click()
                .then(() => {
                  cy.getByTestID('empty-tasks-list').should('exist')
                })
            })
        })
    })

    it('can clone a task and activate just the cloned one', () => {
      createTask('task1', 'buckets()')

      cy.getByTestID('task-card')
        .eq(1)
        .trigger('mouseover')
        .then(() => {
          cy.get('.context-menu--container')
            .eq(1)
            .click()
          cy.getByTestID('context-menu-item')
            .contains('Clone')
            .click()
        })

      cy.getByTestID('task-card--slide-toggle')
        .eq(0)
        .should('have.class', 'active')
      cy.getByTestID('task-card--slide-toggle')
        .eq(0)
        .click()
      cy.getByTestID('task-card--slide-toggle')
        .eq(0)
        .should('not.have.class', 'active')
      cy.getByTestID('task-card--slide-toggle')
        .eq(1)
        .should('have.class', 'active')
    })

    it('can clone a task and edit it', () => {
      // clone a task
      cy.getByTestID('task-card')
        .trigger('mouseover')
        .then(() => {
          cy.get('.context-menu--container')
            .eq(1)
            .click()
          cy.getByTestID('context-menu-item')
            .contains('Clone')
            .click()
        })

      cy.getByTestID('task-card').should('have.length', 2)

      // assert the values of the task and change them
      cy.getByTestID('task-card--name')
        .eq(1)
        .contains('🦄ask (clone 1)')

      cy.getByTestID('task-card')
        .eq(1)
        .trigger('mouseover')
        .then(() => {
          cy.getByTestID('context-cog-runs')
            .eq(1)
            .click()
          cy.getByTestID('context-edit-task')
            .eq(1)
            .click()
        })

      // focused() waits for monoco editor to get input focus
      cy.focused()
      cy.getByTestID('flux-editor')
        .should('be.visible')
        .contains('option task = {')

      cy.getByTestID('task-form-name').should('have.value', '🦄ask (clone 1)')
      cy.getByTestID('task-form-name')
        .clear()
        .type('Copy task test')
      cy.getByTestID('task-form-name').should('have.value', 'Copy task test')

      cy.getByTestID('task-form-schedule-input').should('have.value', '24h')
      cy.getByTestID('task-form-schedule-input')
        .clear()
        .type('12h')
      cy.getByTestID('task-form-schedule-input').should('have.value', '12h')

      cy.getByTestID('task-form-offset-input').should('have.value', '20m')
      cy.getByTestID('task-form-offset-input')
        .clear()
        .type('10m')
      cy.getByTestID('task-form-offset-input').should('have.value', '10m')

      cy.getByTestID('task-save-btn').click()

      // assert changed task name
      cy.getByTestID('task-card--name').contains('Copy task test')
    })

    // skip until this issue is resolved
    // IDPE: https://github.com/influxdata/idpe/issues/10368
    // UI: https://github.com/influxdata/ui/issues/97
    it.skip('can add a comment into a task', () => {
      cy.getByTestID('task-card--name')
        .first()
        .click()

      // assert textarea and write a comment
      cy.getByTestID('flux-editor').within(() => {
        cy.get('textarea.inputarea')
          .should(
            'have.value',
            'option task = {\n' +
              '    name: "🦄ask",\n' +
              '    every: 24h,\n' +
              '    offset: 20m\n' +
              '  }\n' +
              '  from(bucket: "defbuck")\n' +
              '        |> range(start: -2m)'
          )
          .click()
          .focused()
          .type('{end} {enter} //this is a test comment')
          .then(() => {
            cy.get('textarea.inputarea').should(
              'have.value',
              'option task = {\n' +
                '    name: "🦄ask",\n' +
                '    every: 24h,\n' +
                '    offset: 20m\n' +
                '  }\n' +
                '  from(bucket: "defbuck")\n' +
                '        |> range(start: -2m) \n' +
                '         //this is a test comment'
            )
          })
      })

      // save and assert notification
      cy.getByTestID('task-save-btn')
        .click()
        .then(() => {
          cy.getByTestID('notification-success').contains(
            'Task was updated successfully'
          )
        })

      cy.getByTestID('task-card--name')
        .first()
        .click()

      // assert the comment
      cy.getByTestID('flux-editor').within(() => {
        cy.get('textarea.inputarea').should(
          'have.value',
          'option task = {name: "🦄ask", every: 24h, offset: 20m}\n' +
            '\n' +
            'from(bucket: "defbuck")\n' +
            '\t|> range(start: -2m)\n' +
            '    //this is a test comment'
        )
      })
    })
  })

  describe('Searching and filtering', () => {
    const newLabelName = 'click-me'
    const taskName = 'beepBoop'

    beforeEach(() => {
      cy.get<Organization>('@org').then(({id}: Organization) => {
        cy.get<string>('@token').then(token => {
          cy.createTask(token, id, taskName).then(({body}) => {
            cy.createAndAddLabel('tasks', id, body.id, newLabelName)
          })

          cy.createTask(token, id).then(({body}) => {
            cy.createAndAddLabel('tasks', id, body.id, 'bar')
          })
        })
      })

      cy.fixture('routes').then(({orgs}) => {
        cy.get<Organization>('@org').then(({id}: Organization) => {
          cy.visit(`${orgs}/${id}/tasks`)
          cy.getByTestID('tree-nav')
        })
      })
    })

    it('can click to filter tasks by labels', () => {
      cy.getByTestID('task-card').should('have.length', 2)

      cy.getByTestID(`label--pill ${newLabelName}`).click()

      cy.getByTestID('task-card').should('have.length', 1)

      // searching by task name
      cy.getByTestIDAndSetInputValue('search-widget', 'bEE')

      cy.getByTestID('task-card').should('have.length', 1)
    })
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
          return `import "influxdata/influxdb/v1{rightarrow}
  v1.tagValues(bucket: "${name}", tag: "_field"{rightarrow}
  from(bucket: "${name}"{rightarrow}
    |> range(start: -2m{rightarrow}`
        },
        interval,
        offset
      )
      cy.getByTestID('task-save-btn').click()
      cy.getByTestID('task-card')
        .should('have.length', 1)
        .and('contain', taskName)

      cy.getByTestID('task-card--name').contains(taskName)

      cy.getByTestID('task-card')
        .trigger('mouseover')
        .then(() => {
          cy.getByTestID('context-cog-runs').click()
          cy.getByTestID('context-edit-task').click()
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

      cy.getByTestID('task-save-btn').click()
      // checks to see if the data has been updated once saved
      cy.getByTestID('task-card--name').contains(newTask)
    })

    it('persists data when toggling between scheduling tasks', () => {
      // toggles schedule task from every to cron
      cy.getByTestID('task-card-cron-btn').click()

      // checks to see if the cron helper text exists
      cy.getByTestID('form--box').should('have.length', 1)

      const cronInput = '0 2 * * *'
      // checks to see if the cron data is set to the initial value
      cy.getByInputValue('')
      cy.getByInputValue(offset)

      cy.getByTestID('task-form-schedule-input').type(cronInput)
      // toggles schedule task back to every from cron
      cy.getByTestID('task-card-every-btn').click()
      // checks to see if the initial interval data for every persists
      cy.getByInputValue(interval)
      cy.getByInputValue(offset)
      // toggles back to cron from every
      cy.getByTestID('task-card-cron-btn').click()
      // checks to see if the cron data persists
      cy.getByInputValue(cronInput)
      cy.getByInputValue(offset)
      cy.getByTestID('task-save-btn').click()
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
        .trigger('mouseover')
        .then(() => {
          cy.getByTestID('context-cog-runs')
            .eq(secondIndex)
            .click()
          cy.getByTestID('context-edit-task')
            .eq(secondIndex)
            .click()
        })
      // verify that it is the correct data
      cy.getByInputValue(secondTask)

      cy.get('.cf-tree-nav--item__active').within(() => {
        // Get the element that has a click handler within the nav item
        cy.get('.cf-tree-nav--item-block').click()
      })
      // navigate back to the first one to verify that the name is correct
      cy.getByTestID('task-card--name').contains(firstTask)

      cy.getByTestID('task-card')
        .eq(firstIndex)
        .trigger('mouseover')
        .then(() => {
          cy.getByTestID('context-cog-runs')
            .eq(firstIndex)
            .click()
          cy.getByTestID('context-edit-task')
            .eq(firstIndex)
            .click()
        })
      // verify that it is the correct data
      cy.getByInputValue(firstTask)
    })

    it('when navigating using the cancel button', () => {
      // click on the second task
      cy.getByTestID('task-card--name').contains(secondTask)

      cy.getByTestID('task-card')
        .eq(secondIndex)
        .trigger('mouseover')
        .then(() => {
          cy.getByTestID('context-cog-runs')
            .eq(secondIndex)
            .click()
          cy.getByTestID('context-edit-task')
            .eq(secondIndex)
            .click()
        })

      // verify that it is the correct data
      cy.getByInputValue(secondTask)
      cy.getByTestID('task-cancel-btn').click()

      // navigate back to the first task again
      cy.getByTestID('task-card--name').contains(firstTask)

      cy.getByTestID('task-card')
        .eq(firstIndex)
        .trigger('mouseover')
        .then(() => {
          cy.getByTestID('context-cog-runs')
            .eq(firstIndex)
            .click()
          cy.getByTestID('context-edit-task')
            .eq(firstIndex)
            .click()
        })
      // verify that it is the correct data
      cy.getByInputValue(firstTask)
      cy.getByTestID('task-cancel-btn').click()
    })

    it('when navigating using the save button', () => {
      // click on the second task
      cy.getByTestID('task-card--name').contains(secondTask)

      cy.getByTestID('task-card')
        .eq(secondIndex)
        .trigger('mouseover')
        .then(() => {
          cy.getByTestID('context-cog-runs')
            .eq(secondIndex)
            .click()
          cy.getByTestID('context-edit-task')
            .eq(secondIndex)
            .click()
        })
      // verify that it is the correct data
      cy.getByInputValue(secondTask)
      cy.getByTestID('task-save-btn').click()

      // navigate back to the first task again
      cy.getByTestID('task-card--name').contains(firstTask)

      cy.getByTestID('task-card')
        .eq(firstIndex)
        .trigger('mouseover')
        .then(() => {
          cy.getByTestID('context-cog-runs')
            .eq(firstIndex)
            .click()
          cy.getByTestID('context-edit-task')
            .eq(firstIndex)
            .click()
        })
      // verify that it is the correct data
      cy.getByInputValue(firstTask)
      cy.getByTestID('task-save-btn').click()
    })
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
      cy.getByTestID('add-resource-dropdown')
        .children()
        .first()
        .click()
      cy.getByTestID('add-resource-dropdown--new').click()

      // Fill Task Form
      // focused() waits for monoco editor to get input focus
      // If this isn't present then cypress shifts focus on elements
      // making it seem randomly jumping to elements
      cy.focused()

      cy.getByTestID('flux-editor').type(task.query)
      cy.getByTestIDAndSetInputValue('task-form-name', task.name)
      cy.getByTestIDAndSetInputValue('task-form-schedule-input', task.every)
      cy.getByTestIDAndSetInputValue('task-form-offset-input', task.offset)

      // Save Task
      cy.getByTestID('task-save-btn').click()
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
        .click()

      // Navigate away from current page back to Tasks List page
      cy.get('.bread-crumb-title')
        .first()
        .click()
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

const createTask = (
  name: string,
  task: string,
  every = '3h',
  offset = '20m'
) => {
  cy.getByTestID('add-resource-dropdown--button')
    .children()
    .first()
    .click()
  cy.getByTestID('add-resource-dropdown--new').click()

  cy.getByTestID('flux-editor').within(() => {
    cy.get('textarea.inputarea')
      .click({force: true})
      .focused()
      .type(task, {force: true, delay: 2})
  })

  cy.getByTestIDAndSetInputValue('task-form-name', name)
  cy.getByTestIDAndSetInputValue('task-form-offset-input', offset)
  cy.getByTestIDAndSetInputValue('task-form-schedule-input', every)
  cy.getByTestID('task-save-btn').click()
  cy.getByTestID('notification-success--dismiss').click()
}
