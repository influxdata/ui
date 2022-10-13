import {Organization} from '../../../src/types'
import {points} from '../../support/commands'
const path = require('path')

describe('DataExplorer', () => {
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
        cy.visit(`${orgs}/${id}${explorer}`)
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

  describe('numeric input using custom bin sizes in Histograms', () => {
    beforeEach(() => {
      cy.getByTestID('view-type--dropdown').click()
      cy.getByTestID(`view-type--histogram`).click()
      cy.getByTestID('cog-cell--button').click()
    })

    it('should put input field in error status and stay in error status when input is invalid or empty', () => {
      cy.get('.view-options').within(() => {
        cy.getByTestID('auto-input').within(() => {
          cy.getByTestID('input-field').clear()
          cy.getByTestID('auto-input--custom').should(
            'have.class',
            'cf-select-group--option__active'
          )
          cy.getByTestID('input-field--error').should('have.length', 1)
          cy.getByTestID('input-field').type('adfuiopbvmc')
          cy.getByTestID('input-field--error').should('have.length', 1)
        })
      })
    })

    it('should not have the input field in error status when input becomes valid', () => {
      cy.get('.view-options').within(() => {
        cy.getByTestID('auto-input').within(() => {
          cy.getByTestID('input-field').clear().type('3')
          cy.getByTestID('input-field--error').should('have.length', 0)
        })
      })
    })
  })

  describe('numeric input validation when changing bin sizes in Heat Maps', () => {
    beforeEach(() => {
      cy.getByTestID('view-type--dropdown').click()
      cy.getByTestID(`view-type--heatmap`).click()
      cy.getByTestID('cog-cell--button').click()
    })

    it('should put input field in error status and stay in error status when input is invalid or empty', () => {
      cy.get('.view-options').within(() => {
        cy.getByTestID('grid--column').within(() => {
          cy.getByTestID('bin-size-input')
            .clear()
            .getByTestID('bin-size-input--error')
            .should('have.length', 1)
          cy.getByTestID('bin-size-input')
            .type('{backspace}')
            .getByTestID('bin-size-input--error')
            .should('have.length', 1)
          cy.getByTestID('bin-size-input')
            .type('4')
            .getByTestID('bin-size-input--error')
            .should('have.length', 1)
          cy.getByTestID('bin-size-input')
            .type('{backspace}abcdefg')
            .getByTestID('bin-size-input--error')
            .should('have.length', 1)
        })
      })
    })

    it('should not have input field in error status when "10" becomes valid input such as "5"', () => {
      cy.get('.view-options').within(() => {
        cy.getByTestID('grid--column').within(() => {
          cy.getByTestID('bin-size-input')
            .clear()
            .type('5')
            .getByTestID('bin-size-input--error')
            .should('have.length', 0)
        })
      })
    })
  })

  describe('numeric input validation when changing number of decimal places in Single Stat', () => {
    beforeEach(() => {
      cy.getByTestID('view-type--dropdown').click()
      cy.getByTestID(`view-type--single-stat`).click()
      cy.getByTestID('cog-cell--button').click()
    })

    it('should put input field in error status and stay in error status when input is invalid or empty', () => {
      cy.get('.view-options').within(() => {
        cy.getByTestID('auto-input--input').within(() => {
          cy.getByTestID('input-field')
            .click()
            .type('{backspace}')
            .invoke('attr', 'type')
            .should('equal', 'text')
            .getByTestID('input-field--error')
            .should('have.length', 1)
          cy.getByTestID('input-field')
            .click()
            .type('{backspace}')
            .invoke('val')
            .should('equal', '')
            .getByTestID('input-field--error')
            .should('have.length', 1)
          cy.getByTestID('input-field')
            .click()
            .type('abcdefg')
            .invoke('val')
            .should('equal', '')
            .getByTestID('input-field--error')
            .should('have.length', 1)
        })
      })
    })

    it('should not have input field in error status when "2" becomes valid input such as "11"', () => {
      cy.get('.view-options').within(() => {
        cy.getByTestID('auto-input--input').within(() => {
          cy.getByTestID('input-field')
            .click()
            .type('{backspace}11')
            .invoke('val')
            .should('equal', '11')
            .getByTestID('input-field--error')
            .should('have.length', 0)
        })
      })
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

  describe('raw script editing', () => {
    beforeEach(() => {
      cy.getByTestID('switch-to-script-editor').should('be.visible').click()
    })

    it('shows the proper query button state', () => {
      cy.getByTestID('time-machine-submit-button').should('be.disabled')

      cy.getByTestID('time-machine--bottom').then(() => {
        cy.getByTestID('flux-editor', {timeout: 30000})
          .should('be.visible')
          .monacoType(`{selectall}{del}from(bucket: "my-bucket")`)
      })

      cy.getByTestID('time-machine-submit-button').should('not.be.disabled')
      cy.getByTestID('flux-editor').monacoType('{selectall}{del}')
    })

    it('shows the empty state when the query returns no results', () => {
      cy.getByTestID('time-machine--bottom').within(() => {
        cy.getByTestID('flux-editor').should('be.visible')
          .monacoType(`from(bucket: "defbuck")
  |> range(start: -10s)
  |> filter(fn: (r) => r._measurement == "no exist")`)
        cy.getByTestID('time-machine-submit-button').click()
      })

      cy.getByTestID('empty-graph--no-results').should('exist')
    })

    it('can save query as task even when it has a variable', () => {
      const taskName = 'tax'
      // begin flux
      cy.getByTestID('flux-editor')
        .should('be.visible')
        .monacoType(
          `from(bucket: "defbuck")
  |> range(start: -15m, stop: now())
  |> filter(fn: (r) => r._measurement == ){leftArrow}`
        )

      cy.getByTestID('toolbar-tab').click()
      // checks to see if the default variables exist
      cy.getByTestID('variable--timeRangeStart').should('exist')
      cy.getByTestID('variable--timeRangeStop').should('exist')
      cy.getByTestID('variable--windowPeriod').should('exist')
      // insert variable name by clicking on variable
      cy.get('.flux-toolbar--variable')
        .first()
        .within(() => {
          cy.contains('Inject').click()
        })

      cy.getByTestID('save-query-as').click()
      cy.get('[id="task"]').click()
      cy.getByTestID('task-form-name').type(taskName)
      cy.getByTestID('task-form-schedule-input').type('4h')
      cy.getByTestID('task-form-save').click()

      cy.getByTestID(`task-card`).should('exist').should('contain', taskName)
    })

    it('injects variables into flux-editor', () => {
      const fluxQuery: Array<string> = [
        'from(bucket: "defbuck")',
        '  |>range(start: , stop: )',
      ]

      cy.get('.view-line').last().type(fluxQuery.join('{enter}'))

      // Searches for non-existent variable
      cy.getByTestID('toolbar-tab').click()
      cy.getByTestID('flux-toolbar-search--input').type('timeRangeStartd')
      cy.getByTestID('variable-name--timeRangeStart').should('not.exist')

      // TODO: Missing data-testid attribute
      cy.get('.flux-toolbar--list').within(() => {
        cy.getByTestID('empty-state')
          .should('exist')
          .within(() => {
            cy.getByTestID('empty-state--text')
              .should('exist')
              .and('contain', 'No variables match your search')
          })
      })

      // Searches for timeRange variables
      cy.getByTestID('flux-toolbar-search--input').clear().type('timeRange')

      cy.get('.flux-toolbar--list').within(() => {
        cy.get('.flux-toolbar--list-item')
          .should('have.length', 2)
          .and('contain', 'timeRangeStart')
          .and('contain', 'timeRangeStop')
      })

      // Inject a variable after a parameter
      const injectVariable = (
        varName: string,
        filter: string,
        param: string
      ): void => {
        cy.get('.view-line')
          .contains(filter)
          .parent()
          .then((line: JQuery<HTMLElement>) => {
            // finds index of injection
            const posOfCursor: number =
              line.text().indexOf(param) + param.length
            const cursor: string = '{rightarrow}'.repeat(posOfCursor)

            // moves text cursor
            cy.get('.view-line')
              .contains(filter)
              .parent()
              .type('{home}' + cursor)

            // injects variable
            cy.getByTestID(`variable--${varName}--inject`).click({force: true})
          })
      }

      injectVariable('timeRangeStart', 'range', 'start')
      injectVariable('timeRangeStop', 'range', 'stop')

      cy.get('.view-line')
        .should('contain', 'v.timeRangeStart')
        .and('contain', 'v.timeRangeStop')

      cy.getByTestID('flux-toolbar-search--input').clear()
      cy.get('.flux-toolbar--list').within(() => {
        cy.get('.flux-toolbar--list-item').should('have.length', 4)
      })
    })
  })

  describe('query builder', () => {
    it('shows an empty state for tag keys when the bucket is empty', () => {
      cy.getByTestID('empty-tag-keys').should('exist')
    })

    it('shows the correct number of buckets in the buckets dropdown', () => {
      cy.get<Organization>('@org').then(({id, name}) => {
        cy.createBucket(id, name, 'newBucket')
      })
      cy.get<string>('@defaultBucketListSelector').then(
        (defaultBucketListSelector: string) => {
          cy.getByTestID(defaultBucketListSelector).should('be.visible')
          cy.getByTestID('selector-list newBucket').should('be.visible')
        }
      )
    })

    it('can delete a second query', () => {
      cy.get('.time-machine-queries--new').click()
      cy.get('.query-tab').should('have.length', 2)
      cy.get('.query-tab--close')
        .first()
        // Element is only visible on hover, using force to make this test pass
        .click({force: true})
      cy.get('.query-tab').should('have.length', 1)
    })

    it('can rename and remove a second query using tab context menu', () => {
      cy.get('.query-tab').trigger('contextmenu')
      cy.getByTestID('right-click--remove-tab').should(
        'have.class',
        'cf-right-click--menu-item__disabled'
      )

      // rename the first tab
      cy.get('.query-tab').first().trigger('contextmenu', {force: true})
      cy.getByTestID('right-click--edit-tab').click()
      cy.getByTestID('edit-query-name').type('NewName{enter}')
      cy.get('.query-tab').first().contains('NewName')

      // Fire a click outside of the right click menu to dismiss it because
      // it is obscuring the + button

      cy.getByTestID('data-explorer--header').click()

      cy.get('.time-machine-queries--new').click()
      cy.get('.query-tab').should('have.length', 2)

      cy.get('.query-tab').first().trigger('contextmenu')
      cy.getByTestID('right-click--remove-tab').click()

      cy.get('.query-tab').should('have.length', 1)
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

  describe('download csv', () => {
    const downloadsDirectory = Cypress.config('downloadsFolder')

    beforeEach(() => {
      cy.writeData(points(20))
      cy.task('deleteDownloads', {dirPath: downloadsDirectory})
      cy.getByTestID('switch-to-script-editor').should('be.visible').click()
    })

    it('can download a file', () => {
      cy.intercept('POST', '/api/v2/query?*').as('query')

      cy.getByTestID('time-machine--bottom').within(() => {
        cy.getByTestID('flux-editor', {timeout: 30000}).should('be.visible')
          .monacoType(`from(bucket: "defbuck")
  |> range(start: -10h)`)
        cy.getByTestID('time-machine--download-csv')
          .should('be.visible')
          .click()
      })

      cy.wait('@query')
      cy.wait(1200)

      cy.task('getDownloads', {dirPath: downloadsDirectory}).should(files => {
        ;(files as string[]).forEach(filename => {
          expect(filename).contains('influxdb_data.csv')
          const fullPathFile = path.join(downloadsDirectory, filename)
          cy.readFile(fullPathFile, {timeout: 15000}).should(
            'have.length.gt',
            50
          )
        })
      })
    })
  })
})
