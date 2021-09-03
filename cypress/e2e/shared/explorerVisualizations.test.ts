import {Organization} from '../../../src/types'
import {lines, makeGraphSnapshot} from '../../support/commands'
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
describe('visualizations', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(({id}: Organization) => {
          cy.createMapVariable(id)
          cy.fixture('routes').then(({orgs, explorer}) => {
            cy.visit(`${orgs}/${id}${explorer}`)
            cy.getByTestID('tree-nav')
          })
        })
      })
    )
  )
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

    // passes now, as there is no annotations in explorer mode anymore;
    // and zooming is fixed (no more phantom single clicks!)
    it('can zoom and unzoom horizontal axis', () => {
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

    // passes now, as there is no annotations in explorer mode anymore;
    // and zooming is fixed (no more phantom single clicks!)
    it('can zoom and unzoom vertical axis', () => {
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

    it('can hover over graph to show tooltip', () => {
      // build the query to return data from beforeEach
      cy.getByTestID(`selector-list m`).click()
      cy.getByTestID('selector-list v').click()
      cy.getByTestID(`selector-list tv1`).click()

      cy.getByTestID('time-machine-submit-button').click()

      cy.get('.giraffe-tooltip-container').should('not.exist')

      // check for existence only, do not check for visibility
      // because the tooltip has height only when the mouse is located
      // in certain parts of the plot which requires precise mouse positioning
      cy.get('.giraffe-inner-plot').trigger('mouseover')
      cy.get('.giraffe-tooltip-container').should('exist')
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
})
