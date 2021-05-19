import {Organization} from '../../../src/types'
import {lines} from '../../support/commands'
import {
  FROM,
  RANGE,
  MEAN,
  MATH_ABS,
  MATH_FLOOR,
  STRINGS_TITLE,
  STRINGS_TRIM,
} from '../../../src/shared/constants/fluxFunctions'

const TYPE_DELAY = 0
const VIS_TYPES = [
  'band',
  //    'check',
  'gauge',
  'xy',
  'heatmap',
  'histogram',
  //  'map',
  'mosaic',
  'scatter',
  'single-stat',
  'line-plus-single-stat',
  'table',
]

function getTimeMachineText() {
  return cy
    .wrap({
      text: () => {
        const store = cy.state().window.store.getState().timeMachines
        const timeMachine = store.timeMachines[store.activeTimeMachineID]
        const query =
          timeMachine.draftQueries[timeMachine.activeQueryIndex].text
        return query
      },
    })
    .invoke('text')
}

type GraphSnapshot = {
  shouldBeSameAs: (
    other: GraphSnapshot,
    same?: boolean,
    part?: 'axes' | 'layer' | 'both'
  ) => void
  name: string
}

const makeGraphSnapshot = (() => {
  // local properties for makeGraphSnapshot function
  let lastGraphSnapsotIndex = 0
  const getNameAxes = (name: string) => `${name}-axes`
  const getNameLayer = (name: string) => `${name}-layer`

  return (): GraphSnapshot => {
    // generate unique name for snapshot for saving as cy var
    const name = `graph-snapshot-${lastGraphSnapsotIndex++}`

    // wait for drawing done
    cy.wait(500)
    cy.get('[data-testid|=giraffe-layer]')
      .then($layer => ($layer[0] as HTMLCanvasElement).toDataURL('image/jpeg'))
      .as(getNameLayer(name))

    cy.getByTestID('giraffe-axes')
      .then($axes => ($axes[0] as HTMLCanvasElement).toDataURL('image/jpeg'))
      .as(getNameAxes(name))

    return {
      name,
      shouldBeSameAs: ({name: nameOther}, same = true, part = 'both') => {
        const assert = (str: any, str2: any, same: boolean) => {
          if (same) {
            expect(str).to.eq(str2)
          } else {
            expect(str).to.not.eq(str2)
          }
        }

        if (part === 'both' || part === 'axes') {
          cy.get(`@${getNameAxes(name)}`).then(axes => {
            cy.get(`@${getNameAxes(nameOther)}`).then(axesOther => {
              assert(axes, axesOther, same)
            })
          })
        }

        if (part === 'both' || part === 'layer') {
          cy.get(`@${getNameLayer(name)}`).then(layer => {
            cy.get(`@${getNameLayer(nameOther)}`).then(layerOther => {
              assert(layer, layerOther, same)
            })
          })
        }
      },
    }
  }
})()

