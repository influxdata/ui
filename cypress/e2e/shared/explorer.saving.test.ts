import {Organization} from '../../../src/types'
import {points} from '../../support/commands'

describe('Data Explorer saving', () => {
  beforeEach(() => {
    cy.flush().then(() =>
      cy.signin().then(() =>
        cy
          .setFeatureFlags({
            showOldDataExplorerInNewIOx: true,
            showDashboardsInNewIOx: true,
            showTasksInNewIOx: true,
            showVariablesInNewIOx: true,
          })
          .then(() => {
            cy.get('@org').then(({id}: Organization) => {
              cy.createMapVariable(id)
              cy.writeData(points(10))
              cy.fixture('routes').then(({orgs}) => {
                cy.visit(`${orgs}/${id}/data-explorer`)
                cy.getByTestID('tree-nav').should('be.visible')
              })
            })
          })
      )
    )
  })

  it('can open/close save as dialog and navigate inside', () => {
    // open save as
    cy.getByTestID('overlay--container').should('not.exist')
    cy.getByTestID('save-query-as').click()
    cy.getByTestID('overlay--container').should('be.visible')

    // test all tabs
    cy.get('[id="task"]').click()
    cy.getByTestID('task-form-name').should('be.visible')
    cy.get('[id="variable"]').click()
    cy.getByTestID('flux-editor').should('be.visible')
    cy.get('[id="dashboard"]').click()
    cy.getByTestID('cell--radio-button').click()
    cy.getByTestID('save-as-dashboard-cell--dropdown').should('be.visible')

    // close save as
    cy.getByTestID('save-as-overlay--header').within(() => {
      cy.get('button').click()
    })
    cy.getByTestID('overlay--container').should('not.exist')
  })

  describe('as dashboard cell', () => {
    const dashboardNames = ['dashboard 1', 'board 2', 'board 3']
    const cellName = '📊 graph 1'
    const dashboardCreateName = '📋 board'

    beforeEach(() => {
      cy.get('@org').then(({id: orgID}: Organization) => {
        dashboardNames.forEach((d, i) => {
          cy.createDashboard(orgID, d).then(({body}) => {
            cy.wrap(body.id).as(`dasboard${i}-id`)
          })
        })
      })

      // setup query for saving and open dashboard dialog
      cy.getByTestID(`selector-list m`).click()
      cy.getByTestID(`time-machine-submit-button`).click()
      cy.getByTestID('save-query-as').click()
      cy.get('[id="dashboard"]').click()
    })

    it('can save as cell into multiple dashboards', () => {
      // input dashboards and cell name
      dashboardNames.forEach(name => {
        cy.getByTestID('cell--radio-button').click()
        cy.getByTestID('save-as-dashboard-cell--dropdown').click()
        cy.getByTestID('save-as-dashboard-cell--dropdown-menu').within(() => {
          cy.contains(name).click()
        })
      })
      cy.getByTestID('save-as-dashboard-cell--cell-name').type(cellName)

      cy.getByTestID('save-as-dashboard-cell--submit').click()
      cy.wait(250)

      // ensure cell exists at dashboards
      cy.get('@org').then(({id: orgID}: Organization) => {
        cy.fixture('routes').then(({orgs}) => {
          dashboardNames.forEach((_, i) => {
            cy.get(`@dasboard${i}-id`).then(id => {
              cy.visit(`${orgs}/${orgID}/dashboards/${id}`)
              cy.getByTestID('tree-nav')
              cy.getByTestID(`cell ${cellName}`).should('exist')
            })
          })
        })
      })
    })

    it('can create new dashboard as saving target', () => {
      // select and input new dashboard name and cell name
      cy.getByTestID('cell--radio-button').click()
      cy.getByTestID('save-as-dashboard-cell--dropdown').click()
      cy.getByTestID('save-as-dashboard-cell--dropdown-menu').within(() => {
        cy.getByTestID('save-as-dashboard-cell--create-new-dash').click()
      })
      cy.getByTestID('save-as-dashboard-cell--dashboard-name')
        .should('be.visible')
        .clear()
        .type(dashboardCreateName)
      cy.getByTestID('save-as-dashboard-cell--cell-name').type(cellName)

      cy.getByTestID('save-as-dashboard-cell--submit').click()

      cy.location('pathname').should(
        'match',
        /^(?=.*dashboards)(?:(?!cell).)+$/
      )

      cy.getByTestID(`cell--draggable ${cellName}`).should('exist').click()
      cy.getByTestID(`cell ${cellName}`).should('exist')
    })
  })

  describe('as a task', () => {
    const bucketName = 'bucket 2'
    const taskName = '☑ task'
    const offset = '30m'
    const timeEvery = '50h10m5s'
    const timeCron = '0 0 12 * * TUE,FRI,SUN *'
    // for strong typings
    const cron = 'cron'
    const every = 'every'
    const both: ('cron' | 'every')[] = [cron, every]

    const fillForm = (
      type: 'cron' | 'every',
      texts: {time?: string; offset?: string; taskName?: string}
    ) => {
      const checkAndType = (target: string, text: string | undefined) => {
        cy.getByTestID(target).clear()
        if (text) {
          cy.getByTestID(target).type(text)
        }
      }
      const {offset, taskName, time} = texts

      cy.getByTestID(`task-card-${type}-btn`).click()
      checkAndType('task-form-name', taskName)
      checkAndType('task-form-schedule-input', time)
      checkAndType('task-form-offset-input', offset)
    }

    const visitTasks = () => {
      cy.fixture('routes').then(({orgs}) => {
        cy.get('@org').then(({id}: Organization) => {
          cy.visit(`${orgs}/${id}/tasks`)
          cy.getByTestID('tree-nav')
        })
      })
    }

    beforeEach(() => {
      cy.get<Organization>('@org').then(({id, name}: Organization) => {
        cy.createBucket(id, name, bucketName)
      })
      cy.get<string>('@defaultBucketListSelector').then(
        (defaultBucketListSelector: string) => {
          cy.getByTestID(defaultBucketListSelector).click()
          cy.getByTestID('nav-item-data-explorer').click({force: true})
          cy.getByTestID(`selector-list m`).click()
          cy.getByTestID('save-query-as').click({force: true})
          cy.get('[id="task"]').click()
        }
      )
    })

    // TODO: enable when problem with switching cron/every is fixed
    it.skip('should enable/disable submit based on inputs', () => {
      both.forEach(type => {
        const time = type === 'every' ? timeEvery : timeCron
        cy.getByTestID('task-form-save').should('be.disabled')
        fillForm(type, {})
        cy.getByTestID('task-form-save').should('be.disabled')
        fillForm(type, {time, taskName})
        cy.getByTestID('task-form-save').should('be.enabled')
        fillForm(type, {taskName, offset})
        cy.getByTestID('task-form-save').should('be.disabled')
        fillForm(type, {time, offset})
        cy.getByTestID('task-form-save').should('be.disabled')
      })
    })

    both.forEach(type =>
      [true, false].forEach(withOffset => {
        it(`can create ${type} task with${
          withOffset ? '' : 'out'
        } offset`, () => {
          const time = type === 'every' ? timeEvery : timeCron
          fillForm(type, {time, taskName, ...(withOffset ? {offset} : {})})
          cy.getByTestID('task-form-save').click()

          visitTasks()

          cy.getByTestID('task-card')
            .first()
            .trigger('mouseover')
            .then(() => {
              cy.getByTestID('context-menu-task').click()
              cy.getByTestID('context-edit-task').click()
            })

          cy.getByTestID('task-form-schedule-input').should('have.value', time)
          cy.getByTestID('task-form-offset-input').should(
            'have.value',
            withOffset ? offset : ''
          )
        })
      })
    )

    it('can select buckets', () => {
      fillForm('every', {time: timeEvery, taskName})

      cy.getByTestID('task-options-bucket-dropdown--button').click()
      cy.getByTestID('dropdown-item').contains(bucketName).click()
      cy.getByTestID('task-options-bucket-dropdown--button')
        .contains(bucketName)
        .should('exist')

      cy.getByTestID('task-options-bucket-dropdown--button').click()
      cy.get<string>('@defaultBucket').then((defaultBucket: string) => {
        cy.getByTestID('dropdown-item').contains(defaultBucket).click()
        cy.getByTestID('task-options-bucket-dropdown--button')
          .contains(defaultBucket)
          .should('exist')

        cy.getByTestID('task-form-save').click()
      })
    })
  })

  describe('as variable', () => {
    const variableName = 'var1'

    const visitVariables = () => {
      cy.fixture('routes').then(({orgs}) => {
        cy.get('@org').then(({id}: Organization) => {
          cy.visit(`${orgs}/${id}/settings/variables`)
          cy.getByTestID('tree-nav')
        })
      })
    }

    beforeEach(() => {
      cy.getByTestID('nav-item-data-explorer').click({force: true})
      cy.getByTestID(`selector-list m`).click()
      cy.getByTestID('save-query-as').click({force: true})
      cy.get('[id="variable"]').click()

      // pre-visit the "Save as variable" tab to prevent race condition
      cy.getByTestID('overlay--container').within(() => {
        cy.getByTestID('variable-form-save').should('be.disabled')
        cy.getByTestID('flux-editor').should('be.visible')
        cy.getByTestID('flux-editor').click()
        cy.get('.cf-overlay--dismiss').click()
      })
    })

    it('can save and enable/disable submit button', () => {
      cy.getByTestID(`selector-list m`).click()
      cy.getByTestID('save-query-as').click({force: true})
      cy.get('[id="variable"]').click()

      cy.getByTestID('overlay--container').within(() => {
        cy.getByTestID('variable-form-save').should('be.disabled')
        cy.getByTestID('flux-editor').should('be.visible')
        cy.getByTestID('variable-name-input').type(variableName)
        cy.getByTestID('variable-form-save').should('be.enabled')
        cy.getByTestID('variable-name-input').clear()
        cy.getByTestID('variable-form-save').should('be.disabled')
        cy.getByTestID('flux-editor').should('be.visible')
        cy.getByTestID('variable-name-input').type(variableName)
        cy.getByTestID('variable-form-save').should('be.enabled')

        cy.getByTestID('variable-form-save').click()
      })
      visitVariables()
      cy.getByTestID(`variable-card--name ${variableName}`).should('exist')
    })

    it('can prevent saving variable names with hyphens or spaces', () => {
      cy.getByTestID(`selector-list m`).click()
      cy.getByTestID('save-query-as').click({force: true})
      cy.get('[id="variable"]').click()
      cy.getByTestID('overlay--container').within(() => {
        cy.getByTestID('variable-form-save').should('be.disabled')
        cy.getByTestID('flux-editor').should('be.visible')
        cy.getByTestID('variable-name-input').type('bad name')
        cy.getByTestID('variable-form-save').should('be.disabled')

        cy.getByTestID('variable-name-input').clear().type('bad-name')
        cy.getByTestID('variable-form-save').should('be.disabled')
        cy.get('.cf-overlay--dismiss').click()
      })
    })
  })
})
