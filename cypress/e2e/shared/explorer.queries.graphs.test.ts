import {Organization} from '../../../src/types'

describe.skip('writing queries and making graphs using Data Explorer', () => {
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

  describe('numeric input in graphs', () => {
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
      cy.isIoxOrg().then(isIox => {
        // iox uses `${orgId}_${bucketId}` for a namespace_id
        // And gives a namespace_id failure if no data is written yet.
        // https://github.com/influxdata/monitor-ci/issues/402#issuecomment-1362368473
        cy.skipOn(isIox)
      })

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
})
