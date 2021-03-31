import {Organization, AppState, Dashboard} from '../../../src/types'
import {lines} from '../../support/commands'

const typeAheadFlag = 'typeAheadVariableDropdown'

describe('Dashboard', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin().then(() =>
      cy.fixture('routes').then(({orgs}) => {
        cy.get('@org').then(({id: orgID}: Organization) => {
          cy.visit(`${orgs}/${orgID}/dashboards-list`)
          cy.getByTestID('tree-nav')
        })
      })
    )
  })

  it("can edit a dashboard's name", () => {
    cy.get('@org').then(({id: orgID}: Organization) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('tree-nav')
        })
      })
    })

    const newName = 'new 🅱️ashboard'

    cy.get('.renamable-page-title').click()
    cy.get('.cf-input-field')
      .type(newName)
      .type('{enter}')

    cy.fixture('routes').then(({orgs}) => {
      cy.get('@org').then(({id: orgID}: Organization) => {
        cy.visit(`${orgs}/${orgID}/dashboards-list`)
        cy.getByTestID('tree-nav')
      })
    })

    cy.getByTestID('dashboard-card').should('contain', newName)
  })

  it('can create, clone and destroy cells & toggle in and out of presentation mode', () => {
    cy.get('@org').then(({id: orgID}: Organization) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('tree-nav')
        })
      })
    })

    // Create View cell
    cy.getByTestID('add-cell--button').click()
    cy.getByTestID('save-cell--button').click()
    cy.getByTestID('cell-context--toggle').click()
    cy.getByTestID('cell-context--configure').click()

    // Rename View cell
    const xyCellName = 'Line Graph'
    cy.getByTestID('overlay').within(() => {
      cy.getByTestID('page-title').click()
      cy.getByTestID('renamable-page-title--input')
        .clear()
        .type(xyCellName)
      cy.getByTestID('save-cell--button').click()
    })

    const xyCell = `cell ${xyCellName}`

    cy.getByTestID(xyCell).within(([$cell]) => {
      const prevWidth = $cell.clientWidth
      const prevHeight = $cell.clientHeight
      cy.wrap(prevWidth).as('prevWidth')
      cy.wrap(prevHeight).as('prevHeight')
    })

    // Resize Cell
    cy.getByTestID(xyCell).within(() => {
      cy.get('.react-resizable-handle')
        .trigger('mousedown', {which: 1, force: true})
        .trigger('mousemove', {
          clientX: 800,
          clientY: 800,
          force: true,
        })
        .trigger('mouseup', {force: true})
    })

    cy.getByTestID(xyCell).within(([$cell]) => {
      const currWidth = $cell.clientWidth
      const currHeight = $cell.clientHeight
      cy.get('@prevWidth').should('be.lessThan', currWidth)
      cy.get('@prevHeight').should('be.lessThan', currHeight)
    })

    // Note cell
    const noteText = 'this is a note cell'
    const headerPrefix = '#'

    cy.getByTestID('add-note--button').click()
    cy.getByTestID('note-editor--overlay').within(() => {
      cy.getByTestID('markdown-editor').within(() => {
        cy.get('textarea').type(`${headerPrefix} ${noteText}`, {force: true})
      })

      cy.getByTestID('note-editor--preview').contains(noteText)
      cy.getByTestID('note-editor--preview').should('not.contain', headerPrefix)

      cy.getByTestID('save-note--button').click()
    })

    // Note Cell controls
    cy.getByTestID('add-note--button').click()
    cy.getByTestID('note-editor--overlay').should('be.visible')
    cy.getByTestID('cancel-note--button').click()
    cy.getByTestID('note-editor--overlay').should('not.exist')

    const noteCell = 'cell--view-empty markdown'
    cy.getByTestID(noteCell).contains(noteText)
    cy.getByTestID(noteCell).should('not.contain', headerPrefix)

    // Drag and Drop Cell
    cy.getByTestID('cell--draggable Note')
      .trigger('mousedown', {which: 1, force: true})
      .trigger('mousemove', {clientX: -800, clientY: -800, force: true})
      .trigger('mouseup', {force: true})

    cy.getByTestID(noteCell).within(([$cell]) => {
      const noteTop = $cell.getBoundingClientRect().top
      const noteBottom = $cell.getBoundingClientRect().bottom
      cy.wrap(noteTop).as('noteTop')
      cy.wrap(noteBottom).as('noteBottom')
    })

    cy.getByTestID(xyCell).within(([$cell]) => {
      const xyCellTop = $cell.getBoundingClientRect().top
      const xyCellBottom = $cell.getBoundingClientRect().bottom
      cy.get('@noteTop').should('be.lessThan', xyCellTop)
      cy.get('@noteBottom').should('be.lessThan', xyCellBottom)
    })

    // toggle presentation mode
    cy.getByTestID('presentation-mode-toggle').click()
    // ensure a notification is sent when toggling to presentation mode
    cy.getByTestID('notification-primary--children').should('exist')
    // escape to toggle the presentation mode off
    cy.get('body').trigger('keyup', {
      keyCode: 27,
      code: 'Escape',
      key: 'Escape',
    })

    // Edit note cell
    cy.getByTestID('cell-context--toggle')
      .last()
      .click()
    cy.getByTestID('cell-context--note').click()

    // Note cell
    const noteText2 = 'changed text'
    const headerPrefix2 = '-'

    cy.getByTestID('note-editor--overlay').within(() => {
      cy.getByTestID('markdown-editor').within(() => {
        cy.get('textarea')
          .clear()
          .type(`${headerPrefix2} ${noteText2}`)
      })
      cy.getByTestID('note-editor--preview').contains(noteText2)
      cy.getByTestID('note-editor--preview').should(
        'not.contain',
        headerPrefix2
      )

      cy.getByTestID('save-note--button').click()
    })

    cy.getByTestID('cell Name this Cell').should('not.contain', noteText)
    cy.getByTestID('cell Name this Cell').should('contain', noteText2)

    // Remove Note cell
    cy.getByTestID('cell-context--toggle')
      .last()
      .click()
    cy.getByTestID('cell-context--delete').click()
    cy.getByTestID('cell-context--delete-confirm').click()
    cy.wait(200)

    // Clone View cell
    cy.getByTestID('cell-context--toggle').click()
    cy.getByTestID('cell-context--clone').click()

    // Ensure that the clone exists
    cy.getByTestID('cell Line Graph (Clone)').should('exist')
    // Remove View cells
    cy.getByTestID('cell-context--toggle')
      .first()
      .click()
    cy.getByTestID('cell-context--delete').click()
    cy.getByTestID('cell-context--delete-confirm').click()
    cy.getByTestID('cell-context--toggle').click()
    cy.getByTestID('cell-context--delete').click()
    cy.getByTestID('cell-context--delete-confirm').click()

    cy.getByTestID('empty-state').should('exist')
  })

  // fix for https://github.com/influxdata/influxdb/issues/15239
  it('retains the cell content after canceling an edit to the cell', () => {
    cy.get('@org').then(({id: orgID}: Organization) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('tree-nav')
        })
      })
    })

    // Add an empty cell
    cy.getByTestID('add-cell--button').click()
    cy.getByTestID('save-cell--button').click()
    cy.getByTestIDSubStr('cell--view-empty').should('be.visible')

    cy.getByTestIDSubStr('cell--view-empty')
      .invoke('text')
      .then(cellContent => {
        // cellContent is yielded as a cutesy phrase from src/shared/copy/cell

        // open Cell Editor Overlay
        cy.getByTestID('cell-context--toggle').click()
        cy.getByTestID('cell-context--configure').click()

        // Cancel edit
        cy.getByTestID('cancel-cell-edit--button').click()

        // Cell content should remain
        cy.getByTestIDSubStr('cell--view-empty').contains(cellContent)
      })
  })

  const getSelectedVariable = (contextID: string, index?: number) => win => {
    const state = win.store.getState() as AppState
    const defaultVarOrder = state.resources.variables.allIDs
    const defaultVarDawg =
      state.resources.variables.byID[defaultVarOrder[index]] || {}
    const filledVarDawg =
      (state.resources.variables.values[contextID] || {values: {}}).values[
        defaultVarOrder[index]
      ] || {}

    const hydratedVarDawg = {
      ...defaultVarDawg,
      ...filledVarDawg,
    }

    if (hydratedVarDawg.arguments.type === 'map') {
      if (!hydratedVarDawg.selected) {
        hydratedVarDawg.selected = [
          Object.keys(hydratedVarDawg.arguments.values)[0],
        ]
      }

      return hydratedVarDawg.arguments.values[hydratedVarDawg.selected[0]]
    }

    if (!hydratedVarDawg.selected) {
      hydratedVarDawg.selected = [hydratedVarDawg.arguments.values[0]]
    }

    return hydratedVarDawg.selected[0]
  }

  describe('variable interactions', () => {
    beforeEach(() => {
      const numLines = 360
      cy.writeData(lines(numLines))
      cy.get('@org').then(({id: orgID}: Organization) => {
        cy.createDashboard(orgID).then(({body: dashboard}) => {
          cy.wrap({dashboard}).as('dashboard')
        })
      })
    })

    it('can manage variable state with a lot of pointing and clicking', () => {
      const bucketOne = 'b1'
      const bucketThree = 'b3'
      const bucketVarName = 'bucketsCSV'
      const bucket4 = 'anotherBucket'
      const bucket5 = 'randomBucket'

      const mapTypeVarName = 'mapTypeVar'
      const bucketVarIndex = 0
      const mapTypeVarIndex = 2
      cy.window().then(win => {
        win.influx.set(typeAheadFlag, true)

        cy.get('@org').then(({id: orgID}: Organization) => {
          cy.get<Dashboard>('@dashboard').then(({dashboard}) => {
            cy.get<string>('@defaultBucket').then((defaultBucket: string) => {
              cy.createCSVVariable(orgID, bucketVarName, [
                bucketOne,
                defaultBucket,
                bucketThree,
                bucket4,
                bucket5,
              ])

              cy.createQueryVariable(orgID)
              cy.createMapVariable(orgID).then(() => {
                cy.fixture('routes').then(({orgs}) => {
                  cy.visit(`${orgs}/${orgID}/dashboards/${dashboard.id}`)
                  cy.getByTestID('tree-nav')
                })
                // add cell with variable in its query
                cy.getByTestID('add-cell--button').click()
                cy.getByTestID('switch-to-script-editor').should('be.visible')
                cy.getByTestID('switch-to-script-editor').click()
                cy.getByTestID('toolbar-tab').click()

                // check to see if the default timeRange variables are available
                cy.get('.flux-toolbar--list-item').contains('timeRangeStart')
                cy.get('.flux-toolbar--list-item').contains('timeRangeStop')

                cy.getByTestID('flux-editor')
                  .should('be.visible')
                  .click()
                  .focused()
                  .type(' ')
                cy.get('.flux-toolbar--list-item')
                  .eq(bucketVarIndex)
                  .within(() => {
                    cy.get('.cf-button').click()
                  })
                cy.getByTestID('save-cell--button').click()

                // TESTING CSV VARIABLE
                // selected value in dashboard is 1st value
                cy.getByTestID(
                  `variable-dropdown-input-typeAhead--${bucketVarName}`
                ).should('have.value', bucketOne)

                cy.window()
                  .pipe(getSelectedVariable(dashboard.id, 0))
                  .should('equal', bucketOne)

                // testing variable controls
                cy.getByTestID(
                  `variable-dropdown-input-typeAhead--${bucketVarName}`
                ).should('have.value', bucketOne)

                cy.getByTestID('variables--button').click()
                cy.getByTestID(`variable-dropdown--${bucketVarName}`).should(
                  'not.exist'
                )
                cy.getByTestID('variables--button').click()
                cy.getByTestID(`variable-dropdown--${bucketVarName}`).should(
                  'exist'
                )

                // sanity check on the url before beginning
                cy.location('search').should('eq', '?lower=now%28%29%20-%201h')

                // select 3rd value in dashboard
                cy.getByTestID('variable-dropdown--button')
                  .first()
                  .click()
                cy.get(`#${bucketThree}`).click()

                // selected value in dashboard is 3rd value
                cy.getByTestID(
                  `variable-dropdown-input-typeAhead--${bucketVarName}`
                ).should('have.value', bucketThree)

                cy.window()
                  .pipe(getSelectedVariable(dashboard.id, 0))
                  .should('equal', bucketThree)

                // and that it updates the variable in the URL
                cy.location('search').should(
                  'eq',
                  `?lower=now%28%29%20-%201h&vars%5BbucketsCSV%5D=${bucketThree}`
                )

                // select 2nd value in dashboard
                cy.getByTestID('variable-dropdown--button')
                  .first()
                  .click()
                cy.get(`#${defaultBucket}`).click()

                // and that it updates the variable in the URL without breaking stuff
                cy.location('search').should(
                  'eq',
                  `?lower=now%28%29%20-%201h&vars%5BbucketsCSV%5D=${defaultBucket}`
                )

                // start new stuff for typeAheadDropdown here:

                // type in the input!
                cy.getByTestID(
                  `variable-dropdown-input-typeAhead--${bucketVarName}`
                ).clear()

                cy.getByTestID(
                  `variable-dropdown-input-typeAhead--${bucketVarName}`
                ).type('an')

                // dropdown should  be showing: anotherBucket', 'randomBucket'

                // hit down arrow once:

                cy.getByTestID(
                  `variable-dropdown-input-typeAhead--${bucketVarName}`
                ).type('{downarrow}')

                // first element should be active (highlighted)
                cy.get(`#anotherBucket`).should('have.class', 'active')

                // hit down arrow again
                cy.getByTestID(
                  `variable-dropdown-input-typeAhead--${bucketVarName}`
                ).type('{downarrow}')

                // next one should be active (first should NOT be active)
                cy.get(`#anotherBucket`).should('not.have.class', 'active')
                cy.get(`#randomBucket`).should('have.class', 'active')

                // now; press return/enter to set it:
                cy.getByTestID(
                  `variable-dropdown-input-typeAhead--${bucketVarName}`
                ).type('{enter}')

                // selected value in dashboard is 'randomBucket' value
                cy.getByTestID(
                  `variable-dropdown-input-typeAhead--${bucketVarName}`
                ).should('have.value', 'randomBucket')

                // now:  clear the text area, write some text that doesn't match anything,
                // then click outside; it should revert back to 'randomBucket'

                // type in the input!
                cy.getByTestID(
                  `variable-dropdown-input-typeAhead--${bucketVarName}`
                ).clear()

                cy.getByTestID(
                  `variable-dropdown-input-typeAhead--${bucketVarName}`
                ).type('nothingM')

                // end typeAhead section; rest is normal behavior

                // open VEO
                cy.getByTestID('cell-context--toggle').click()
                cy.getByTestID('cell-context--configure').click()

                // selected value in cell context is 2nd value (making sure it reverts back!)
                cy.window()
                  .pipe(getSelectedVariable(dashboard.id, 0))
                  .should('equal', bucket5)

                cy.getByTestID('toolbar-tab').click()
                cy.get('.flux-toolbar--list-item')
                  .first()
                  .trigger('mouseover')
                // toggle the variable dropdown in the VEO cell dashboard
                cy.getByTestID('toolbar-popover--contents').within(() => {
                  cy.getByTestID('variable-dropdown--button').click()
                  // select 1st value in cell
                  cy.getByTestID('variable-dropdown--item')
                    .first()
                    .click()
                })
                // injecting mapTypeVar into query
                cy.get('.flux-toolbar--list-item')
                  .eq(mapTypeVarIndex)
                  .within(() => {
                    cy.get('.cf-button').click()
                  })
                // save cell
                cy.getByTestID('save-cell--button').click()

                // selected value in cell context is 1st value
                cy.window()
                  .pipe(getSelectedVariable(dashboard.id, 0))
                  .should('equal', bucketOne)

                // selected value in dashboard is 1st value
                cy.getByTestID(
                  `variable-dropdown-input-typeAhead--${bucketVarName}`
                ).should('have.value', bucketOne)

                cy.window()
                  .pipe(getSelectedVariable(dashboard.id, 0))
                  .should('equal', bucketOne)

                // TESTING MAP VARIABLE
                // selected value in dashboard is 1st value
                cy.getByTestID(
                  `variable-dropdown-input-typeAhead--${mapTypeVarName}`
                ).should('have.value', 'k1')
                cy.window()
                  .pipe(getSelectedVariable(dashboard.id, 2))
                  .should('equal', 'v1')

                // select 2nd value in dashboard
                cy.getByTestID('variable-dropdown--button')
                  .eq(1)
                  .click()
                cy.get(`#k2`).click()

                // selected value in dashboard is 2nd value
                cy.getByTestID(
                  `variable-dropdown-input-typeAhead--${mapTypeVarName}`
                ).should('have.value', 'k2')
                cy.window()
                  .pipe(getSelectedVariable(dashboard.id, 2))
                  .should('equal', 'v2')

                // open VEO
                cy.getByTestID('cell-context--toggle').click()
                cy.getByTestID('cell-context--configure').click()
                cy.getByTestID('toolbar-tab').should('be.visible')

                // selected value in cell context is 2nd value
                cy.window()
                  .pipe(getSelectedVariable(dashboard.id, 2))
                  .should('equal', 'v2')

                cy.getByTestID('toolbar-tab').click()
                cy.get('.flux-toolbar--list-item')
                  .eq(2)
                  .trigger('mouseover')
                // toggle the variable dropdown in the VEO cell dashboard
                cy.getByTestID('toolbar-popover--contents').within(() => {
                  cy.getByTestID('variable-dropdown--button').click()
                  // select 1st value in cell
                  cy.getByTestID('variable-dropdown--item')
                    .first()
                    .click()
                })
                // save cell
                cy.getByTestID('save-cell--button').click()

                // selected value in cell context is 1st value
                cy.window()
                  .pipe(getSelectedVariable(dashboard.id, 2))
                  .should('equal', 'v1')

                // selected value in dashboard is 1st value
                cy.getByTestID(
                  `variable-dropdown-input-typeAhead--${mapTypeVarName}`
                ).should('have.value', 'k1')
                cy.window()
                  .pipe(getSelectedVariable(dashboard.id, 2))
                  .should('equal', 'v1')

                cy.getByTestID('cell-context--toggle').click()
                cy.getByTestID('cell-context--delete').click()
                cy.getByTestID('cell-context--delete-confirm').click()

                // create a new cell
                cy.getByTestID('add-cell--button').click()
                cy.getByTestID('switch-to-script-editor').should('be.visible')
                cy.getByTestID('switch-to-script-editor').click()

                // query for data
                cy.getByTestID('flux-editor')
                  .should('be.visible')
                  .click()
                  .focused()
                  .clear()
                  .type(
                    `from(bucket: v.bucketsCSV)
|> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["_measurement"] == "m")
|> filter(fn: (r) => r["_field"] == "v")
|> filter(fn: (r) => r["tk1"] == "tv1")
|> aggregateWindow(every: v.windowPeriod, fn: max)
|> yield(name: "max")`,
                    {force: true, delay: 1}
                  )

                // `bucketOne` should not exist nor have data written to it
                cy.getByTestID('save-cell--button').click()
                cy.getByTestID('empty-graph-error').contains(`${bucketOne}`)

                // select default bucket that has data
                cy.getByTestID('variable-dropdown--button')
                  .eq(0)
                  .click()
                cy.get(`#${defaultBucket}`).click()

                // assert visualization appears
                cy.getByTestID('giraffe-layer-line').should('exist')
              })
            })
          })
        })
      })
    })

    it('reloads dependent variables properly', () => {
      const bucketOne = 'b1'
      const bucketThree = 'b3'
      const bucketVarName = 'bucketsCSV'
      const bucket4 = 'anotherBucket'
      const bucket5 = 'randomBucket'

      const dependentTypeVarName = 'greeting'
      const bucketVarIndex = 0

      cy.window().then(win => {
        win.influx.set(typeAheadFlag, true)

        cy.get('@org').then(({id: orgID}: Organization) => {
          cy.get<Dashboard>('@dashboard').then(({dashboard}) => {
            cy.get<string>('@defaultBucket').then((defaultBucket: string) => {
              cy.createCSVVariable(orgID, bucketVarName, [
                bucketOne,
                defaultBucket,
                bucketThree,
                bucket4,
                bucket5,
              ])

              cy.createQueryVariable(
                orgID,
                'greeting',
                `import "csv"
data = "#group,false,false,false,false
#datatype,string,long,string,string
#default,_result,,,
,result,table,_value,bucket
,,0,hola,b1
,,0,adios,b1
,,0,bonjour,defbuck
,,0,hello,b3
,,0,goodbye,b3
,,0,seeya,b3
"
csv.from(csv: data) |> filter(fn: (r) => r.bucket == v.bucketsCSV)`
              )

              cy.fixture('routes').then(({orgs}) => {
                cy.visit(`${orgs}/${orgID}/dashboards/${dashboard.id}`)
                cy.getByTestID('tree-nav')
              })
              // add cell with variable in its query
              cy.getByTestID('add-cell--button').click()
              cy.getByTestID('switch-to-script-editor').should('be.visible')
              cy.getByTestID('switch-to-script-editor').click()
              cy.getByTestID('toolbar-tab').click()

              cy.getByTestID('flux-editor')
                .should('be.visible')
                .click()
                .focused()
                .clear()
                .type(
                  `from(bucket: v.bucketsCSV)
|> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["_field"] == v.greeting)
|> aggregateWindow(every: v.windowPeriod, fn: max)
|> yield(name: "max")`,
                  {force: true, delay: 1}
                )
              cy.get('.flux-toolbar--list-item')
                .eq(bucketVarIndex)
                .within(() => {
                  cy.get('.cf-button').click()
                })
              cy.getByTestID('save-cell--button').click()

              // ok; now check that 'b1' is selected and 'greeting' has 'adios' selected
              cy.getByTestID(
                `variable-dropdown-input-typeAhead--${bucketVarName}`
              ).should('have.value', bucketOne)

              cy.getByTestID(
                `variable-dropdown-input-typeAhead--${dependentTypeVarName}`
              ).should('have.value', 'adios')

              // hit downarrow in the second dropdown:
              cy.getByTestID(
                `variable-dropdown-input-typeAhead--${dependentTypeVarName}`
              ).type('{downarrow}')

              // check that both 'adios' and 'hola' are showing: (and with correct classes)
              cy.get(`#hola`).should('not.have.class', 'active')
              cy.get(`#adios`).should('have.class', 'active')

              // hit the down arrow again:
              cy.getByTestID(
                `variable-dropdown-input-typeAhead--${dependentTypeVarName}`
              ).type('{downarrow}')

              // check that both 'adios' and 'hola' are showing: (and with correct classes)
              cy.get(`#hola`).should('have.class', 'active')

              // 'adios' is still active b/c it is selected.....
              cy.get(`#adios`).should('have.class', 'active')

              // press enter to select:
              cy.getByTestID(
                `variable-dropdown-input-typeAhead--${dependentTypeVarName}`
              ).type('{enter}')

              // 'hola' should now be selected:
              cy.getByTestID(
                `variable-dropdown-input-typeAhead--${dependentTypeVarName}`
              ).should('have.value', 'hola')

              // ok!  now;  pick a different bucket:

              // but first test that it only allows valid values:
              cy.getByTestID(
                `variable-dropdown-input-typeAhead--${bucketVarName}`
              )
                .type('b3789')
                .type('{enter}')
                .should('have.value', 'b1')

              // while it still has the `b1' value, test the clickAwayHere functionality:

              // type in a fake value, then click away, the prev value should be showing
              cy.getByTestID(
                `variable-dropdown-input-typeAhead--${bucketVarName}`
              )
                .clear()
                .type('b3789')

              //now click away
              cy.getByTestID('variable-dropdown--button')
                .eq(1)
                .click()

              cy.getByTestID(
                `variable-dropdown-input-typeAhead--${bucketVarName}`
              ).should('have.value', 'b1')

              // type in a real value, then click away, the prev value should be showing
              cy.getByTestID(
                `variable-dropdown-input-typeAhead--${bucketVarName}`
              )
                .clear()
                .type('b3')

              //now click away
              cy.getByTestID('variable-dropdown--button')
                .eq(1)
                .click()

              cy.getByTestID(
                `variable-dropdown-input-typeAhead--${bucketVarName}`
              ).should('have.value', 'b1')

              // now back to testing that only valid values work:
              cy.getByTestID(
                `variable-dropdown-input-typeAhead--${bucketVarName}`
              )
                .type('b3789')
                .type('{enter}')
                .should('have.value', 'b1')

              // now clear it first and do it right:
              cy.getByTestID(
                `variable-dropdown-input-typeAhead--${bucketVarName}`
              )
                .clear()
                .type('b3')
                .type('{enter}')
                .should('have.value', 'b3')

              // now the 'greeting' should be empty
              cy.getByTestID(
                `variable-dropdown-input-typeAhead--${dependentTypeVarName}`
              ).should('have.value', '')

              // click the dropdownbutton:
              // select 2nd value in dashboard
              cy.getByTestID('variable-dropdown--button')
                .eq(1)
                .click()

              // verify they are all there and with no active class:
              cy.get(`#hello`).should('not.have.class', 'active')
              cy.get(`#goodbye`).should('not.have.class', 'active')
              cy.get(`#seeya`).should('not.have.class', 'active')

              cy.getByTestID(
                `variable-dropdown-input-typeAhead--${dependentTypeVarName}`
              )
                .type('el')
                .type('{downarrow}')
                .type('{enter}')

              cy.getByTestID(
                `variable-dropdown-input-typeAhead--${dependentTypeVarName}`
              ).should('have.value', 'hello')

              // ok; now switch to a bucket with NO greeting vars; test that:

              cy.getByTestID(
                `variable-dropdown-input-typeAhead--${bucketVarName}`
              )
                .clear()
                .type('random')
                .type('{downarrow}')
                .type('{enter}')
                .should('have.value', bucket5)

              // the greeting vars should NOT be there
              cy.getByTestID(
                `variable-dropdown--${dependentTypeVarName}`
              ).should('contain', 'No Values')

              // now, go back to b3; 'hello' should be th eselected greeting
              cy.getByTestID(
                `variable-dropdown-input-typeAhead--${bucketVarName}`
              )
                .clear()
                .type('b3')
                .type('{downarrow}')
                .type('{enter}')
                .should('have.value', bucketThree)

              cy.getByTestID(
                `variable-dropdown-input-typeAhead--${dependentTypeVarName}`
              ).should('have.value', 'hello')
            })
          })
        })
      })
    })

    // leaving this test to test the non-type ahead dropdown.  with all the reloads the flag setting
    // is not functional.  plus we need to test the normal one anyone until the typeahead flag is gone.
    // when that flag goes away, need to update this test!

    // explicitly setting flag to false tho; because previous tests have set it to true.
    it('ensures that dependent variables load one another accordingly, even with reload and cleared local storage', () => {
      cy.window().then(win => {
        win.influx.set(typeAheadFlag, false)

        cy.get('@org').then(({id: orgID}: Organization) => {
          cy.createDashboard(orgID).then(({body: dashboard}) => {
            cy.get<string>('@defaultBucket').then((defaultBucket: string) => {
              const now = Date.now()
              cy.writeData([
                `test,container_name=cool dopeness=12 ${now - 1000}000000`,
                `test,container_name=beans dopeness=18 ${now - 1200}000000`,
                `test,container_name=cool dopeness=14 ${now - 1400}000000`,
                `test,container_name=beans dopeness=10 ${now - 1600}000000`,
              ])
              cy.createCSVVariable(orgID, 'static', ['beans', defaultBucket])
              cy.createQueryVariable(
                orgID,
                'dependent',
                `import "influxdata/influxdb/v1"
            v1.tagValues(bucket: v.static, tag: "container_name") |> keep(columns: ["_value"])`
              )
              cy.createQueryVariable(
                orgID,
                'build',
                `import "influxdata/influxdb/v1"
            import "strings"
            v1.tagValues(bucket: v.static, tag: "container_name") |> filter(fn: (r) => strings.hasSuffix(v: r._value, suffix: v.dependent))`
              )

              cy.fixture('routes').then(({orgs}) => {
                cy.visit(`${orgs}/${orgID}/dashboards/${dashboard.id}`)
                cy.getByTestID('tree-nav')
              })

              cy.getByTestID('add-cell--button').click()
              cy.getByTestID('switch-to-script-editor').should('be.visible')
              cy.getByTestID('switch-to-script-editor').click()
              cy.getByTestID('toolbar-tab').click()

              cy
                .getByTestID('flux-editor')
                .should('be.visible')
                .click()
                .focused().type(`from(bucket: v.static)
|> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["_measurement"] == "test")
|> filter(fn: (r) => r["_field"] == "dopeness")
|> filter(fn: (r) => r["container_name"] == v.build)`)

              cy.getByTestID('save-cell--button').click()

              // the default bucket selection should have no results and load all three variables
              // even though only two variables are being used (because 1 is dependent upon another)
              cy.getByTestID('variable-dropdown--static').should(
                'contain',
                'beans'
              )

              // and cause the rest to exist in loading states
              cy.getByTestID('variable-dropdown--build').should(
                'contain',
                'Loading'
              )

              cy.getByTestIDSubStr('cell--view-empty')

              // But selecting a nonempty bucket should load some data
              cy.getByTestID('variable-dropdown--button')
                .eq(0)
                .click()
              cy.get(`#${defaultBucket}`).click()

              // default select the first result
              cy.getByTestID('variable-dropdown--build').should(
                'contain',
                'beans'
              )

              // and also load the third result
              cy.getByTestID('variable-dropdown--button')
                .eq(2)
                .should('contain', 'beans')
                .click()
              cy.get(`#cool`).click()

              // and also load the second result
              cy.getByTestID('variable-dropdown--dependent').should(
                'contain',
                'cool'
              )

              // updating the third variable should update the second
              cy.getByTestID('variable-dropdown--button')
                .eq(2)
                .click()
              cy.get(`#beans`).click()
              cy.getByTestID('variable-dropdown--build').should(
                'contain',
                'beans'
              )
            })
            cy.clearLocalStorage()
            cy.reload()
            cy.get<string>('@defaultBucket').then(() => {
              // the default bucket selection should have no results and load all three variables
              // even though only two variables are being used (because 1 is dependent upon another)
              cy.getByTestID('variable-dropdown--static').should(
                'contain',
                'defbuck'
              )

              // and cause the rest to exist in loading states
              cy.getByTestID('variable-dropdown--build').should(
                'contain',
                'beans'
              )

              // and also load the second result

              cy.getByTestID('variable-dropdown--build').should(
                'contain',
                'beans'
              )
            })
          })
        })
      })
    })

    /* \
    built to approximate an instance with docker metrics,
    operating with the variables:
        depbuck:
            from(bucket: v.buckets)
                |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
                |> filter(fn: (r) => r["_measurement"] == "docker_container_cpu")
                |> keep(columns: ["container_name"])
                |> rename(columns: {"container_name": "_value"})
                |> last()
                |> group()
        buckets:
            buckets()
                |> filter(fn: (r) => r.name !~ /^_/)
                |> rename(columns: {name: "_value"})
                |> keep(columns: ["_value"])
    and a dashboard built of :
        cell one:
            from(bucket: v.buckets)
                |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
                |> filter(fn: (r) => r["_measurement"] == "docker_container_cpu")
                |> filter(fn: (r) => r["_field"] == "usage_percent")
        cell two:
            from(bucket: v.buckets)
                |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
                |> filter(fn: (r) => r["_measurement"] == "docker_container_cpu")
                |> filter(fn: (r) => r["_field"] == "usage_percent")
                |> filter(fn: (r) => r["container_name"] == v.depbuck)
    with only 4 api queries being sent to fulfill it all
  \*/
    it('can load dependent queries without much fuss', () => {
      cy.window().then(win => {
        win.influx.set(typeAheadFlag, true)
        cy.get('@org').then(({id: orgID}: Organization) => {
          cy.createDashboard(orgID).then(({body: dashboard}) => {
            cy.get<string>('@defaultBucket').then((defaultBucket: string) => {
              const now = Date.now()
              cy.writeData([
                `test,container_name=cool dopeness=12 ${now - 1000}000000`,
                `test,container_name=beans dopeness=18 ${now - 1200}000000`,
                `test,container_name=cool dopeness=14 ${now - 1400}000000`,
                `test,container_name=beans dopeness=10 ${now - 1600}000000`,
              ])
              cy.createCSVVariable(orgID, 'static', ['beans', defaultBucket])
              cy.createQueryVariable(
                orgID,
                'dependent',
                `from(bucket: v.static)
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "test")
  |> keep(columns: ["container_name"])
  |> rename(columns: {"container_name": "_value"})
  |> last()
  |> group()`
              )

              cy.fixture('routes').then(({orgs}) => {
                cy.visit(`${orgs}/${orgID}/dashboards/${dashboard.id}`)
              })
            })
          })
        })
        cy.get<string>('@defaultBucket').then((defaultBucket: string) => {
          cy.getByTestID('add-cell--button').click()
          cy.getByTestID('switch-to-script-editor').should('be.visible')
          cy.getByTestID('switch-to-script-editor').click()
          cy.getByTestID('toolbar-tab').click()

          cy
            .getByTestID('flux-editor')
            .should('be.visible')
            .click()
            .focused().type(`from(bucket: v.static)
|> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["_measurement"] == "test")
|> filter(fn: (r) => r["_field"] == "dopeness")
|> filter(fn: (r) => r["container_name"] == v.dependent)`)
          cy.getByTestID('save-cell--button').click()

          // the default bucket selection should have no results
          cy.getByTestID('variable-dropdown-input-typeAhead--static').should(
            'have.value',
            'beans'
          )

          // and cause the rest to exist in loading states
          cy.getByTestIDSubStr('variable-dropdown--dependent').should(
            'contain',
            'Loading'
          )

          cy.getByTestIDSubStr('cell--view-empty')

          // But selecting a nonempty bucket should load some data
          cy.getByTestID('variable-dropdown--button')
            .eq(0)
            .click()
          cy.get(`#${defaultBucket}`).click()

          // default select the first result
          cy.getByTestID('variable-dropdown-input-typeAhead--dependent').should(
            'have.value',
            'beans'
          )

          // and also load the second result
          cy.getByTestID('variable-dropdown--button')
            .eq(1)
            .click()
          cy.get(`#cool`).click()
        })
      })
    })
  })

  it('can create a view through the API', () => {
    cy.get('@org').then(({id: orgID}: Organization) => {
      cy.createDashWithViewAndVar(orgID).then(() => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards-list`)
          cy.getByTestID('tree-nav')
          cy.getByTestID('dashboard-card--name').click()
          cy.get('.cell--view').should('have.length', 1)
        })
      })
    })
  })

  it("should return empty table parameters when query hasn't been submitted", () => {
    cy.get('@org').then(({id: orgID}: Organization) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('tree-nav')
        })
      })
    })

    cy.getByTestID('add-cell--button')
      .click()
      .then(() => {
        cy.get('.view-options').should('not.exist')
        cy.getByTestID('cog-cell--button')
          .should('have.length', 1)
          .click()
        // should toggle the view options
        cy.get('.view-options').should('exist')
        cy.getByTestID('dropdown--button')
          .contains('Graph')
          .click()
          .then(() => {
            cy.getByTestID('view-type--table')
              .contains('Table')
              .should('have.length', 1)
              .click()

            cy.getByTestID('empty-state--text')
              .contains('This query returned no columns')
              .should('exist')
          })
      })
  })

  // based on issue #18339
  it('should save a time format change and show in the dashboard cell card', () => {
    const numLines = 360
    cy.writeData(lines(numLines))
    cy.get('@org').then(({id: orgID}: Organization) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('tree-nav')
        })
      })
    })
    const timeFormatOriginal = 'YYYY-MM-DD HH:mm:ss ZZ'
    const timeFormatNew = 'hh:mm a'

    cy.log('creating new dashboard cell')
    cy.getByTestID('add-cell--button').click()
    cy.getByTestID(`selector-list m`).click()
    cy.getByTestID('selector-list v').click()
    cy.getByTestID(`selector-list tv1`).click()
    cy.getByTestID('time-machine-submit-button').click()
    cy.getByTestID('view-type--dropdown').click()
    cy.getByTestID('view-type--line-plus-single-stat').click()

    cy.log('asserting default graph time format, saving')
    cy.getByTestID('cog-cell--button').click()
    cy.getByTestID('dropdown--button').should('contain', timeFormatOriginal)
    cy.getByTestID(`save-cell--button`).click()

    cy.log('changing graph time format')
    cy.getByTestID(`cell-context--toggle`).click()
    cy.getByTestID(`cell-context--configure`).click()
    cy.getByTestID('dropdown--button').should('contain', timeFormatOriginal)
    cy.getByTestID('dropdown--button')
      .contains(timeFormatOriginal)
      .click()
    cy.getByTestID('dropdown-item')
      .contains(timeFormatNew)
      .click()
    cy.getByTestID('dropdown--button').should('contain', timeFormatNew)
    cy.getByTestID(`save-cell--button`).click()

    cy.log('asserting the time format has not changed after saving the cell')
    cy.getByTestID(`cell-context--toggle`).click()
    cy.getByTestID(`cell-context--configure`).click()
    cy.getByTestID('dropdown--button').should('contain', timeFormatNew)
  })

  it('can sort values in a dashboard cell', () => {
    const numLines = 360
    cy.writeData(lines(numLines))
    cy.get('@org').then(({id: orgID}: Organization) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('tree-nav')
        })
      })
    })

    // creating new dashboard cell
    cy.getByTestID('add-cell--button')
      .click()
      .then(() => {
        cy.getByTestID(`selector-list m`)
          .click()
          .getByTestID('selector-list v')
          .click()
          .getByTestID(`selector-list tv1`)
          .click()
          .then(() => {
            cy.getByTestID('time-machine-submit-button').click()
          })
      })

    // change to table graph type
    cy.getByTestID('view-type--dropdown')
      .click()
      .then(() => {
        cy.getByTestID('view-type--table').click()
      })
    cy.getByTestID(`save-cell--button`).click()

    // assert sorting
    cy.getByTestID(`cell Name this Cell`).then(() => {
      cy.getByTestID('_value-table-header')
        .should('have.class', 'table-graph-cell')
        .click()
        .should('have.class', 'table-graph-cell__sort-asc')
        .click()
        .should('have.class', 'table-graph-cell__sort-desc')
    })
  })

  it('can refresh a cell without refreshing the entire dashboard', () => {
    cy.get('@org').then(({id: orgID, name}: Organization) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('tree-nav')
        })
      })
      cy.window().then(win => {
        win.influx.set('refreshSingleCell', true)
      })

      cy.createBucket(orgID, name, 'schmucket')

      const now = Date.now()
      cy.writeData(
        [
          `test,container_name=cool dopeness=12 ${now - 1000}000000`,
          `test,container_name=beans dopeness=18 ${now - 1200}000000`,
          `test,container_name=cool dopeness=14 ${now - 1400}000000`,
          `test,container_name=beans dopeness=10 ${now - 1600}000000`,
        ],
        'schmucket'
      )
    })

    cy.getByTestID('button').click()
    cy.getByTestID('switch-to-script-editor').should('be.visible')
    cy.getByTestID('switch-to-script-editor').click()
    cy.getByTestID('toolbar-tab').click()

    const query1 = `from(bucket: "schmucket")
|> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["container_name"] == "cool")`

    const query2 = `from(bucket: "schmucket")
|> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["container_name"] == "beans")`

    cy.getByTestID('flux-editor')
      .should('be.visible')
      .click()
      .focused()
      .type(query1)

    cy.getByTestID('overlay').within(() => {
      cy.getByTestID('page-title').click()
      cy.getByTestID('renamable-page-title--input')
        .clear()
        .type('blah')
      cy.getByTestID('save-cell--button').click()
    })

    cy.getByTestID('button').click()
    cy.getByTestID('switch-to-script-editor').should('be.visible')
    cy.getByTestID('switch-to-script-editor').click()
    cy.getByTestID('toolbar-tab').click()

    cy.getByTestID('overlay').within(() => {
      cy.getByTestID('flux-editor')
        .should('be.visible')
        .click()
        .focused()
        .type(query2)
      cy.getByTestID('save-cell--button').click()
    })

    cy.getByTestID('cell Name this Cell').within(() => {
      cy.getByTestID('giraffe-inner-plot')
    })

    cy.intercept('POST', 'query', req => {
      if (req.body.query === query1) {
        req.alias = 'refreshCellQuery'
      }
      if (req.body.query === query2) {
        throw new Error('Refreshed the wrong cell')
      }
    })
    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID('cell-context--toggle').click()
    })
    cy.getByTestID('cell-context--refresh').click()
    cy.wait('@refreshCellQuery')
  })

  it('can refresh the dashboard, which refreshes both cells', () => {
    cy.get('@org').then(({id: orgID, name}: Organization) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('tree-nav')
        })
      })
      cy.window().then(win => {
        win.influx.set('refreshSingleCell', true)
      })

      cy.createBucket(orgID, name, 'schmucket')

      const now = Date.now()
      cy.writeData(
        [
          `test,container_name=cool dopeness=12 ${now - 1000}000000`,
          `test,container_name=beans dopeness=18 ${now - 1200}000000`,
          `test,container_name=cool dopeness=14 ${now - 1400}000000`,
          `test,container_name=beans dopeness=10 ${now - 1600}000000`,
        ],
        'schmucket'
      )
    })

    cy.getByTestID('button').click()
    cy.getByTestID('switch-to-script-editor').should('be.visible')
    cy.getByTestID('switch-to-script-editor').click()
    cy.getByTestID('toolbar-tab').click()

    const query1 = `from(bucket: "schmucket")
|> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["container_name"] == "cool")`

    const query2 = `from(bucket: "schmucket")
|> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["container_name"] == "beans")`

    cy.getByTestID('flux-editor')
      .should('be.visible')
      .click()
      .focused()
      .type(query1)

    cy.getByTestID('overlay').within(() => {
      cy.getByTestID('page-title').click()
      cy.getByTestID('renamable-page-title--input')
        .clear()
        .type('blah')
      cy.getByTestID('save-cell--button').click()
    })

    cy.getByTestID('button').click()
    cy.getByTestID('switch-to-script-editor').should('be.visible')
    cy.getByTestID('switch-to-script-editor').click()
    cy.getByTestID('toolbar-tab').click()

    cy.getByTestID('overlay').within(() => {
      cy.getByTestID('flux-editor')
        .should('be.visible')
        .click()
        .focused()
        .type(query2)
      cy.getByTestID('save-cell--button').click()
    })

    cy.getByTestID('cell Name this Cell').within(() => {
      cy.getByTestID('giraffe-inner-plot')
    })

    cy.intercept('POST', 'query', req => {
      if (req.body.query === query1) {
        req.alias = 'refreshCellQuery'
      }
      if (req.body.query === query2) {
        req.alias = 'refreshSecondQuery'
      }
    })

    cy.getByTestID('autorefresh-dropdown-refresh').click()
    cy.wait('@refreshCellQuery')
    cy.wait('@refreshSecondQuery')
  })
})
