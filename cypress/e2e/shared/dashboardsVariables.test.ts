import {Organization, AppState, Dashboard} from '../../../src/types'
import {points} from '../../support/commands'

const getSelectedVariable = (contextID: string, index: number) => (
  win: any
) => {
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

describe('Dashboard - variable interactions', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.fixture('routes').then(({orgs}) => {
      cy.get<Organization>('@org').then(({id: orgID}: Organization) => {
        cy.visit(`${orgs}/${orgID}/dashboards-list`)
        const numLines = 360
        cy.writeData(points(numLines))
        cy.createDashboard(orgID).then(({body: dashboard}) => {
          cy.wrap({dashboard}).as('dashboard')
        })
      })
    })
  })

  it('informs user if variables are enabled but not defined', () => {
    cy.get<Organization>('@org').then(({id: orgID = ''}: Organization) => {
      cy.createDashWithViewAndVar(orgID).then(() => {
        cy.get<string>('@defaultBucket').then(defaultBucket => {
          cy.createCSVVariable(orgID, 'CSVVar', [
            'FirstVar',
            defaultBucket,
            'SecondVar',
          ])

          cy.fixture('routes').then(({orgs, dashboards}) => {
            cy.visit(`${orgs}/${orgID}${dashboards}/`)
            cy.getByTestID('tree-nav')
          })
        })
      })
    })

    // Select second dashboard card
    cy.getByTestID('page-contents').within(() => {
      cy.get('[data-testid="dashboard-card"]')
        .eq(1)
        .within(() => {
          cy.getByTestID('dashboard-card--name').click()
        })
    })

    // No defined variables
    // Toggle off
    cy.getByTestID('variables--button').click()
    cy.getByTestID('variables-control-bar').should('not.exist')

    // Toggle on
    cy.getByTestID('variables--button').click()
    cy.getByTestID('variables-control-bar')
      .should('be.visible')
      .and(
        'contain',
        "This dashboard doesn't have any cells with defined variables. Learn How"
      )

    // create query with variable
    cy.getByTestID('cell-context--toggle').click()
    cy.getByTestID('popover--contents')
      .contains('Configure')
      .click()
    cy.getByTestID('buckets-list')
      .contains('defbuck')
      .click()
    cy.getByTestID('selector-list m').click()
    cy.getByTestID('selector-list v').click()
    cy.getByTestID('selector-list tv1').click()
    cy.getByTestID('switch-to-script-editor').click()
    cy.getByTestID('flux-editor').should('be.visible')
    cy.get('[class="view-line"]')
      .last()
      .type('v.CSVVar')
    cy.getByTestID('save-cell--button').click()

    // With variables
    // Toggle off
    cy.getByTestID('variables--button').click()
    cy.getByTestID('variables-control-bar').should('not.exist')

    // Toggle on
    cy.getByTestID('variables--button').click()
    cy.getByTestID('variables-control-bar')
      .should('be.visible')
      .and(
        'not.contain',
        "This dashboard doesn't have any cells with defined variables. Learn How"
      )
    cy.getByTestID('variable-dropdown--CSVVar').should('be.visible')
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

    cy.get<Organization>('@org').then(({id: orgID}: Organization) => {
      cy.get('@dashboard').then(({dashboard}: any) => {
        cy.get<string>('@defaultBucket').then((defaultBucket: string) => {
          cy.createCSVVariable(orgID, bucketVarName, [
            bucketOne,
            defaultBucket,
            bucketThree,
            bucket4,
            bucket5,
          ])

          cy.createCSVVariable(orgID)
          cy.createMapVariable(orgID)
          cy.fixture('routes').then(({orgs}) => {
            cy.visit(`${orgs}/${orgID}/dashboards/${dashboard.id}`)
            cy.getByTestID('tree-nav')
          })
          // add cell with variable in its query
          cy.getByTestID('add-cell--button').click()
          cy.getByTestID('switch-to-script-editor').should('be.visible')
          cy.getByTestID('switch-to-script-editor').click()
          cy.getByTestID('flux-editor').should('be.visible')

          cy.getByTestID('toolbar-tab').click()

          // check to see if the default timeRange variables are available
          cy.get('.flux-toolbar--list-item').contains('timeRangeStart')
          cy.get('.flux-toolbar--list-item').contains('timeRangeStop')

          cy.get('.flux-toolbar--list-item')
            .eq(bucketVarIndex)
            .within(() => {
              cy.get('.cf-button').click()
            })
          cy.getByTestID('flux-editor').monacoType(' ')
          cy.getByTestID('save-cell--button').click()

          // Make sure typeAhead input box is rendered and is visible
          cy.getByTestID(
            `variable-dropdown--${bucketVarName}--typeAhead-input`
          ).should('be.visible')

          // TESTING CSV VARIABLE
          // selected value in dashboard is 1st value
          cy.getByTestID(
            `variable-dropdown--${bucketVarName}--typeAhead-input`
          ).should('have.value', bucketOne)

          cy.window()
            .pipe(getSelectedVariable(dashboard.id || '', 0))
            .should('equal', bucketOne)

          // testing variable controls
          cy.getByTestID(
            `variable-dropdown--${bucketVarName}--typeAhead-input`
          ).should('have.value', bucketOne)

          cy.getByTestID('variables--button').click()
          cy.getByTestID(`variable-dropdown--${bucketVarName}`).should(
            'not.exist'
          )
          cy.getByTestID('variables--button').click()
          cy.getByTestID(`variable-dropdown--${bucketVarName}`).should(
            'be.visible'
          )

          // sanity check on the url before beginning
          cy.location('search').should('eq', '?lower=now%28%29+-+1h')

          // select 3rd value in dashboard
          cy.getByTestID('typeAhead-dropdown--button')
            .first()
            .click()
          cy.get(`#${bucketThree}`).click()

          // selected value in dashboard is 3rd value
          cy.getByTestID(
            `variable-dropdown--${bucketVarName}--typeAhead-input`
          ).should('have.value', bucketThree)

          cy.window()
            .pipe(getSelectedVariable(dashboard.id || '', 0))
            .should('equal', bucketThree)

          // and that it updates the variable in the URL
          cy.location('search').should(
            'eq',
            `?lower=now%28%29+-+1h&vars%5BbucketsCSV%5D=${bucketThree}`
          )

          // select 2nd value in dashboard
          cy.getByTestID('typeAhead-dropdown--button')
            .first()
            .click()
          cy.get(`#${defaultBucket}`).click()

          // and that it updates the variable in the URL without breaking stuff
          cy.location('search').should(
            'eq',
            `?lower=now%28%29+-+1h&vars%5BbucketsCSV%5D=${defaultBucket}`
          )

          // start new stuff for typeAheadDropdown here:

          // type in the input!
          cy.getByTestID(
            `variable-dropdown--${bucketVarName}--typeAhead-input`
          ).clear()

          cy.getByTestID(
            `variable-dropdown--${bucketVarName}--typeAhead-input`
          ).type('an')

          // dropdown should  be showing: anotherBucket', 'randomBucket'
          cy.getByTestID('typeAhead-dropdown--item').should('have.length', 2)
          cy.getByTestID('typeAhead-dropdown--item')
            .first()
            .contains('anotherBucket')
          cy.getByTestID('typeAhead-dropdown--item')
            .last()
            .contains('randomBucket')

          // hit down arrow once:
          cy.getByTestID(
            `variable-dropdown--${bucketVarName}--typeAhead-input`
          ).type('{downarrow}')

          // first element should be active (highlighted)
          cy.get(`#anotherBucket`).should('have.class', 'active')

          // hit down arrow again
          cy.getByTestID(
            `variable-dropdown--${bucketVarName}--typeAhead-input`
          ).type('{downarrow}')

          // next one should be active (first should NOT be active)
          cy.get(`#anotherBucket`).should('not.have.class', 'active')
          cy.get(`#randomBucket`).should('have.class', 'active')

          // now; press return/enter to set it:
          cy.getByTestID(
            `variable-dropdown--${bucketVarName}--typeAhead-input`
          ).type('{enter}')

          // selected value in dashboard is 'randomBucket' value
          cy.getByTestID(
            `variable-dropdown--${bucketVarName}--typeAhead-input`
          ).should('have.value', 'randomBucket')

          cy.getByTestID(
            `variable-dropdown--${bucketVarName}--typeAhead-input`
          ).clear()

          cy.getByTestID(
            `variable-dropdown--${bucketVarName}--typeAhead-input`
          ).type('nothingM{enter}')
          cy.getByTestID(
            `variable-dropdown--${bucketVarName}--typeAhead-input`
          ).should('have.value', 'randomBucket')

          // open VEO
          cy.getByTestID('cell-context--toggle')
            .last()
            .click()
          cy.getByTestID('cell-context--configure').click()

          // selected value in cell context is 2nd value (making sure it reverts back!)
          cy.window()
            .pipe(getSelectedVariable(dashboard.id || '', 0))
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
            .pipe(getSelectedVariable(dashboard.id || '', 0))
            .should('equal', bucketOne)

          // selected value in dashboard is 1st value
          cy.getByTestID(
            `variable-dropdown--${bucketVarName}--typeAhead-input`
          ).should('have.value', bucketOne)

          cy.window()
            .pipe(getSelectedVariable(dashboard.id || '', 0))
            .should('equal', bucketOne)

          // TESTING MAP VARIABLE
          // selected value in dashboard is 1st value
          cy.getByTestID(
            `variable-dropdown--${mapTypeVarName}--typeAhead-input`
          ).should('have.value', 'k1')
          cy.window()
            .pipe(getSelectedVariable(dashboard.id || '', 2))
            .should('equal', 'v1')

          // select 2nd value in dashboard
          cy.getByTestID('typeAhead-dropdown--button')
            .eq(1)
            .click()
          cy.get(`#k2`).click()

          // selected value in dashboard is 2nd value
          cy.getByTestID(
            `variable-dropdown--${mapTypeVarName}--typeAhead-input`
          ).should('have.value', 'k2')
          cy.window()
            .pipe(getSelectedVariable(dashboard.id || '', 2))
            .should('equal', 'v2')

          // open VEO
          cy.getByTestID('cell-context--toggle')
            .last()
            .click()
          cy.getByTestID('cell-context--configure').click()
          cy.getByTestID('toolbar-tab').should('be.visible')

          // selected value in cell context is 2nd value
          cy.window()
            .pipe(getSelectedVariable(dashboard.id || '', 2))
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
            .pipe(getSelectedVariable(dashboard.id || '', 2))
            .should('equal', 'v1')

          // selected value in dashboard is 1st value
          cy.getByTestID(
            `variable-dropdown--${mapTypeVarName}--typeAhead-input`
          ).should('have.value', 'k1')
          cy.window()
            .pipe(getSelectedVariable(dashboard.id || '', 2))
            .should('equal', 'v1')

          cy.getByTestID('cell-context--toggle')
            .last()
            .click()
          cy.getByTestID('cell-context--delete').click()
          cy.getByTestID('cell-context--delete-confirm').click()
          cy.getByTestID('notification-primary').should('be.visible')
          cy.get('.cf-notification--dismiss').click()

          // create a new cell
          cy.getByTestID('add-cell--button').click()
          cy.getByTestID('switch-to-script-editor').should('be.visible')
          cy.getByTestID('switch-to-script-editor').click()
          cy.getByTestID('flux-editor').should('be.visible')

          // query for data
          cy.getByTestID('flux-editor').monacoType(`from(bucket: v.bucketsCSV)
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["_measurement"] == "m")
|> filter(fn: (r) => r["_field"] == "v")
|> filter(fn: (r) => r["tk1"] == "tv1")
|> aggregateWindow(every: v.windowPeriod, fn: max)
|> yield(name: "max")`)

          // `bucketOne` should not exist nor have data written to it
          cy.getByTestID('save-cell--button').click()
          cy.getByTestID('empty-graph-error').contains(`${bucketOne}`)

          // select default bucket that has data
          cy.getByTestID('typeAhead-dropdown--button')
            .eq(0)
            .click()
          cy.get(`#${defaultBucket}`).click()

          // assert visualization appears
          cy.getByTestID('giraffe-layer-line').should('be.visible')
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

    cy.get<Organization>('@org').then(({id: orgID}: Organization) => {
      cy.get<Dashboard>('@dashboard').then(({dashboard}: any) => {
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
          cy.getByTestID('flux-editor').monacoType(`from(bucket: v.bucketsCSV)
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["_field"] == v.greeting)
|> aggregateWindow(every: v.windowPeriod, fn: max)
|> yield(name: "max")`)
          cy.get('.flux-toolbar--list-item')
            .eq(bucketVarIndex)
            .within(() => {
              cy.get('.cf-button').click()
            })
          cy.getByTestID('save-cell--button').click()

          // ok; now check that 'b1' is selected and 'greeting' has 'adios' selected
          cy.getByTestID(
            `variable-dropdown--${bucketVarName}--typeAhead-input`
          ).should('have.value', bucketOne)

          cy.getByTestID(
            `variable-dropdown--${dependentTypeVarName}--typeAhead-input`
          ).should('have.value', 'adios')

          // hit downarrow in the second dropdown:
          cy.getByTestID(
            `variable-dropdown--${dependentTypeVarName}--typeAhead-input`
          ).type('{downarrow}')

          // check that both 'adios' and 'hola' are showing: (and with correct classes)
          cy.get(`#hola`).should('not.have.class', 'active')
          cy.get(`#adios`).should('have.class', 'active')

          // hit the down arrow again:
          cy.getByTestID(
            `variable-dropdown--${dependentTypeVarName}--typeAhead-input`
          ).type('{downarrow}')

          // check that both 'adios' and 'hola' are showing: (and with correct classes)
          cy.get(`#hola`).should('have.class', 'active')

          // 'adios' is still active b/c it is selected.....
          cy.get(`#adios`).should('have.class', 'active')

          // press enter to select:
          cy.getByTestID(
            `variable-dropdown--${dependentTypeVarName}--typeAhead-input`
          ).type('{enter}')

          // 'hola' should now be selected:
          cy.getByTestID(
            `variable-dropdown--${dependentTypeVarName}--typeAhead-input`
          ).should('have.value', 'hola')

          // ok!  now;  pick a different bucket:

          // but first test that it only allows valid values:
          cy.getByTestID(`variable-dropdown--${bucketVarName}--typeAhead-input`)
            .type('b3789')
            .type('{enter}')
            .should('have.value', 'b1')

          // while it still has the `b1' value, test the clickAwayHere functionality:

          // type in a fake value, then click away, the prev value should be showing
          cy.getByTestID(`variable-dropdown--${bucketVarName}--typeAhead-input`)
            .clear()
            .type('b3789')

          // now click away
          cy.getByTestID('typeAhead-dropdown--button')
            .eq(1)
            .click()

          cy.getByTestID(
            `variable-dropdown--${bucketVarName}--typeAhead-input`
          ).should('have.value', 'b1')

          // type in a real value, then click away, the prev value should be showing
          cy.getByTestID(`variable-dropdown--${bucketVarName}--typeAhead-input`)
            .clear()
            .type('b3')

          // now click away
          cy.getByTestID('typeAhead-dropdown--button')
            .eq(1)
            .click()

          cy.getByTestID(
            `variable-dropdown--${bucketVarName}--typeAhead-input`
          ).should('have.value', 'b1')

          // now back to testing that only valid values work:
          cy.getByTestID(`variable-dropdown--${bucketVarName}--typeAhead-input`)
            .type('b3789')
            .type('{enter}')
            .should('have.value', 'b1')

          // now clear it first and do it right:
          cy.getByTestID(`variable-dropdown--${bucketVarName}--typeAhead-input`)
            .clear()
            .type('b3')
            .type('{enter}')
            .should('have.value', 'b3')

          // now the 'greeting' should be empty
          cy.getByTestID(
            `variable-dropdown--${dependentTypeVarName}--typeAhead-input`
          ).should('have.value', '')

          // click the dropdownbutton:
          // select 2nd value in dashboard
          cy.getByTestID('typeAhead-dropdown--button')
            .eq(1)
            .click()

          // verify they are all there and with no active class:
          cy.get(`#hello`).should('not.have.class', 'active')
          cy.get(`#goodbye`).should('not.have.class', 'active')
          cy.get(`#seeya`).should('not.have.class', 'active')

          cy.getByTestID(
            `variable-dropdown--${dependentTypeVarName}--typeAhead-input`
          )
            .type('el')
            .type('{downarrow}')
            .type('{enter}')

          cy.getByTestID(
            `variable-dropdown--${dependentTypeVarName}--typeAhead-input`
          ).should('have.value', 'hello')

          // ok; now switch to a bucket with NO greeting vars; test that:

          cy.getByTestID(`variable-dropdown--${bucketVarName}--typeAhead-input`)
            .clear()
            .type('random')
            .type('{downarrow}')
            .type('{enter}')
            .should('have.value', bucket5)

          // the greeting vars should NOT be there
          cy.getByTestID(`variable-dropdown--${dependentTypeVarName}`)
            .click()
            .should('contain', 'No results')

          // now, go back to b3; 'hello' should be th eselected greeting
          cy.getByTestID(`variable-dropdown--${bucketVarName}--typeAhead-input`)
            .clear()
            .type('b3')
            .type('{downarrow}')
            .type('{enter}')
            .should('have.value', bucketThree)

          cy.getByTestID(
            `variable-dropdown--${dependentTypeVarName}--typeAhead-input`
          ).should('have.value', 'hello')
        })
      })
    })
  })

  it('ensures that dependent variables load one another accordingly, even with reload and cleared local storage', () => {
    cy.get<Organization>('@org').then(({id: orgID}: Organization) => {
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
          cy.getByTestID('flux-editor').should('be.visible')
          cy.getByTestID('toolbar-tab').click()

          cy.getByTestID('flux-editor').monacoType(`from(bucket: v.static)
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["_measurement"] == "test")
|> filter(fn: (r) => r["_field"] == "dopeness")
|> filter(fn: (r) => r["container_name"] == v.build)`)

          cy.getByTestID('save-cell--button').click({force: true})

          // the default bucket selection should have no results and load all three variables
          // even though only two variables are being used (because 1 is dependent upon another)
          cy.getByTestID('variable-dropdown--static--typeAhead-input').should(
            'have.value',
            'beans'
          )

          // and cause the rest to exist in loading states
          cy.getByTestID('variable-dropdown--dependent')
            .click()
            .should('contain', 'No results')
          cy.getByTestID('variable-dropdown--build')
            .click()
            .should('contain', 'No results')

          // Error notifications should tell the user that these failed
          cy.getByTestID('notification-error').should('have.length', 2)
          cy.getByTestID('notification-error')
            .first()
            .contains('could not find bucket "beans"')
          cy.getByTestID('notification-error')
            .last()
            .contains('could not find bucket "beans"')
          cy.getByTestID('notification-error--dismiss').click({
            multiple: true,
          })

          cy.getByTestIDSubStr('cell--view-empty').should('be.visible')

          // But selecting a nonempty bucket should load some data
          cy.getByTestID('typeAhead-dropdown--button')
            .first()
            .click()
          cy.get(`#${defaultBucket}`).click()

          // default select the first result
          cy.getByTestID('variable-dropdown--build--typeAhead-input').should(
            'have.value',
            'beans'
          )
          cy.getByTestID(
            'variable-dropdown--dependent--typeAhead-input'
          ).should('have.value', 'beans')

          // updating the third variable should update the second
          cy.getByTestID('typeAhead-dropdown--button')
            .last()
            .click()
          cy.get(`#cool`).click()
          cy.getByTestID(
            'variable-dropdown--dependent--typeAhead-input'
          ).should('have.value', 'cool')

          cy.getByTestID('typeAhead-dropdown--button')
            .last()
            .click()
          cy.get(`#beans`).click()
          cy.getByTestID('variable-dropdown--build--typeAhead-input').should(
            'have.value',
            'beans'
          )
        })
        cy.clearLocalStorage()
        cy.reload()

        // wait for variable control bar to load after the reload
        cy.getByTestID('tree-nav').should('be.visible')
        cy.getByTestID('variables-control-bar').should('be.visible')

        // the default bucket selection should have no results and load all three variables
        // even though only two variables are being used (because 1 is dependent upon another)

        cy.getByTestID('variable-dropdown--static--typeAhead-input').should(
          'have.value',
          'defbuck'
        )

        // and cause the rest to exist in loading states

        cy.getByTestID('variable-dropdown--build--typeAhead-input').should(
          'have.value',
          'beans'
        )

        cy.getByTestID('variable-dropdown--dependent--typeAhead-input').should(
          'have.value',
          'beans'
        )
      })
    })
  })

  it('can load dependent queries without much fuss', () => {
    cy.get<Organization>('@org').then(({id: orgID}: Organization) => {
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
      cy.getByTestID('flux-editor').should('be.visible')
      cy.getByTestID('toolbar-tab').click()

      cy.getByTestID('flux-editor').monacoType(`from(bucket: v.static)
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["_measurement"] == "test")
|> filter(fn: (r) => r["_field"] == "dopeness")
|> filter(fn: (r) => r["container_name"] == v.dependent)`)
      cy.getByTestID('save-cell--button').click()

      // the default bucket selection should have no results
      cy.getByTestID('variable-dropdown--static--typeAhead-input').should(
        'have.value',
        'beans'
      )

      // and cause the rest to exist in error states
      cy.getByTestID('variable-dropdown--dependent')
        .click()
        .should('contain', 'No results')

      // An error notification should tell the user that this failed
      cy.getByTestID('notification-error').contains(
        'could not find bucket "beans"'
      )
      cy.getByTestID('notification-error--dismiss').click()

      cy.getByTestIDSubStr('cell--view-empty').should('be.visible')
      cy.getByTestID('giraffe-layer-line').should('not.exist')

      // But selecting a nonempty bucket should load some data
      cy.getByTestID('typeAhead-dropdown--button')
        .first()
        .click()
      cy.get(`#${defaultBucket}`).click()

      // default select the first result
      cy.getByTestID('variable-dropdown--dependent--typeAhead-input').should(
        'have.value',
        'beans'
      )
      cy.getByTestID('giraffe-layer-line').should('be.visible')

      // and also load the second result
      cy.getByTestID('typeAhead-dropdown--button')
        .last()
        .click()
      cy.get(`#cool`).click()
      cy.getByTestID('giraffe-layer-line').should('be.visible')
    })
  })
})
