import {Organization} from '../../../src/types'
import {points} from '../../support/commands'

describe('general Data Explorer functionality', () => {
  let route: string

  beforeEach(() => {
    cy.flush()
    cy.signin()
    // Double check that the new schemaComposition flag does not interfere.
    cy.setFeatureFlags({
      schemaComposition: true,
    })
    // cy.wait($time) is necessary to consistently ensure sufficient time for the feature flag override.
    // The flag reset happens via redux, (it's not a network request), so we can't cy.wait($intercepted_route).
    cy.wait(1200)
    cy.get('@org').then(({id}: Organization) => {
      cy.createMapVariable(id)
      cy.fixture('routes').then(({orgs, explorer}) => {
        route = `${orgs}/${id}${explorer}`
        cy.visit(route)
        cy.getByTestID('tree-nav').should('be.visible')
      })
    })
  })

  describe('data-explorer state', () => {
    it('should persist and display last submitted script editor script ', () => {
      const fluxCode = 'from(bucket: "_monitoring")'
      cy.getByTestID('switch-to-script-editor').click()
      cy.getByTestID('flux-editor').monacoType(fluxCode)
      cy.contains('Submit').click()
      cy.getByTestID('nav-item-tasks').click()
      cy.getByTestID('nav-item-data-explorer').click()
      cy.contains(fluxCode)
    })

    it('can navigate to data explorer from buckets list and override state', () => {
      const fluxCode = 'from(bucket: "_monitoring")'
      cy.getByTestID('switch-to-script-editor').click()
      cy.getByTestID('flux-editor').monacoType(fluxCode)
      cy.contains('Submit').click()
      cy.get('.cf-tree-nav--toggle').click()
      cy.getByTestID('nav-item-load-data').click()
      cy.getByTestID('nav-subitem-buckets').click()
      cy.getByTestID('bucket--card--name _tasks').click()
      cy.getByTestID('query-builder').should('be.visible')
    })
  })

  describe('optional prefix and suffix in gauge', () => {
    const prefix = 'speed: '
    const suffix = ' mph'
    it('can add prefix and suffix labels when using Giraffe gauge', () => {
      cy.writeData(points(10))
      cy.get<string>('@defaultBucketListSelector').then(
        (defaultBucketListSelector: string) => {
          cy.getByTestID('view-type--dropdown').click()
          cy.getByTestID(`view-type--gauge`).click()

          cy.getByTestID('query-builder').should('exist')
          cy.getByTestID('selector-list _monitoring').should('be.visible')
          cy.getByTestID('selector-list _monitoring').click()

          cy.getByTestID(defaultBucketListSelector).should('be.visible')
          cy.getByTestID(defaultBucketListSelector).click()

          cy.getByTestID('selector-list m').should('be.visible')
          cy.getByTestID('selector-list m').click()

          cy.getByTestID('selector-list v').should('be.visible')
          cy.getByTestID('selector-list v').click()

          cy.getByTestID('selector-list tv1').should('be.visible')
          cy.getByTestID('selector-list tv1').click()

          cy.getByTestID('selector-list mean')
            .scrollIntoView()
            .should('be.visible')
            .click()

          cy.getByTestID('time-machine-submit-button').click()
          cy.get('canvas.giraffe-gauge').should('be.visible')

          cy.getByTestID('cog-cell--button').click()
          cy.get('.view-options').within(() => {
            cy.getByTestID('prefix-input')
              .click()
              .type(`${prefix}`)
              .invoke('val')
              .should('equal', prefix)
              .getByTestID('input-field--error')
              .should('have.length', 0)
            cy.getByTestID('suffix-input')
              .click()
              .type(`${suffix}`)
              .invoke('val')
              .should('equal', suffix)
              .getByTestID('input-field--error')
              .should('have.length', 0)
            cy.getByTestID('tick-prefix-input')
              .click()
              .type(`${prefix}`)
              .invoke('val')
              .should('equal', prefix)
              .getByTestID('input-field--error')
              .should('have.length', 0)
            cy.getByTestID('tick-suffix-input')
              .click()
              .type(`${suffix}`)
              .invoke('val')
              .should('equal', suffix)
              .getByTestID('input-field--error')
              .should('have.length', 0)
          })
        }
      )
    })

    it('can add prefix and suffix labels when using original built-in gauge', () => {
      cy.writeData(points(10))
      cy.get<string>('@defaultBucketListSelector').then(
        (defaultBucketListSelector: string) => {
          cy.getByTestID('view-type--dropdown').click()
          cy.getByTestID(`view-type--gauge`).click()

          cy.getByTestID('query-builder').should('exist')
          cy.getByTestID('selector-list _monitoring').should('be.visible')
          cy.getByTestID('selector-list _monitoring').click()

          cy.getByTestID(defaultBucketListSelector).should('be.visible')
          cy.getByTestID(defaultBucketListSelector).click()

          cy.getByTestID('selector-list m').should('be.visible')
          cy.getByTestID('selector-list m').click()

          cy.getByTestID('selector-list v').should('be.visible')
          cy.getByTestID('selector-list v').click()

          cy.getByTestID('selector-list tv1').should('be.visible')
          cy.getByTestID('selector-list tv1').click()

          cy.getByTestID('selector-list mean')
            .scrollIntoView()
            .should('be.visible')
            .click()

          cy.getByTestID('time-machine-submit-button').click()
          cy.get('.giraffe-gauge').should('be.visible')

          cy.getByTestID('cog-cell--button').click()
          cy.get('.view-options').within(() => {
            cy.getByTestID('prefix-input')
              .click()
              .type(`${prefix}`)
              .invoke('val')
              .should('equal', prefix)
              .getByTestID('input-field--error')
              .should('have.length', 0)
            cy.getByTestID('suffix-input')
              .click()
              .type(`${suffix}`)
              .invoke('val')
              .should('equal', suffix)
              .getByTestID('input-field--error')
              .should('have.length', 0)
            cy.getByTestID('tick-prefix-input')
              .click()
              .type(`${prefix}`)
              .invoke('val')
              .should('equal', prefix)
              .getByTestID('input-field--error')
              .should('have.length', 0)
            cy.getByTestID('tick-suffix-input')
              .click()
              .type(`${suffix}`)
              .invoke('val')
              .should('equal', suffix)
              .getByTestID('input-field--error')
              .should('have.length', 0)
          })
        }
      )
    })
  })

  describe('select time range to query', () => {
    it('can set a custom time range and restricts start & stop selections relative to start & stop dates', () => {
      // find initial value
      cy.get('.cf-dropdown--selected')
        .contains('Past 1')
        .should('have.length', 1)
      cy.getByTestID('timerange-popover--dialog').should('not.exist')
      cy.getByTestID('timerange-dropdown').click()

      cy.getByTestID('dropdown-item-past15m').click()
      cy.get('.cf-dropdown--selected')
        .contains('Past 15m')
        .should('have.length', 1)

      cy.getByTestID('timerange-dropdown').click()

      cy.getByTestID('timerange-popover--dialog').should('not.exist')

      cy.getByTestID('dropdown-item-customtimerange').click()
      cy.getByTestID('timerange-popover--dialog').should('have.length', 1)

      cy.getByTestID('timerange--input')
        .first()
        .clear()
        .type('2019-10-29 08:00:00.000')

      // Set the stop date to Oct 29, 2019
      cy.getByTestID('timerange--input')
        .last()
        .clear()
        .type('2019-10-29 09:00:00.000')

      // click button and see if time range has been selected
      cy.getByTestID('daterange--apply-btn').click()

      cy.getByTestID('timerange-dropdown').click()
      cy.getByTestID('dropdown-item-customtimerange').click()
    })

    describe('should allow for custom time range selection', () => {
      beforeEach(() => {
        cy.getByTestID('timerange-dropdown').click()
        cy.getByTestID('dropdown-item-customtimerange').click()
        cy.getByTestID('timerange-popover--dialog').should('have.length', 1)
      })

      it('should error when submitting stop dates that are before start dates and should error when invalid dates are input', () => {
        cy.get('input[title="Start"]')
          .should('have.length', 1)
          .clear()
          .type('2019-10-31')

        cy.get('input[title="Stop"]')
          .should('have.length', 1)
          .clear()
          .type('2019-10-29')

        // button should be disabled
        cy.getByTestID('daterange--apply-btn').should('be.disabled')

        // default inputs should be valid
        cy.getByTestID('input-error').should('not.exist')

        // type incomplete input
        cy.get('input[title="Start"]').clear().type('2019-10')

        // invalid date errors
        cy.getByTestID('form--element-error').should('exist')

        // modifies the input to be valid
        cy.get('input[title="Start"]').type('-01')

        // warnings should not appear
        cy.getByTestID('input-error').should('not.exist')

        // type invalid stop date
        cy.get('input[title="Stop"]').clear().type('2019-10-')

        // invalid date errors
        cy.getByTestID('form--element-error').should('exist')

        // button should be disabled
        cy.getByTestID('daterange--apply-btn').should('be.disabled')

        // Validate that ISO String formatted texts are valid
        cy.get('input[title="Stop"]').clear().type('2019-10-29T08:00:00.000Z')

        // button should not be disabled
        cy.getByTestID('daterange--apply-btn').should('not.be.disabled')
      })
    })
  })

  describe('refresh', () => {
    it('can refresh the graph only after submitting the query', () => {
      cy.writeData(points(20))

      // hitting refresh before a query is built gives nothing
      cy.getByTestID(`selector-list m`).should('be.visible')
      cy.getByTestID('time-machine-submit-button').should(
        'have.class',
        'cf-button--disabled'
      )
      cy.getByTestID('autorefresh-dropdown-refresh').click()
      cy.getByTestID('empty-graph--no-results').should('be.visible')
      cy.get('.giraffe-plot').should('not.exist')

      // build the query and submit
      cy.getByTestID(`selector-list m`).click()
      cy.getByTestID('time-machine-submit-button').click()
      cy.get('.giraffe-plot').should('be.visible')
      cy.getByTestID('empty-graph--no-results').should('not.exist')

      // check that refresh works
      cy.intercept('**/query**').as('refresh')
      cy.getByTestID('autorefresh-dropdown-refresh').click()

      cy.wait('@refresh')
      cy.get('.query-tab--timer__visible').should('be.visible')
      cy.get('.giraffe-plot').should('be.visible')
      cy.getByTestID('empty-graph--no-results').should('not.exist')
    })
  })

  describe('saving', () => {
    beforeEach(() => {
      cy.writeData(points(10))
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

            cy.getByTestID('task-form-schedule-input').should(
              'have.value',
              time
            )
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

  describe.skip('download csv', () => {
    // docs for how to test form submission as file download:
    // https://github.com/cypress-io/cypress-example-recipes/blob/cc13866e55bd28e1d1323ba6d498d85204f292b5/examples/testing-dom__download/cypress/e2e/form-submission-spec.cy.js
    const downloadsDirectory = Cypress.config('downloadsFolder')

    const validateCsv = (csv: string, rowCnt: number) => {
      const numHeaderRows = 4
      cy.wrap(csv)
        .then(doc => doc.trim().split('\n'))
        .then(list => {
          expect(list.length).to.equal(rowCnt + numHeaderRows)
        })
    }

    beforeEach(() => {
      cy.writeData(points(20))
      cy.task('deleteDownloads', {dirPath: downloadsDirectory})
      cy.getByTestID('switch-to-script-editor').should('be.visible').click()
    })

    it('can download a file', () => {
      cy.intercept('POST', '/api/v2/query?*', req => {
        req.redirect(route)
      }).as('query')

      cy.getByTestID('time-machine--bottom').within(() => {
        cy.getByTestID('flux-editor', {timeout: 30000}).should('be.visible')
          .monacoType(`from(bucket: "defbuck")
  |> range(start: -10h)`)
        cy.getByTestID('csv-download-button')
          .should('be.visible')
          .click()
      })

      cy.wait('@query', {timeout: 5000})
        .its('request', {timeout: 5000})
        .then(req => {
          cy.request(req)
            .then(({body, headers}) => {
              expect(headers).to.have.property(
                'content-type',
                'text/csv; charset=utf-8'
              )
              return Promise.resolve(body)
            })
            .then(csv => validateCsv(csv, 1))
        })
    })
  })
})