describe('DataExplorer', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.createMapVariable(id)
        cy.fixture('routes').then(({orgs, explorer}) => {
          cy.visit(`${orgs}/${id}${explorer}`)
          cy.getByTestID('tree-nav')
        })
      })
    })
  })

  describe('data-explorer state', () => {
    it('should persist and display last submitted script editor script ', () => {
      const fluxCode = 'from(bucket: "_monitoring")'
      cy.getByTestID('switch-to-script-editor').click()
      cy.get('.flux-editor').within(() => {
        cy.get('.view-lines').should('be.visible')
        cy.get('.view-lines').type(fluxCode)
      })
      cy.contains('Submit').click()
      cy.getByTestID('nav-item-tasks').click()
      cy.getByTestID('nav-item-data-explorer').click()
      cy.contains(fluxCode)
    })

    it('can navigate to data explorer from buckets list and override state', () => {
      const fluxCode = 'from(bucket: "_monitoring")'
      cy.getByTestID('switch-to-script-editor').click()
      cy.get('.flux-editor').within(() => {
        cy.get('.view-lines').should('be.visible')
        cy.get('.view-lines').type(fluxCode)
      })
      cy.contains('Submit').click()
      cy.get('.cf-tree-nav--toggle').click()
      // Can't use the testID to select this nav item because Clockface is silly and uses the same testID twice
      // Issue: https://github.com/influxdata/clockface/issues/539
      cy.get('.cf-tree-nav--sub-item-label')
        .contains('Buckets')
        .click()
      cy.getByTestID('bucket--card--name _tasks').click()
      cy.getByTestID('query-builder').should('exist')
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
          cy.getByTestID('input-field')
            .clear()
            .type('3')
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

  describe('optional suffix and prefix in gauge', () => {
    beforeEach(() => {
      cy.getByTestID('view-type--dropdown').click()
      cy.getByTestID(`view-type--gauge`).click()
      cy.getByTestID('cog-cell--button').click()
    })
    it('can add prefix and suffix values', () => {
      cy.get('.view-options').within(() => {
        cy.getByTestID('prefix-input')
          .click()
          .type('mph')
          .invoke('val')
          .should('equal', 'mph')
          .getByTestID('input-field--error')
          .should('have.length', 0)
        cy.getByTestID('suffix-input')
          .click()
          .type('mph')
          .invoke('val')
          .should('equal', 'mph')
          .getByTestID('input-field--error')
          .should('have.length', 0)
      })
    })
    it('can add and remove tick values', () => {
      cy.get('.view-options').within(() => {
        cy.getByTestID('tickprefix-input')
          .click()
          .invoke('val')
          .should('equal', '')
          .getByTestID('input-field--error')
          .should('have.length', 0)
        cy.getByTestID('ticksuffix-input')
          .click()
          .invoke('val')
          .should('equal', '')
          .getByTestID('input-field--error')
          .should('have.length', 0)
      })
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

      it('should error when submitting stop dates that are before start dates', () => {
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
      })

      it('should error when invalid dates are input', () => {
        // default inputs should be valid
        cy.getByTestID('input-error').should('not.exist')

        // type incomplete input
        cy.get('input[title="Start"]')
          .should('have.length', 1)
          .clear()
          .type('2019-10')

        // invalid date errors
        cy.getByTestID('form--element-error').should('exist')

        // modifies the input to be valid
        cy.get('input[title="Start"]').type('-01')

        // warnings should not appear
        cy.getByTestID('input-error').should('not.exist')

        // type invalid stop date
        cy.get('input[title="Stop"]')
          .should('have.length', 1)
          .clear()
          .type('2019-10-')

        // invalid date errors
        cy.getByTestID('form--element-error').should('exist')

        // button should be disabled
        cy.getByTestID('daterange--apply-btn').should('be.disabled')
      })
    })
  })

  describe('raw script editing', () => {
    beforeEach(() => {
      cy.getByTestID('switch-to-script-editor')
        .should('be.visible')
        .click()
    })

    it('shows the proper errors and query button state', () => {
      cy.getByTestID('time-machine-submit-button').should('be.disabled')

      cy.getByTestID('time-machine--bottom').then(() => {
        cy.getByTestID('flux-editor', {timeout: 30000})
          .should('be.visible')
          .within(() => {
            cy.get('textarea').type('foo |> bar', {force: true})

            cy.get('.squiggly-error').should('be.visible')

            cy.get('textarea').type('{selectall} {backspace}', {force: true})

            cy.get('textarea').type('from(bucket: )', {force: true})

            // error signature from lsp
            // TODO(ariel): need to resolve this test. The issue for it is here:
            // https://github.com/influxdata/ui/issues/481
            // cy.get('.signature').should('be.visible')
          })
      })

      cy.getByTestID('time-machine-submit-button').should('not.be.disabled')

      cy.getByTestID('flux-editor').within(() => {
        cy.get('.react-monaco-editor-container')
          .should('be.visible')
          .click()
          .focused()
          .type('yo', {force: true, delay: TYPE_DELAY})
      })

      cy.get('.react-monaco-editor-container')
        .should('be.visible')
        .click()
        .focused()
        .type('{selectall} {backspace}', {force: true, delay: TYPE_DELAY})
    })

    it('imports the appropriate packages to build a query', () => {
      cy.getByTestID('flux-editor', {timeout: 30000}).should('be.visible')
      cy.getByTestID('functions-toolbar-contents--functions').should('exist')
      cy.getByTestID('flux--from--inject').click({force: true})
      cy.getByTestID('flux--range--inject').click({force: true})
      cy.getByTestID('flux--math.abs--inject').click({force: true})
      cy.getByTestID('flux--math.floor--inject').click({force: true})
      cy.getByTestID('flux--strings.title--inject').click({force: true})
      cy.getByTestID('flux--strings.trim--inject').click({force: true})

      cy.wait(100)

      getTimeMachineText().then(text => {
        const expected = `
        import"${STRINGS_TITLE.package}"
        import"${MATH_ABS.package}"
        ${FROM.example}|>
        ${RANGE.example}|>
        ${MATH_ABS.example}|>
        ${MATH_FLOOR.example}|>
        ${STRINGS_TITLE.example}|>
        ${STRINGS_TRIM.example}`

        cy.fluxEqual(text, expected).should('be.true')
      })
    })

    it('can use the function selector to build a query', () => {
      // wait for monaco to load so focus is not taken from flux-toolbar-search--input
      cy.get('.view-line').should('be.visible')

      cy.getByTestID('flux-toolbar-search--input')
        .clear()
        .type('covarianced') // purposefully misspell "covariance" so all functions are filtered out

      cy.getByTestID('flux-toolbar--list').within(() => {
        cy.getByTestID('empty-state').should('be.visible')
      })

      cy.getByTestID('flux-toolbar-search--input').type('{backspace}')

      cy.get('.flux-toolbar--list-item').should('contain', 'covariance')
      cy.get('.flux-toolbar--list-item').should('have.length', 1)

      cy.getByTestID('flux-toolbar-search--input').clear()

      cy.getByTestID('flux--from--inject').click()

      getTimeMachineText().then(text => {
        const expected = FROM.example

        cy.fluxEqual(text, expected).should('be.true')
      })

      cy.getByTestID('flux--range--inject').click()

      getTimeMachineText().then(text => {
        const expected = `${FROM.example}|>${RANGE.example}`

        cy.fluxEqual(text, expected).should('be.true')
      })

      cy.getByTestID('flux--mean--inject').click()

      getTimeMachineText().then(text => {
        const expected = `${FROM.example}|>${RANGE.example}|>${MEAN.example}`

        cy.fluxEqual(text, expected).should('be.true')
      })
    })

    it('shows the empty state when the query returns no results', () => {
      cy.getByTestID('time-machine--bottom').within(() => {
        cy.getByTestID('flux-editor')
          .should('be.visible')
          .click()
          .focused()
          .type(
            `from(bucket: "defbuck"{rightarrow}
  |> range(start: -10s{rightarrow}
  |> filter(fn: (r{rightarrow} => r._measurement == "no exist"{rightarrow}`,
            {force: true, delay: TYPE_DELAY}
          )
        cy.getByTestID('time-machine-submit-button').click()
      })

      cy.getByTestID('empty-graph--no-results').should('exist')
    })

    it('can save query as task even when it has a variable', () => {
      const taskName = 'tax'
      // begin flux
      cy.getByTestID('flux-editor').within(() => {
        cy.get('.react-monaco-editor-container')
          .should('be.visible')
          .click()
          .focused()
          .type(
            `from(bucket: "defbuck"{rightarrow}
  |> range(start: -15m, stop: now({rightarrow}{rightarrow}
  |> filter(fn: (r{rightarrow} => r._measurement ==`,
            {force: true, delay: TYPE_DELAY}
          )
      })

      cy.getByTestID('toolbar-tab').click()
      // checks to see if the default variables exist
      cy.getByTestID('variable--timeRangeStart')
      cy.getByTestID('variable--timeRangeStop')
      cy.getByTestID('variable--windowPeriod')
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

      cy.getByTestID(`task-card`)
        .should('exist')
        .should('contain', taskName)
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
      cy.get('.query-tab')
        .first()
        .trigger('contextmenu')
      cy.getByTestID('right-click--edit-tab').click()
      cy.getByTestID('edit-query-name').type('NewName{enter}')
      cy.get('.query-tab')
        .first()
        .contains('NewName')

      // Fire a click outside of the right click menu to dismiss it because
      // it is obscuring the + button

      cy.getByTestID('data-explorer--header').click()

      cy.get('.time-machine-queries--new').click()
      cy.get('.query-tab').should('have.length', 2)

      cy.get('.query-tab')
        .first()
        .trigger('contextmenu')
      cy.getByTestID('right-click--remove-tab').click()

      cy.get('.query-tab').should('have.length', 1)
    })
  })

  describe('visualizations', () => {
    describe('empty states', () => {
      it('shows a message if no queries have been created', () => {
        cy.getByTestID('empty-graph--no-queries').should('exist')
      })

      it('shows an error if a query is syntactically invalid', () => {
        cy.getByTestID('switch-to-script-editor').click()

        cy.getByTestID('time-machine--bottom').within(() => {
          const remove = cy.state().window.store.subscribe(() => {
            remove()
            cy.getByTestID('time-machine-submit-button').click()
            cy.getByTestID('empty-graph--error').should('exist')
          })
          cy.getByTestID('flux-editor')
            .click({force: true})
            .focused()
            .clear()
            .type('from(', {force: true, delay: 2})
          cy.getByTestID('time-machine-submit-button').click()
        })
      })
    })

    const numLines = 360
    describe(`visualize with ${numLines} lines`, () => {
      beforeEach(() => {
        // POST 360 lines to the server
        cy.writeData(lines(numLines))
      })

      it('can view time-series data', () => {
        cy.get<string>('@defaultBucketListSelector').then(
          (defaultBucketListSelector: string) => {
            cy.log('can switch between editor modes')
            cy.getByTestID('selector-list _monitoring').should('be.visible')
            cy.getByTestID('selector-list _monitoring').click()

            cy.getByTestID(defaultBucketListSelector).should('be.visible')
            cy.getByTestID(defaultBucketListSelector).click()

            cy.getByTestID('selector-list m').should('be.visible')
            cy.getByTestID('selector-list m').clickAttached()

            cy.getByTestID('selector-list v').should('be.visible')
            cy.getByTestID('selector-list v').clickAttached()

            cy.getByTestID('switch-to-script-editor').click()
            cy.getByTestID('flux-editor').should('be.visible')

            cy.log('revert back to query builder mode (without confirmation)')
            cy.getByTestID('switch-to-query-builder').click()
            cy.getByTestID('query-builder').should('be.visible')

            cy.log('can revert back to query builder mode (with confirmation)')
            cy.getByTestID('switch-to-script-editor')
              .should('be.visible')
              .click()
            cy.getByTestID('flux--aggregate.rate--inject').click()

            cy.log('check to see if import is defaulted to the top')
            cy.get('.view-line')
              .first()
              .contains('import')

            cy.log('check to see if new aggregate rate is at the bottom')
            cy.get('.view-line')
              .last()
              .contains('aggregate.')
            cy.getByTestID('flux-editor').should('exist')
            cy.getByTestID('flux-editor').within(() => {
              cy.get('textarea').type('yoyoyoyoyo', {force: true})
            })

            cy.log('can over over flux functions')
            cy.getByTestID('flux-docs--aggregateWindow').should('not.exist')
            cy.getByTestID('flux--aggregateWindow').trigger('mouseover')
            cy.getByTestID('flux-docs--aggregateWindow').should('exist')

            cy.getByTestID('switch-query-builder-confirm--button').click()

            cy.getByTestID(
              'switch-query-builder-confirm--popover--contents'
            ).within(() => {
              cy.getByTestID(
                'switch-query-builder-confirm--confirm-button'
              ).click()
            })

            cy.getByTestID('query-builder').should('exist')
            // build the query to return data from beforeEach
            cy.getByTestID('selector-list _monitoring').should('be.visible')
            cy.getByTestID('selector-list _monitoring').click()

            cy.getByTestID(defaultBucketListSelector).should('be.visible')
            cy.getByTestID(defaultBucketListSelector).click()

            cy.getByTestID('selector-list m').should('be.visible')
            cy.getByTestID('selector-list m').clickAttached()

            cy.getByTestID('selector-list v').should('be.visible')
            cy.getByTestID('selector-list v').clickAttached()

            cy.getByTestID('selector-list tv1').clickAttached()

            cy.getByTestID('selector-list last')
              .scrollIntoView()
              .should('be.visible')
              .click({force: true})

            cy.getByTestID('time-machine-submit-button').click()

            // cycle through all the visualizations of the data
            VIS_TYPES.forEach(type => {
              if (type !== 'mosaic' && type !== 'band') {
                // mosaic graph is behind feature flag
                cy.getByTestID('view-type--dropdown').click()
                cy.getByTestID(`view-type--${type}`).click()
                cy.getByTestID(`vis-graphic--${type}`).should('exist')
                if (type.includes('single-stat')) {
                  cy.getByTestID('single-stat--text').should(
                    'contain',
                    `${numLines}`
                  )
                }
              }
            })

            // force the last selected visualization to be a graph for the next test
            cy.getByTestID('view-type--dropdown').click()
            cy.getByTestID(`view-type--xy`).click()
            cy.getByTestID(`vis-graphic--xy`).should('exist')

            // view raw data table
            cy.getByTestID('raw-data--toggle').click()
            cy.getByTestID('raw-data-table').should('exist')
            cy.getByTestID('raw-data--toggle').click()
            cy.getByTestID('giraffe-axes').should('exist')
          }
        )
      })

      it('can set min or max y-axis values', () => {
        // build the query to return data from beforeEach
        cy.getByTestID(`selector-list m`).click()
        cy.getByTestID('selector-list v').click()
        cy.getByTestID(`selector-list tv1`).click()

        cy.getByTestID('time-machine-submit-button').click()
        cy.getByTestID('cog-cell--button').click()
        cy.get('.auto-domain-input')
          .contains('Custom')
          .click()
        cy.getByTestID('auto-domain--min')
          .type('-100')
          .blur()

        cy.getByTestID('form--element-error').should('not.exist')
        // find no errors
        cy.getByTestID('auto-domain--max')
          .type('450')
          .blur()
        // find no errors
        cy.getByTestID('form--element-error').should('not.exist')
        cy.getByTestID('auto-domain--min')
          .clear()
          .blur()
        cy.getByTestID('form--element-error').should('not.exist')
      })

      it('can set x-axis and y-axis values', () => {
        // build the query to return data from beforeEach
        cy.getByTestID(`selector-list m`).click()
        cy.getByTestID('selector-list v').click()
        cy.getByTestID(`selector-list tv1`).click()

        cy.getByTestID('time-machine-submit-button').click()
        cy.getByTestID('cog-cell--button').click()

        // check stop
        cy.getByTestID('dropdown-x').click()
        cy.getByTitle('_stop').click()
        cy.getByTestID('dropdown-x').contains('_stop')

        // check Value
        cy.getByTestID('dropdown-x').click()
        cy.getByTitle('_value').click()
        cy.getByTestID('dropdown-x').contains('_value')

        // check start
        cy.getByTestID('dropdown-x').click()
        cy.getByTitle('_start').click()
        cy.getByTestID('dropdown-x').contains('_start')

        // check time
        cy.getByTestID('dropdown-x').click()
        cy.getByTitle('_time').click()
        cy.getByTestID('dropdown-x').contains('_time')

        // check stop
        cy.getByTestID('dropdown-y').click()
        cy.getByTitle('_stop').click()
        cy.getByTestID('dropdown-y').contains('_stop')

        // check Value
        cy.getByTestID('dropdown-y').click()
        cy.getByTitle('_value').click()
        cy.getByTestID('dropdown-y').contains('_value')

        // check start
        cy.getByTestID('dropdown-y').click()
        cy.getByTitle('_start').click()
        cy.getByTestID('dropdown-y').contains('_start')

        // check time
        cy.getByTestID('dropdown-y').click()
        cy.getByTitle('_time').click()
        cy.getByTestID('dropdown-y').contains('_time')
      })

      // TODO: make work with annotations
      it.skip('can zoom and unzoom horizontal axis', () => {
        cy.getByTestID(`selector-list m`).click()
        cy.getByTestID('selector-list v').click()
        cy.getByTestID(`selector-list tv1`).click()

        cy.getByTestID('time-machine-submit-button').click()

        const snapshot = makeGraphSnapshot()

        cy.getByTestID('giraffe-layer-line').then(([canvas]) => {
          const {width, height} = canvas

          cy.wrap(canvas).trigger('mousedown', {
            x: width / 3,
            y: height / 2,
            force: true,
          })
          cy.wrap(canvas).trigger('mousemove', {
            x: (width * 2) / 3,
            y: height / 2,
            force: true,
          })
          cy.wrap(canvas).trigger('mouseup', {force: true})
        })

        const snapshot2 = makeGraphSnapshot()
        snapshot.shouldBeSameAs(snapshot2, false)

        cy.getByTestID('giraffe-layer-line').dblclick({force: true})
        makeGraphSnapshot().shouldBeSameAs(snapshot)
      })

      it.skip('can zoom and unzoom vertical axis', () => {
        cy.getByTestID(`selector-list m`).click()
        cy.getByTestID('selector-list v').click()
        cy.getByTestID(`selector-list tv1`).click()

        cy.getByTestID('time-machine-submit-button').click()

        const snapshot = makeGraphSnapshot()

        cy.getByTestID('giraffe-layer-line').then(([canvas]) => {
          const {width, height} = canvas

          cy.wrap(canvas).trigger('mousedown', {
            x: width / 2,
            y: height / 3,
            force: true,
          })
          cy.wrap(canvas).trigger('mousemove', {
            x: width / 2,
            y: (height * 2) / 3,
            force: true,
          })
          cy.wrap(canvas).trigger('mouseup', {force: true})
        })

        const snapshot2 = makeGraphSnapshot()
        snapshot.shouldBeSameAs(snapshot2, false)

        cy.getByTestID('giraffe-layer-line').dblclick({force: true})
        makeGraphSnapshot().shouldBeSameAs(snapshot)
      })

      // TODO - fix failing test (works locally, fails in circleci)
      it.skip('can hover over graph to show tooltip', () => {
        // build the query to return data from beforeEach
        cy.getByTestID(`selector-list m`).click()
        cy.getByTestID('selector-list v').click()
        cy.getByTestID(`selector-list tv1`).click()

        cy.getByTestID('time-machine-submit-button').click()

        cy.getByTestID('giraffe-tooltip').should('not.visible')
        cy.getByTestID('giraffe-layer-line')
          .click()
          .trigger('mouseover')

        cy.wait(100)
        cy.getByTestID('giraffe-layer-line').trigger('mousemove', {force: true})

        cy.getByTestID('giraffe-tooltip').should('be.visible')
        cy.getByTestID('giraffe-layer-line').trigger('mouseout', {force: true})
        cy.getByTestID('giraffe-tooltip').should('not.visible')
      })

      it('can view table data & sort values numerically', () => {
        // build the query to return data from beforeEach
        cy.getByTestID(`selector-list m`).click()
        cy.getByTestID('selector-list v').click()
        cy.getByTestID(`selector-list tv1`).click()
        cy.getByTestID(`custom-function`).click()
        cy.getByTestID('selector-list sort').click({force: true})

        cy.getByTestID('time-machine-submit-button').click()

        cy.getByTestID('view-type--dropdown').click()
        cy.getByTestID(`view-type--table`).click()
        // check to see that the FE rows are NOT sorted with flux sort
        cy.get('.table-graph-cell__sort-asc').should('not.exist')
        cy.get('.table-graph-cell__sort-desc').should('not.exist')
        cy.getByTestID('_value-table-header')
          .should('exist')
          .then(el => {
            // get the column index
            const columnIndex = el[0].getAttribute('data-column-index')
            let prev = -Infinity
            // get all the column values for that one and see if they are in order
            cy.get(`[data-column-index="${columnIndex}"]`).each(val => {
              const num = Number(val.text())
              if (isNaN(num) === false) {
                expect(num > prev).to.equal(true)
                prev = num
              }
            })
          })
        cy.getByTestID('_value-table-header').click()
        cy.get('.table-graph-cell__sort-asc').should('exist')
        cy.getByTestID('_value-table-header').click()
        cy.get('.table-graph-cell__sort-desc').should('exist')
        cy.getByTestID('_value-table-header').then(el => {
          // get the column index
          const columnIndex = el[0].getAttribute('data-column-index')
          let prev = Infinity
          // get all the column values for that one and see if they are in order
          cy.get(`[data-column-index="${columnIndex}"]`).each(val => {
            const num = Number(val.text())
            if (isNaN(num) === false) {
              expect(num < prev).to.equal(true)
              prev = num
            }
          })
        })
      })

      it('can view table data with raw data & scroll to bottom', () => {
        // build the query to return data from beforeEach
        cy.getByTestID(`selector-list m`).click()
        cy.getByTestID('selector-list v').click()
        cy.getByTestID(`selector-list tv1`).click()
        cy.getByTestID(`custom-function`).click()
        cy.getByTestID('selector-list sort').click({force: true})

        cy.getByTestID('time-machine-submit-button').click()

        cy.getByTestID('view-type--dropdown').click()
        cy.getByTestID(`view-type--table`).click()
        // view raw data table
        cy.getByTestID('raw-data--toggle').click()

        cy.get('.time-machine--view').within(() => {
          cy.getByTestID('rawdata-table--scrollbar--thumb-y')
            .trigger('mousedown', {force: true})
            .trigger('mousemove', {clientY: 5000})
            .trigger('mouseup')

          cy.getByTestID('rawdata-table--scrollbar--thumb-x')
            .trigger('mousedown', {force: true})
            .trigger('mousemove', {clientX: 1000})
            .trigger('mouseup')
        })

        cy.getByTestID(`raw-flux-data-table--cell ${numLines}`).should(
          'be.visible'
        )
      })

      it('can view table data & scroll to bottom', () => {
        // build the query to return data from beforeEach
        cy.getByTestID(`selector-list m`).click()
        cy.getByTestID('selector-list v').click()
        cy.getByTestID(`selector-list tv1`).click()
        cy.getByTestID(`custom-function`).click()
        cy.getByTestID('selector-list sort').click({force: true})

        cy.getByTestID('time-machine-submit-button').click()

        cy.getByTestID('view-type--dropdown').click()
        cy.getByTestID(`view-type--table`).click()

        cy.get('.time-machine--view').within(() => {
          cy.getByTestID('dapper-scrollbars--thumb-y')
            .trigger('mousedown', {force: true})
            .trigger('mousemove', {clientY: 5000})
            .trigger('mouseup')
            .then(() => {
              cy.get(`[title="${numLines}"]`).should('be.visible')
            })
        })
      })
    })

    describe('static legend', () => {
      it('can be disabled for all visualization types', () => {
        cy.window().then(win => {
          win.influx.set('mosaicGraphType', true)
          win.influx.set('bandPlotType', true)
          win.influx.set('staticLegend', false)
          VIS_TYPES.forEach(type => {
            cy.getByTestID('cog-cell--button').click()
            cy.getByTestID('view-type--dropdown').click()
            cy.getByTestID(`view-type--${type}`).click()
            cy.getByTestID('static-legend-options').should('not.exist')
          })
        })
      })

      it('can only be enabled for line graph, line graph plus single stat, and band plot', () => {
        cy.window().then(win => {
          win.influx.set('mosaicGraphType', true)
          win.influx.set('bandPlotType', true)
          win.influx.set('staticLegend', true)
          VIS_TYPES.forEach(type => {
            cy.getByTestID('cog-cell--button').click()
            cy.getByTestID('view-type--dropdown').click()
            cy.getByTestID(`view-type--${type}`).click()
            if (
              type === 'xy' ||
              type === 'line-plus-single-stat' ||
              type === 'band'
            ) {
              cy.getByTestID('static-legend-options').should('exist')
            } else {
              cy.getByTestID('static-legend-options').should('not.exist')
            }
          })
        })
      })
    })
  })

  describe('refresh', () => {
    beforeEach(() => {
      cy.writeData(lines(10))

      cy.getByTestID(`selector-list m`).click()
      cy.getByTestID('time-machine-submit-button').click()

      // select short time period to ensure graph changes after short time
      cy.getByTestID('timerange-dropdown').click()
      cy.getByTestID('dropdown-item-past5m').click()
    })

    it('manual refresh', () => {
      const snapshot = makeGraphSnapshot()

      // graph will slightly move
      cy.wait(200)
      cy.get('.autorefresh-dropdown--pause').click()
      makeGraphSnapshot().shouldBeSameAs(snapshot, false)
    })

    // skip until the auto-refresh feature is added back
    it.skip('auto refresh', () => {
      const snapshot = makeGraphSnapshot()
      cy.getByTestID('autorefresh-dropdown--button').click()
      cy.getByTestID('auto-refresh-5s').click()

      cy.wait(3_000)
      makeGraphSnapshot().shouldBeSameAs(snapshot)

      cy.wait(3_000)
      const snapshot2 = makeGraphSnapshot()
      snapshot2.shouldBeSameAs(snapshot, false)

      cy.getByTestID('autorefresh-dropdown-refresh').should('not.be.visible')
      cy.getByTestID('autorefresh-dropdown--button')
        .should('contain.text', '5s')
        .click()
      cy.getByTestID('auto-refresh-paused').click()
      cy.getByTestID('autorefresh-dropdown-refresh').should('be.visible')

      // wait if graph changes after another 6s when autorefresh is paused
      cy.wait(6_000)
      makeGraphSnapshot().shouldBeSameAs(snapshot2)
    })
  })

  describe('saving', () => {
    beforeEach(() => {
      cy.writeData(lines(10))
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

        cy.getByTestID(`cell--draggable ${cellName}`)
          .should('exist')
          .click()
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

            cy.getByTestID('task-card--name')
              .should('exist')
              .click()
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
        cy.getByTestID('dropdown-item')
          .contains(bucketName)
          .click()
        cy.getByTestID('task-options-bucket-dropdown--button')
          .contains(bucketName)
          .should('exist')

        cy.getByTestID('task-options-bucket-dropdown--button').click()
        cy.get<string>('@defaultBucket').then((defaultBucket: string) => {
          cy.getByTestID('dropdown-item')
            .contains(defaultBucket)
            .click()
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

          cy.getByTestID('variable-name-input')
            .clear()
            .type('bad-name')
          cy.getByTestID('variable-form-save').should('be.disabled')
          cy.get('.cf-overlay--dismiss').click()
        })
      })
    })
  })

  // skipping until feature flag feature is removed for deleteWithPredicate
  describe.skip('delete with predicate', () => {
    beforeEach(() => {
      cy.getByTestID('delete-data-predicate').click()
      cy.getByTestID('overlay--container').should('have.length', 1)
    })

    it('requires consent to perform delete with predicate', () => {
      // confirm delete is disabled
      cy.getByTestID('confirm-delete-btn').should('be.disabled')
      // checks the consent input
      cy.getByTestID('delete-checkbox').check({force: true})
      // can delete
      cy.getByTestID('confirm-delete-btn')
        .should('not.be.disabled')
        .click()
    })

    it('should set the default bucket in the dropdown to the selected bucket', () => {
      cy.get<string>('@defaultBucketListSelector').then(
        (defaultBucketListSelector: string) => {
          cy.get('.cf-overlay--dismiss').click()
          cy.getByTestID(defaultBucketListSelector).click()
          cy.getByTestID('delete-data-predicate')
            .click()
            .then(() => {
              cy.get<string>('@defaultBucket').then((defaultBucket: string) => {
                cy.getByTestID('dropdown--button').contains(defaultBucket)
                cy.get('.cf-overlay--dismiss').click()
              })
            })
            .then(() => {
              cy.getByTestID('selector-list _monitoring').click()
              cy.getByTestID('delete-data-predicate')
                .click()
                .then(() => {
                  cy.getByTestID('dropdown--button').contains('_monitoring')
                  cy.get('.cf-overlay--dismiss').click()
                })
            })
            .then(() => {
              cy.getByTestID('selector-list _tasks').click()
              cy.getByTestID('delete-data-predicate')
                .click()
                .then(() => {
                  cy.getByTestID('dropdown--button').contains('_tasks')
                })
            })
        }
      )
    })

    it('closes the overlay upon a successful delete with predicate submission', () => {
      cy.getByTestID('delete-checkbox').check({force: true})
      cy.getByTestID('confirm-delete-btn').click()
      cy.getByTestID('overlay--container').should('not.exist')
      cy.getByTestID('notification-success').should('have.length', 1)
    })
    // needs relevant data in order to test functionality
    it('should require key-value pairs when deleting predicate with filters', () => {
      // confirm delete is disabled
      cy.getByTestID('add-filter-btn').click()
      // checks the consent input
      cy.getByTestID('delete-checkbox').check({force: true})
      // cannot delete
      cy.getByTestID('confirm-delete-btn').should('be.disabled')

      // should display warnings
      cy.getByTestID('form--element-error').should('have.length', 2)

      // TODO: add filter values based on dropdown selection in key / value
    })
  })
})
