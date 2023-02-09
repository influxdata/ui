import {Organization} from '../../../src/types'
import {points} from '../../support/commands'
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

describe.skip('Legends', () => {
  describe('in the Data Explorer', () => {
    beforeEach(() => {
      cy.flush()
      cy.signin()
      cy.get('@org').then(({id}: Organization) => {
        cy.createMapVariable(id)
        cy.fixture('routes').then(({orgs, explorer}) => {
          cy.visit(`${orgs}/${id}${explorer}`)
          cy.getByTestID('tree-nav').should('be.visible')
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
        cy.writeData(points(100))
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
            cy.getByTestID('giraffe-layer-single-stat').trigger('mouseover')
            cy.get('.giraffe-tooltip-container').should('exist')

            // Slide the toggle off and then hovering should not trigger a legend
            cy.get('label[for="radio_hover_legend_hide"]').click()
            cy.getByTestID('giraffe-layer-single-stat').trigger('mouseover')
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
      it('exists for line graph, line graph plus single stat, and band plot', () => {
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

      it('allows the user to render and remove the static legend', () => {
        cy.writeData(points(100))

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

      it('saves to a dashboard as a cell with the static legend options open and without submitting the query', () => {
        const cellName = 'anti-crash test not submitted data explorer'
        cy.writeData(points(100))

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
            cy.getByTestID('cell--radio-button').click()
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

      // Skip for now because Firefox does not run the test correctly with a newly created cell with query and view options included
      it.skip('saves to a dashboard as a cell with the static legend options open and with the query pre-submitted', () => {
        const cellName = 'anti-crash test pre-submitted data explorer'
        cy.writeData(points(100))

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
            cy.get('.giraffe-plot').should('not.exist')
            cy.getByTestID('time-machine-submit-button').click()
            cy.get('.giraffe-plot').should('be.visible')

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
            cy.getByTestID('cell--radio-button').click()
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
      cy.signin()
      cy.fixture('routes').then(({orgs}) => {
        cy.get('@org').then(({id}: Organization) => {
          cy.visit(`${orgs}/${id}/dashboards-list`)
          cy.getByTestID('tree-nav').should('be.visible')
        })
      })
    })

    it('adds a new cell to a dashboard with the static legend options open and without submitting the query', () => {
      const cellName = 'anti-crash test not subbmited dashboard add cell'
      cy.writeData(points(100))

      cy.getByTestID('add-resource-dropdown--button').first().click()
      cy.getByTestID('add-resource-dropdown--new').click()

      cy.getByTestID('dashboard-page').should('exist')
      cy.getByTestID('page-title').click()
      cy.getByTestID('renamable-page-title')
        .should('exist')
        .clear()
        .type('Static Legend D1')
        .type('{enter}')
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

          cy.getByTestID('page-header')
            .click()
            .type(cellName + '{enter}')

          // Without submitting the query, save it to a dashboard
          cy.getByTestID('save-cell--button').click()
          cy.get('.cell--name').should('have.text', cellName)
          cy.getByTestID('giraffe-legend-table').should('not.exist')
        }
      )
    })

    // Skip for now because Firefox does not run the test correctly with a newly created cell with query and view options included
    it.skip('adds a new cell to a dashboard with the static legend options open and with the query pre-submitted', () => {
      const cellName = 'anti-crash test pre-submitted dashboard add cell'
      cy.writeData(points(100))

      cy.getByTestID('add-resource-dropdown--button').first().click()
      cy.getByTestID('add-resource-dropdown--new').click()

      cy.getByTestID('dashboard-page').should('exist')
      cy.getByTestID('page-title').click()
      cy.getByTestID('renamable-page-title')
        .should('exist')
        .clear()
        .type('Static Legend D2')
        .type('{enter}')
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
          cy.get('.giraffe-plot').should('not.exist')
          cy.getByTestID('time-machine-submit-button').click()
          cy.get('.giraffe-plot').should('be.visible')

          // Select "show" to open the static legend options
          cy.getByTestID('cog-cell--button').click()
          cy.getByTestID('view-type--dropdown').click()
          cy.getByTestID(`view-type--xy`).click()
          cy.get('[for="radio_static_legend_show"]').click()
          cy.getByTestID('static-legend-height-slider').should('exist')
          cy.getByTestID('static-legend-orientation-toggle').should('exist')
          cy.getByTestID('static-legend-opacity-slider').should('exist')
          cy.getByTestID('static-legend-colorize-rows-toggle').should('exist')

          cy.getByTestID('page-header').click().type(cellName)

          // Save it to a dashboard
          cy.getByTestID('save-cell--button').click()
          cy.get('.cell--name').should('have.text', cellName)
          cy.getByTestID('giraffe-legend-table').should('be.visible')
        }
      )
    })
  })

  describe('in Notebooks', () => {
    beforeEach(() => {
      cy.flush()
      cy.signin()
      cy.get('@org').then(({id}: Organization) => {
        cy.createMapVariable(id)
        cy.fixture('routes').then(({orgs, notebooks}) => {
          cy.createNotebook(id).then(() => {
            cy.reload()
          })
          cy.setFeatureFlags({
            showNotebooksForCI: true,
          }).then(() => {
            cy.visit(`${orgs}/${id}${notebooks}`)
            cy.getByTestID('tree-nav').should('be.visible')
          })
        })
      })
    })

    it('allows the user to toggle the hover legend and static legend', () => {
      cy.intercept('PATCH', '/api/v2private/notebooks/*').as('updateNotebook')
      cy.writeData(points(100))
      const bucketName = 'defbuck'

      cy.getByTestID('preset-new').first().click()

      cy.getByTestID('time-machine-submit-button').should('be.visible')

      // Delete 2 panels and leave "Visualize the Result"
      cy.getByTestID('sidebar-button').first().click()
      cy.getByTestID('Delete--list-item').click()
      cy.wait('@updateNotebook')

      cy.getByTestID('sidebar-button').first().click()
      cy.getByTestID('Delete--list-item').click()
      cy.wait('@updateNotebook')

      cy.get('.flow-panel__visible').should('have.length', 1)

      // Add the Query Builder
      cy.get('.flow-divider--button').first().click()

      // Opening the menu adds another Query Builder button
      cy.getByTestID('add-flow-btn--queryBuilder').should('have.length', 2)

      // Click the newest Query Builder button
      cy.getByTestID('add-flow-btn--queryBuilder').last().click()
      cy.wait('@updateNotebook')

      cy.getByTestID('bucket-selector').within(() => {
        cy.getByTestID(`selector-list ${bucketName}`).click()
      })
      cy.wait('@updateNotebook')

      cy.getByTestID('builder-card')
        .eq(0)
        .within(() => {
          cy.getByTestID(`selector-list m`).click()
        })
      cy.wait('@updateNotebook')

      cy.getByTestID('builder-card')
        .eq(1)
        .within(() => {
          cy.getByTestID(`selector-list v`).click()
        })
      cy.wait('@updateNotebook')

      cy.getByTestID('builder-card')
        .eq(2)
        .within(() => {
          cy.getByTestID(`selector-list tv1`).click()
        })
      cy.wait('@updateNotebook')

      cy.getByTestID('time-machine-submit-button').click()
      cy.get('button.flows-config-visualization-button').click()

      cy.get('.flow-sidebar').should('be.visible')
      cy.getByTestID('hover-legend-toggle').scrollIntoView()

      // Toggling any legend triggers an api call to update the Notebook spec
      // Hover Legend starts as Show and is toggleable
      cy.get('label[for="radio_hover_legend_hide"').click()
      cy.wait('@updateNotebook')

      cy.get('label[for="radio_hover_legend_show"').click()
      cy.wait('@updateNotebook')

      // Static Legend starts as Hide and is toggleable
      cy.get('label[for="radio_static_legend_show"').click()
      cy.wait('@updateNotebook')
      cy.get('.insert-cell-menu.always-on').scrollIntoView()
      cy.getByTestID('giraffe-static-legend').should('be.visible')

      cy.get('label[for="radio_static_legend_hide"').click()
      cy.wait('@updateNotebook')
      cy.getByTestID('giraffe-static-legend').should('not.exist')
    })
  })
})
