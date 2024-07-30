import {Organization} from '../../../src/types'

const isIOxOrg = Boolean(Cypress.env('useIox'))
const isTSMOrg = !isIOxOrg

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

describe('When tasks already exist', () => {
  beforeEach(() => {
    setupTest()
    const TaskName = '🦄ask'
    cy.get<Organization>('@org').then(({id}: Organization) => {
      cy.get<string>('@token').then(token => {
        cy.createTask(token, id, TaskName)
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
      cy.getByTestID('task-card--name').then(() => {
        cy.getByTestID('task-card--name-button')
          .click()
          .then(() => {
            cy.getByTestID('task-card--input').type(newName).type('{enter}')
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
    const TaskName = '🦄ask'

    cy.getByTestID('task-card')
      .first()
      .then(() => {
        cy.getByTestID(`context-delete-menu ${TaskName}--button`)
          .click()
          .then(() => {
            cy.getByTestID(`context-delete-menu ${TaskName}--confirm-button`)
              .click()
              .then(() => {
                cy.getByTestID('empty-tasks-list').should('exist')
              })
          })
      })
  })

  // Skipped as too flaky - reintroduce only after rewriting.
  it.skip('can clone a task and activate just the cloned one', () => {
    const firstLabel = 'very important task'
    const secondLabel = 'mission critical'

    cy.get('button.cf-button[title="Add labels"]').click()
    cy.getByTestID('inline-labels--popover--dialog').should('be.visible')
    cy.getByTestID('inline-labels--popover-field').type(`${firstLabel}{enter}`)
    cy.getByTestID('overlay--container').should('be.visible')
    cy.getByTestID('create-label-form--submit').click()

    cy.getByTestID('overlay--container').should('not.exist')
    cy.get('button.cf-button[title="Add labels"]').click()
    cy.getByTestID('inline-labels--popover--dialog').should('be.visible')
    cy.getByTestID('inline-labels--popover-field').type(`${secondLabel}{enter}`)
    cy.getByTestID('overlay--container').should('be.visible')
    cy.getByTestID('create-label-form--submit').click()

    // ensure the two labels are present before cloning
    cy.getByTestID('overlay--container').should('not.exist')
    cy.getByTestID(`label--pill ${firstLabel}`).should('be.visible')
    cy.getByTestID(`label--pill ${secondLabel}`).should('be.visible')

    // clone the task
    cy.getByTestID('context-menu-task').click()
    cy.getByTestID('context-clone-task').click()
    cy.getByTestID('task-card--slide-toggle').should('have.length', 2)
    cy.getByTestID(`label--pill ${firstLabel}`).should('have.length', 2)
    cy.getByTestID(`label--pill ${secondLabel}`).should('have.length', 2)

    // disable the first task
    cy.getByTestID('task-card--slide-toggle')
      .eq(0)
      .should('have.class', 'active')
    cy.getByTestID('task-card--slide-toggle').eq(0).click()

    // only the clone should be active
    cy.getByTestID('task-card--slide-toggle')
      .eq(1)
      .should('have.class', 'active')
  })

  it('can clone a task and edit it', () => {
    // clone a task
    const cloneNamePrefix = '🦄ask (cloned at '
    cy.getByTestID('task-card').then(() => {
      cy.getByTestID('context-menu-task').click()
      cy.getByTestID('context-clone-task').click().type('{esc}')
    })

    cy.getByTestID('task-card').should('have.length', 2)

    // assert the values of the task and change them
    cy.getByTestIDHead('task-card--name').contains(cloneNamePrefix)

    cy.getByTestID('task-card').then(() => {
      cy.getByTestID('context-menu-task').eq(1).click()
      cy.intercept('GET', '/api/v2/tasks/*').as('clonedTask')
      cy.getByTestID('context-edit-task').click()
    })
    cy.wait('@clonedTask').then(({response}) => {
      expect(response.statusCode).to.eq(200)
      expect(response.body.flux).to.include('import "csv"')
    })

    cy.getByTestID('flux-editor').should('be.visible')
    cy.getByTestID('task-form-name')
      .invoke('val')
      .then(cloneName => {
        const cloneTime = cloneName.slice(
          cloneNamePrefix.length,
          cloneName.length - 1
        )
        const cloneTimeAsDate = new Date(cloneTime)
        expect(cloneTimeAsDate.toTimeString()).not.to.equal('Invalid Date')
        expect(cloneTimeAsDate.valueOf()).to.equal(cloneTimeAsDate.valueOf())
      })

    cy.getByTestID('task-form-name').focus().clear().type('Copy task test')
    cy.getByTestID('task-form-name').should('have.value', 'Copy task test')

    cy.getByTestID('task-form-schedule-input').should('have.value', '24h')
    cy.getByTestID('task-form-schedule-input').focus().clear().type('12h')
    cy.getByTestID('task-form-schedule-input').should('have.value', '12h')

    cy.getByTestID('task-form-offset-input').should('have.value', '20m')
    cy.getByTestID('task-form-offset-input').focus().clear().type('10m')
    cy.getByTestID('task-form-offset-input').should('have.value', '10m')

    cy.getByTestID('task-save-btn').click()

    // assert changed task name
    cy.getByTestID('task-card--name').contains('Copy task test')
  })

  // skip until this issue is resolved
  // IDPE: https://github.com/influxdata/idpe/issues/10368
  // UI: https://github.com/influxdata/ui/issues/97
  it.skip('can add a comment into a task', () => {
    cy.getByTestID('task-card--name').first().click()

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

    cy.getByTestID('task-card--name').first().click()

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
    setupTest()

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

    cy.getByTestID(`label--pill ${newLabelName}`).should('be.visible').click()

    cy.getByTestID('task-card').should('have.length', 1)

    // searching by task nameshould('be.visible').
    cy.getByTestIDAndSetInputValue('search-widget', 'bEE')

    cy.getByTestID('task-card').should('have.length', 1)
  })

  it('will not permit task creation with invalid flux', () => {
    const willFail = 'my invalid flux query'
    cy.createTaskFromEmpty(
      willFail,
      _ => {
        return `foo`
      },
      '12h',
      '30m'
    )
    cy.getByTestID('task-save-btn').should('be.visible').click()

    cy.log('error notification will appear')
    cy.getByTestID('notification-error--dismiss').should('be.visible')
    cy.log('task editor will remain open')
    cy.getByInputValue(willFail)
    cy.getByTestID('flux-editor').should('exist')
  })
})
