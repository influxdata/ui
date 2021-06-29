import {Organization} from '../../../src/types'
import {lines} from '../../support/commands'
const VIS_TYPES = [
  'band',
  'gauge',
  'xy',
  'heatmap',
  'histogram',
  'mosaic',
  'scatter',
  'single-stat',
  'line-plus-single-stat',
  'table',
]

describe('Legends', () => {
  describe('in the Data Explorer', () => {
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

    describe('hover legend aka "tooltip"', () => {
      it('gives the user a toggle for hide the tooltip only for line graph, line graph plus single stat, and band plot', () => {
        VIS_TYPES.forEach(type => {
          cy.getByTestID('cog-cell--button').click()
          cy.getByTestID('view-type--dropdown').click()
          cy.getByTestID(`view-type--${type}`).click()
          if (
            type === 'xy' ||
            type === 'line-plus-single-stat' ||
            type === 'band'
          ) {
            cy.getByTestID('hover-legend-toggle').should('exist')
          } else {
            cy.getByTestID('hover-legend-toggle').should('not.exist')
          }
        })
      })

      it('allows the user to toggle the hover legend to hide or show it', () => {
        cy.writeData(lines(100))
        cy.get<string>('@defaultBucketListSelector').then(
          (defaultBucketListSelector: string) => {
            cy.getByTestID('query-builder').should('exist')
            cy.getByTestID('selector-list _monitoring').should('be.visible')
            cy.getByTestID('selector-list _monitoring').click()

            cy.getByTestID(defaultBucketListSelector).should('be.visible')
            cy.getByTestID(defaultBucketListSelector).click()

            cy.getByTestID('selector-list m').should('be.visible')
            cy.getByTestID('selector-list m').clickAttached()

            cy.getByTestID('selector-list v').should('be.visible')
            cy.getByTestID('selector-list v').clickAttached()

            cy.getByTestID('selector-list tv1').clickAttached()

            cy.getByTestID('selector-list mean')
              .scrollIntoView()
              .should('be.visible')
              .click({force: true})

            cy.getByTestID('time-machine-submit-button').click()
            cy.getByTestID('cog-cell--button').click()

            // ----------------------------------------------------------------
            // Select line graph
            cy.getByTestID('view-type--dropdown').click()
            cy.getByTestID('view-type--xy').click()

            // No legend should exist just from opening the options
            cy.get('.giraffe-tooltip-container').should('not.exist')

            // Defaults to showing the hover legend options
            cy.getByTestID('hover-legend-orientation-toggle').should('exist')
            cy.getByTestID('hover-legend-opacity-slider').should('exist')
            cy.getByTestID('hover-legend-colorize-rows-toggle').should('exist')

            // Hovering over the graph should trigger a legend
            cy.getByTestID('giraffe-layer-line').trigger('mouseover')
            cy.get('.giraffe-tooltip-container').should('exist')

            // Slide the toggle off and then hovering should not trigger a legend
            cy.get('label[for="radio_hover_legend_hide"]').click()
            cy.getByTestID('giraffe-layer-line').trigger('mouseover')
            cy.get('.giraffe-tooltip-container').should('not.exist')

            // Hover Legend options should not show
            cy.getByTestID('hover-legend-orientation-toggle').should(
              'not.exist'
            )
            cy.getByTestID('hover-legend-opacity-slider').should('not.exist')
            cy.getByTestID('hover-legend-colorize-rows-toggle').should(
              'not.exist'
            )

            // ----------------------------------------------------------------
            // Select line plus single stat graph
            cy.getByTestID('view-type--dropdown').click()
            cy.getByTestID('view-type--line-plus-single-stat').click()

            // No legend should exist just from opening the options
            cy.get('.giraffe-tooltip-container').should('not.exist')

            // Defaults to showing the hover legend options
            cy.getByTestID('hover-legend-orientation-toggle').should('exist')
            cy.getByTestID('hover-legend-opacity-slider').should('exist')
            cy.getByTestID('hover-legend-colorize-rows-toggle').should('exist')

            // Hovering over the graph should trigger a legend
            cy.getByTestID('single-stat').trigger('mouseover')
            cy.get('.giraffe-tooltip-container').should('exist')

            // Slide the toggle off and then hovering should not trigger a legend
            cy.get('label[for="radio_hover_legend_hide"]').click()
            cy.getByTestID('single-stat').trigger('mouseover')
            cy.get('.giraffe-tooltip-container').should('not.exist')

            // Hover Legend options should not show
            cy.getByTestID('hover-legend-orientation-toggle').should(
              'not.exist'
            )
            cy.getByTestID('hover-legend-opacity-slider').should('not.exist')
            cy.getByTestID('hover-legend-colorize-rows-toggle').should(
              'not.exist'
            )

            // ----------------------------------------------------------------
            // Select band plot
            cy.getByTestID('view-type--dropdown').click()
            cy.getByTestID('view-type--band').click()

            // No legend should exist just from opening the options
            cy.get('.giraffe-tooltip-container').should('not.exist')

            // Defaults to showing the hover legend options
            cy.getByTestID('hover-legend-orientation-toggle').should('exist')
            cy.getByTestID('hover-legend-opacity-slider').should('exist')
            cy.getByTestID('hover-legend-colorize-rows-toggle').should('exist')

            // Hovering over the graph should trigger a legend
            cy.getByTestID('giraffe-layer-band-chart').trigger('mouseover')
            cy.get('.giraffe-tooltip-container').should('exist')

            // Slide the toggle off and then hovering should not trigger a legend
            cy.get('label[for="radio_hover_legend_hide"]').click()
            cy.getByTestID('giraffe-layer-band-chart').trigger('mouseover')
            cy.get('.giraffe-tooltip-container').should('not.exist')

            // Hover Legend options should not show
            cy.getByTestID('hover-legend-orientation-toggle').should(
              'not.exist'
            )
            cy.getByTestID('hover-legend-opacity-slider').should('not.exist')
            cy.getByTestID('hover-legend-colorize-rows-toggle').should(
              'not.exist'
            )
          }
        )
      })
    })

    describe('static legend', () => {
      it('turns on static legend flag, so static legend option should exist for line graph, line graph plus single stat, and band plot', () => {
        cy.setFeatureFlags({staticLegend: true})
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

      it('turns off static legend flag so that static legend option should not exist', () => {
        cy.setFeatureFlags({staticLegend: false})
        VIS_TYPES.forEach(type => {
          cy.getByTestID('cog-cell--button').click()
          cy.getByTestID('view-type--dropdown').click()
          cy.getByTestID(`view-type--${type}`).click()
          cy.getByTestID('static-legend-options').should('not.exist')
        })
      })

      it('turns on static legend flag to allow user to render and remove the static legend', () => {
        cy.writeData(lines(100))

        // set the flag, build the query, adjust the view options
        cy.setFeatureFlags({staticLegend: true})
        cy.get<string>('@defaultBucketListSelector').then(
          (defaultBucketListSelector: string) => {
            cy.getByTestID('query-builder').should('exist')
            cy.getByTestID('selector-list _monitoring').should('be.visible')
            cy.getByTestID('selector-list _monitoring').click()

            cy.getByTestID(defaultBucketListSelector).should('be.visible')
            cy.getByTestID(defaultBucketListSelector).click()

            cy.getByTestID('selector-list m').should('be.visible')
            cy.getByTestID('selector-list m').clickAttached()

            cy.getByTestID('selector-list v').should('be.visible')
            cy.getByTestID('selector-list v').clickAttached()

            cy.getByTestID('selector-list tv1').clickAttached()

            cy.getByTestID('selector-list mean')
              .scrollIntoView()
              .should('be.visible')
              .click({force: true})

            cy.getByTestID('time-machine-submit-button').click()
            cy.getByTestID('cog-cell--button').click()

            // ----------------------------------------------------------------
            // Select line graph
            cy.getByTestID('view-type--dropdown').click()
            cy.getByTestID(`view-type--xy`).click()

            // Select "show" to render a static legend and options
            cy.get('[for="radio_static_legend_show"]').click()
            cy.getByTestID('giraffe-static-legend').should('exist')
            cy.getByTestID('static-legend-height-slider').should('exist')
            cy.getByTestID('static-legend-orientation-toggle').should('exist')
            cy.getByTestID('static-legend-opacity-slider').should('exist')
            cy.getByTestID('static-legend-colorize-rows-toggle').should('exist')

            // Select "hide" to remove the static legend and hide the options
            cy.get('[for="radio_static_legend_hide"]').click()
            cy.getByTestID('giraffe-static-legend').should('not.exist')
            cy.getByTestID('static-legend-height-slider').should('not.exist')
            cy.getByTestID('static-legend-orientation-toggle').should(
              'not.exist'
            )
            cy.getByTestID('static-legend-opacity-slider').should('not.exist')
            cy.getByTestID('static-legend-colorize-rows-toggle').should(
              'not.exist'
            )

            // ----------------------------------------------------------------
            // Select line plus single stat graph
            cy.getByTestID('view-type--dropdown').click()
            cy.getByTestID('view-type--line-plus-single-stat').click()

            // Select "show" to render a static legend and options
            cy.get('[for="radio_static_legend_show"]').click()
            cy.getByTestID('giraffe-static-legend').should('exist')
            cy.getByTestID('static-legend-height-slider').should('exist')
            cy.getByTestID('static-legend-orientation-toggle').should('exist')
            cy.getByTestID('static-legend-opacity-slider').should('exist')
            cy.getByTestID('static-legend-colorize-rows-toggle').should('exist')

            // Select "hide" to remove the static legend and hide the options
            cy.get('[for="radio_static_legend_hide"]').click()
            cy.getByTestID('giraffe-static-legend').should('not.exist')
            cy.getByTestID('static-legend-height-slider').should('not.exist')
            cy.getByTestID('static-legend-orientation-toggle').should(
              'not.exist'
            )
            cy.getByTestID('static-legend-opacity-slider').should('not.exist')
            cy.getByTestID('static-legend-colorize-rows-toggle').should(
              'not.exist'
            )

            // ----------------------------------------------------------------
            // Select band plot
            cy.getByTestID('view-type--dropdown').click()
            cy.getByTestID('view-type--band').click()

            // Select "show" to render a static legend and options
            cy.get('[for="radio_static_legend_show"]').click()
            cy.getByTestID('giraffe-static-legend').should('exist')
            cy.getByTestID('static-legend-height-slider').should('exist')
            cy.getByTestID('static-legend-orientation-toggle').should('exist')
            cy.getByTestID('static-legend-opacity-slider').should('exist')
            cy.getByTestID('static-legend-colorize-rows-toggle').should('exist')

            // Select "hide" to remove the static legend and hide the options
            cy.get('[for="radio_static_legend_hide"]').click()
            cy.getByTestID('giraffe-static-legend').should('not.exist')
            cy.getByTestID('static-legend-height-slider').should('not.exist')
            cy.getByTestID('static-legend-orientation-toggle').should(
              'not.exist'
            )
            cy.getByTestID('static-legend-opacity-slider').should('not.exist')
            cy.getByTestID('static-legend-colorize-rows-toggle').should(
              'not.exist'
            )
          }
        )
      })

      it('turns off static legend flag so that static legend box should not exist', () => {
        cy.writeData(lines(100))

        // set the flag, build the query, and select the graph type
        cy.setFeatureFlags({staticLegend: false})
        cy.get<string>('@defaultBucketListSelector').then(
          (defaultBucketListSelector: string) => {
            cy.getByTestID('query-builder').should('exist')
            cy.getByTestID('selector-list _monitoring').should('be.visible')
            cy.getByTestID('selector-list _monitoring').click()

            cy.getByTestID(defaultBucketListSelector).should('be.visible')
            cy.getByTestID(defaultBucketListSelector).click()

            cy.getByTestID('selector-list m').should('be.visible')
            cy.getByTestID('selector-list m').clickAttached()

            cy.getByTestID('selector-list v').should('be.visible')
            cy.getByTestID('selector-list v').clickAttached()

            cy.getByTestID('selector-list tv1').clickAttached()

            cy.getByTestID('selector-list mean')
              .scrollIntoView()
              .should('be.visible')
              .click({force: true})

            cy.getByTestID('time-machine-submit-button').click()

            // Select line graph
            cy.getByTestID('view-type--dropdown').click()
            cy.getByTestID(`view-type--xy`).click()
            cy.getByTestID('giraffe-static-legend').should('not.exist')

            // Select line plus single stat graph
            cy.getByTestID('view-type--dropdown').click()
            cy.getByTestID(`view-type--line-plus-single-stat`).click()
            cy.getByTestID('giraffe-static-legend').should('not.exist')

            // Select band plot
            cy.getByTestID('view-type--dropdown').click()
            cy.getByTestID(`view-type--band`).click()
            cy.getByTestID('giraffe-static-legend').should('not.exist')
          }
        )
      })

      it('saves to a dashboard as a cell with the static legend options open and without submitting the query', () => {
        const cellName = 'anti-crash test not submitted data explorer'
        cy.writeData(lines(100))

        // set the flag, build the query, adjust the view options
        cy.setFeatureFlags({staticLegend: true})
        cy.get<string>('@defaultBucketListSelector').then(
          (defaultBucketListSelector: string) => {
            cy.getByTestID('query-builder').should('exist')
            cy.getByTestID('selector-list _monitoring').should('be.visible')
            cy.getByTestID('selector-list _monitoring').click()

            cy.getByTestID(defaultBucketListSelector).should('be.visible')
            cy.getByTestID(defaultBucketListSelector).click()

            cy.getByTestID('selector-list m').should('be.visible')
            cy.getByTestID('selector-list m').clickAttached()

            cy.getByTestID('selector-list v').should('be.visible')
            cy.getByTestID('selector-list v').clickAttached()

            cy.getByTestID('selector-list tv1').clickAttached()

            cy.getByTestID('selector-list mean')
              .scrollIntoView()
              .should('be.visible')
              .click({force: true})

            // Select "show" to open the static legend options
            cy.getByTestID('cog-cell--button').click()
            cy.getByTestID('view-type--dropdown').click()
            cy.getByTestID(`view-type--xy`).click()
            cy.get('[for="radio_static_legend_show"]').click()
            cy.getByTestID('static-legend-height-slider').should('exist')
            cy.getByTestID('static-legend-orientation-toggle').should('exist')
            cy.getByTestID('static-legend-opacity-slider').should('exist')
            cy.getByTestID('static-legend-colorize-rows-toggle').should('exist')

            // Without submitting the query, save it to a dashboard
            cy.getByTestID('save-query-as').click()
            cy.getByTestID('overlay--container').should('exist')
            cy.getByTestID('save-as-dashboard-cell--dropdown').click()
            cy.getByTestID('save-as-dashboard-cell--create-new-dash').click()
            cy.getByTestID('save-as-dashboard-cell--dashboard-name')
              .clear()
              .type('Static Legend DE1')
            cy.getByTestID('save-as-dashboard-cell--cell-name')
              .click()
              .type(cellName)
            cy.getByTestID('save-as-dashboard-cell--submit').click()
            cy.get('.cell--name').should('have.text', cellName)
            cy.getByTestID('giraffe-legend-table').should('not.exist')
          }
        )
      })

      it('saves to a dashboard as a cell with the static legend options open and with the query pre-submitted', () => {
        const cellName = 'anti-crash test pre-submitted data explorer'
        cy.writeData(lines(100))

        // set the flag, build the query, adjust the view options
        cy.setFeatureFlags({staticLegend: true})
        cy.get<string>('@defaultBucketListSelector').then(
          (defaultBucketListSelector: string) => {
            cy.getByTestID('query-builder').should('exist')
            cy.getByTestID('selector-list _monitoring').should('be.visible')
            cy.getByTestID('selector-list _monitoring').click()

            cy.getByTestID(defaultBucketListSelector).should('be.visible')
            cy.getByTestID(defaultBucketListSelector).click()

            cy.getByTestID('selector-list m').should('be.visible')
            cy.getByTestID('selector-list m').clickAttached()

            cy.getByTestID('selector-list v').should('be.visible')
            cy.getByTestID('selector-list v').clickAttached()

            cy.getByTestID('selector-list tv1').clickAttached()

            cy.getByTestID('selector-list mean')
              .scrollIntoView()
              .should('be.visible')
              .click({force: true})

            // Submit the query before saving
            cy.getByTestID('time-machine-submit-button').click()

            // Select "show" to open the static legend options
            cy.getByTestID('cog-cell--button').click()
            cy.getByTestID('view-type--dropdown').click()
            cy.getByTestID(`view-type--xy`).click()
            cy.get('[for="radio_static_legend_show"]').click()
            cy.getByTestID('static-legend-height-slider').should('exist')
            cy.getByTestID('static-legend-orientation-toggle').should('exist')
            cy.getByTestID('static-legend-opacity-slider').should('exist')
            cy.getByTestID('static-legend-colorize-rows-toggle').should('exist')

            // Save it to a dashboard
            cy.getByTestID('save-query-as').click()
            cy.getByTestID('overlay--container').should('exist')
            cy.getByTestID('save-as-dashboard-cell--dropdown').click()
            cy.getByTestID('save-as-dashboard-cell--create-new-dash').click()
            cy.getByTestID('save-as-dashboard-cell--dashboard-name')
              .clear()
              .type('Static Legend DE2')
            cy.getByTestID('save-as-dashboard-cell--cell-name')
              .click()
              .type(cellName)
            cy.getByTestID('save-as-dashboard-cell--submit').click()
            cy.get('.cell--name').should('have.text', cellName)
            cy.getByTestID('giraffe-legend-table').should('be.visible')
          }
        )
      })
    })
  })

  describe('in Dashboards', () => {
    beforeEach(() => {
      cy.flush()

      cy.signin().then(() =>
        cy.fixture('routes').then(({orgs}) => {
          cy.get('@org').then(({id}: Organization) => {
            cy.visit(`${orgs}/${id}/dashboards-list`)
            cy.getByTestID('tree-nav')
          })
        })
      )
    })

    it('adds a new cell to a dashboard with the static legend options open and without submitting the query', () => {
      const cellName = 'anti-crash test not subbmited dashboard add cell'
      cy.writeData(lines(100))

      cy.setFeatureFlags({staticLegend: true})

      cy.getByTestID('add-resource-dropdown--button')
        .first()
        .click()
      cy.getByTestID('add-resource-dropdown--new').click()

      cy.getByTestID('page-title')
        .should('exist')
        .type('Static Legend D1')
      cy.get('button[title*="Add cell"').click()

      cy.get<string>('@defaultBucketListSelector').then(
        (defaultBucketListSelector: string) => {
          cy.getByTestID('query-builder').should('exist')
          cy.getByTestID('selector-list _monitoring').should('be.visible')
          cy.getByTestID('selector-list _monitoring').click()

          cy.getByTestID(defaultBucketListSelector).should('be.visible')
          cy.getByTestID(defaultBucketListSelector).click()

          cy.getByTestID('selector-list m').should('be.visible')
          cy.getByTestID('selector-list m').clickAttached()

          cy.getByTestID('selector-list v').should('be.visible')
          cy.getByTestID('selector-list v').clickAttached()

          cy.getByTestID('selector-list tv1').clickAttached()

          cy.getByTestID('selector-list mean')
            .scrollIntoView()
            .should('be.visible')
            .click({force: true})

          // Select "show" to open the static legend options
          cy.getByTestID('cog-cell--button').click()
          cy.getByTestID('view-type--dropdown').click()
          cy.getByTestID(`view-type--xy`).click()
          cy.get('[for="radio_static_legend_show"]').click()
          cy.getByTestID('static-legend-height-slider').should('exist')
          cy.getByTestID('static-legend-orientation-toggle').should('exist')
          cy.getByTestID('static-legend-opacity-slider').should('exist')
          cy.getByTestID('static-legend-colorize-rows-toggle').should('exist')

          cy.getByTestID('overlay').within(() => {
            cy.getByTestID('page-header')
              .click()
              .type(cellName)
          })

          // Without submitting the query, save it to a dashboard
          cy.getByTestID('save-cell--button').click()
          cy.get('.cell--name').should('have.text', cellName)
          cy.getByTestID('giraffe-legend-table').should('not.exist')
        }
      )
    })

    it('adds a new cell to a dashboard with the static legend options open and with the query pre-submitted', () => {
      const cellName = 'anti-crash test pre-submitted dashboard add cell'
      cy.writeData(lines(100))

      cy.setFeatureFlags({staticLegend: true})

      cy.getByTestID('add-resource-dropdown--button')
        .first()
        .click()
      cy.getByTestID('add-resource-dropdown--new').click()

      cy.getByTestID('page-title')
        .should('exist')
        .type('Static Legend D2')
      cy.get('button[title*="Add cell"').click()

      cy.get<string>('@defaultBucketListSelector').then(
        (defaultBucketListSelector: string) => {
          cy.getByTestID('query-builder').should('exist')
          cy.getByTestID('selector-list _monitoring').should('be.visible')
          cy.getByTestID('selector-list _monitoring').click()

          cy.getByTestID(defaultBucketListSelector).should('be.visible')
          cy.getByTestID(defaultBucketListSelector).click()

          cy.getByTestID('selector-list m').should('be.visible')
          cy.getByTestID('selector-list m').clickAttached()

          cy.getByTestID('selector-list v').should('be.visible')
          cy.getByTestID('selector-list v').clickAttached()

          cy.getByTestID('selector-list tv1').clickAttached()

          cy.getByTestID('selector-list mean')
            .scrollIntoView()
            .should('be.visible')
            .click({force: true})

          // Submit the query before saving
          cy.getByTestID('time-machine-submit-button').click()

          // Select "show" to open the static legend options
          cy.getByTestID('cog-cell--button').click()
          cy.getByTestID('view-type--dropdown').click()
          cy.getByTestID(`view-type--xy`).click()
          cy.get('[for="radio_static_legend_show"]').click()
          cy.getByTestID('static-legend-height-slider').should('exist')
          cy.getByTestID('static-legend-orientation-toggle').should('exist')
          cy.getByTestID('static-legend-opacity-slider').should('exist')
          cy.getByTestID('static-legend-colorize-rows-toggle').should('exist')

          cy.getByTestID('overlay').within(() => {
            cy.getByTestID('page-header')
              .click()
              .type(cellName)
          })

          // Save it to a dashboard
          cy.getByTestID('save-cell--button').click()
          cy.get('.cell--name').should('have.text', cellName)
          cy.getByTestID('giraffe-legend-table').should('be.visible')
        }
      )
    })
  })
})
