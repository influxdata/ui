import {Organization} from '../../../src/types'

const DEFAULT_SQL_EDITOR_TEXT = '/* Start by typing SQL here */'

const DELAY_FOR_LAZY_LOAD_EDITOR = 30000

describe('Script Builder', () => {
  const bucketName = 'defbuck-sql'
  const anotherBucketName = 'defbuck-sql-another'
  const measurement = 'ndbc'
  const fieldName = 'air_degrees'
  const fieldName2 = 'humidity'
  const tagKey = 'air_station_id'
  const tagValue = 'ST01'
  const tagValue2 = 'ST02'

  const selectSchema = () => {
    cy.log('select bucket')
    cy.selectScriptBucket(bucketName)
    cy.confirmSyncIsOn() // SQL composition is dumb. On bucket selection, it will occasionally drop the sync.
    cy.log('writes empty query statement with only the timerange')
    cy.getByTestID('sql-editor', {
      timeout: DELAY_FOR_LAZY_LOAD_EDITOR,
    }).contains(`SELECT *`)
    cy.getByTestID('sql-editor').contains(`WHERE`)
    cy.getByTestID('sql-editor').contains(`time >= now() - interval '1 hour'`)
    cy.confirmSyncIsOn() // sql sync sometimes toggles off

    cy.log('select measurement')
    cy.selectScriptMeasurement(measurement)
  }

  const confirmSchemaComposition = () => {
    cy.log('has basic query')
    cy.getByTestID('sql-editor', {
      timeout: DELAY_FOR_LAZY_LOAD_EDITOR,
    }).contains(`SELECT *`)
    cy.getByTestID('sql-editor').contains(`WHERE`)
    cy.getByTestID('sql-editor').contains(`time >= now() - interval '1 hour'`)

    cy.log('has measurement chosen as a table')
    cy.getByTestID('sql-editor').contains(`FROM "${measurement}"`)
    cy.getByTestID('sql-editor').within(() => {
      cy.get('.composition-sync--on').should('have.length', 4)
    })

    cy.log('does not have other fields or tag filters')
    cy.getByTestID('sql-editor').should('not.contain', 'AND')
  }

  before(() => {
    const generateWriteData = (value: number) => {
      return [
        `${measurement},${tagKey}=${tagValue} ${fieldName}=${value}`,
        `${measurement},${tagKey}=${tagValue} ${fieldName2}=${value}`,
        `${measurement},${tagKey}=${tagValue2} ${fieldName}=${value}`,
        `${measurement},${tagKey}=${tagValue2} ${fieldName2}=${value}`,
      ]
    }

    cy.flush().then(() => {
      return cy.signin().then(() => {
        return cy.get('@org').then(({id, name}: Organization) => {
          cy.log('add mock data')
          cy.createBucket(id, name, bucketName)
          cy.createBucket(id, name, anotherBucketName)

          cy.log('create time series, with change of value over time')
          cy.writeData(generateWriteData(100), bucketName)
          cy.wait(2000)
          cy.writeData(generateWriteData(20), bucketName)
          cy.writeData(generateWriteData(20), anotherBucketName)
        })
      })
    })
  })

  beforeEach(() => {
    cy.scriptsLoginWithFlags({}).then(() => {
      cy.clearSqlScriptSession()
      cy.getByTestID('editor-sync--toggle')
      cy.getByTestID('sql-editor', {timeout: DELAY_FOR_LAZY_LOAD_EDITOR})
    })
  })

  describe('Schema Composition', () => {
    describe('basic functionality', () => {
      it('can construct a composition with fields', () => {
        cy.log('empty editor text')
        cy.getByTestID('sql-editor').monacoType('{selectAll}{del}')

        cy.log('select bucket and measurement')
        selectSchema()
        cy.confirmSyncIsOn() // SQL composition is dumb. On bucket selection, it will occasionally drop the sync.
        confirmSchemaComposition()

        cy.log('select field --> adds to composition')
        cy.selectScriptFieldOrTag(fieldName, true)
        cy.getByTestID('sql-editor').contains(`("${fieldName}" IS NOT NULL)`)
        cy.selectScriptFieldOrTag(fieldName2, true)
        cy.getByTestID('sql-editor').contains(
          `("${fieldName}" IS NOT NULL OR "${fieldName2}" IS NOT NULL)`
        )

        cy.log('select field --> removes from composition')
        cy.selectScriptFieldOrTag(fieldName2, false)
        cy.wait(1000)
        cy.getByTestID('sql-editor').contains(`("${fieldName}" IS NOT NULL)`)
        cy.getByTestID('sql-editor').within(() => {
          cy.get('textarea.inputarea').should('not.contain', fieldName2)
        })
      })

      it('can construct a composition with tagValues', () => {
        cy.log('empty editor text')
        cy.getByTestID('sql-editor').monacoType('{selectAll}{del}')

        cy.log('select bucket and measurement')
        selectSchema()
        cy.confirmSyncIsOn() // SQL composition is dumb. On bucket selection, it will occasionally drop the sync.
        confirmSchemaComposition()

        cy.log('select tagValue --> adds to composition')
        cy.getByTestID('container-side-bar--tag-keys').within(() => {
          cy.getByTestID('accordion-header').should('be.visible').click()
        })
        cy.selectScriptFieldOrTag(tagValue, true)
        cy.getByTestID('sql-editor').contains(`"${tagKey}" IN ('${tagValue}')`)

        cy.log('select tagValue --> removes from composition')
        cy.selectScriptFieldOrTag(tagValue, false)
        cy.wait(1000)
        cy.getByTestID('sql-editor').within(() => {
          cy.get('textarea.inputarea').should('not.contain', tagKey)
        })
      })

      it('will empty the default text on first bucket selection', () => {
        cy.log('start with default text')
        cy.getByTestID('sql-editor').within(() => {
          cy.get('textarea.inputarea').should(
            'have.value',
            DEFAULT_SQL_EDITOR_TEXT
          )
        })

        cy.log('select bucket')
        cy.selectScriptBucket(bucketName)
        cy.confirmSyncIsOn() // SQL composition is dumb. On bucket selection, it will occasionally drop the sync.
        cy.log('writes empty query statement with only the timerange')
        cy.getByTestID('sql-editor').contains(`SELECT *`)
        cy.getByTestID('sql-editor').contains(`WHERE`)
        cy.getByTestID('sql-editor').contains(
          `time >= now() - interval '1 hour'`
        )

        cy.getByTestID('sql-editor').should(
          'not.contain',
          DEFAULT_SQL_EDITOR_TEXT
        )
      })
    })

    describe('sync and resetting behavior:', () => {
      it('sync defaults to on. Can be toggled on/off. And can diverge (be disabled).', () => {
        cy.log('starts as synced')
        cy.getByTestID('editor-sync--toggle').should('have.class', 'active')

        cy.log('empty editor text')
        cy.getByTestID('sql-editor').monacoType('{selectAll}{del}')

        cy.log('make a composition')
        selectSchema()
        cy.confirmSyncIsOn() // SQL composition is dumb. On bucket selection, it will occasionally drop the sync.
        confirmSchemaComposition()

        cy.log('sync toggles on and off, with matching styles')
        cy.get('.composition-sync--on').should('have.length', 4)
        cy.get('.composition-sync--off').should('have.length', 0)
        cy.getByTestID('editor-sync--toggle')
          .should('have.class', 'active')
          .click()
          .should('not.have.class', 'active')
        cy.get('.composition-sync--on').should('have.length', 0)
        cy.get('.composition-sync--off').should('have.length', 4)
        cy.getByTestID('editor-sync--toggle')
          .click()
          .should('have.class', 'active')
        cy.get('.composition-sync--on').should('have.length', 4)
        cy.get('.composition-sync--off').should('have.length', 0)

        cy.log('turn off editor sync')
        cy.getByTestID('editor-sync--toggle')
          .click()
          .should('not.have.class', 'active')

        cy.log('can still browse schema while not synced')
        cy.selectScriptBucket(anotherBucketName)
      })

      it('should clear the editor text and schema browser, with a new script', () => {
        cy.getByTestID('sql-editor', {timeout: DELAY_FOR_LAZY_LOAD_EDITOR})

        cy.log('modify schema browser')
        selectSchema()

        cy.log('editor text contains the composition')
        confirmSchemaComposition()

        cy.log('click new script, and choose to delete current script')
        cy.clearSqlScriptSession()
      })

      it('should not be able to modify the composition when unsynced, yet still modify the session -- which updates the composition when re-synced', () => {
        cy.log('turn off sync')
        cy.getByTestID('editor-sync--toggle')
          .should('have.class', 'active')
          .click()
        cy.getByTestID('editor-sync--toggle').should('not.have.class', 'active')

        cy.log('modify schema browser')
        cy.selectScriptBucket(bucketName)
        cy.selectScriptMeasurement(measurement)

        cy.log('editor text is still empty')
        cy.getByTestID('sql-editor').within(() => {
          cy.get('textarea.inputarea').should(
            'have.value',
            DEFAULT_SQL_EDITOR_TEXT
          )
        })

        cy.log('turn on sync')
        cy.getByTestID('editor-sync--toggle')
          .should('not.have.class', 'active')
          .click()
        cy.getByTestID('editor-sync--toggle').should('have.class', 'active')

        cy.log('editor text contains the composition')
        confirmSchemaComposition()
      })
    })
  })

  describe('SQL-specific visualization handling:', () => {
    const CSV_PARSING = 2000

    beforeEach(() => {
      cy.intercept('POST', '/api/v2/query?*').as('graph-subQuery')

      cy.log('empty editor text')
      cy.getByTestID('sql-editor').monacoType(
        '{selectAll}{del}{rightArrow}{enter}'
      )

      cy.log('select bucket and measurement')
      selectSchema()
      cy.confirmSyncIsOn() // SQL composition is dumb. On bucket selection, it will occasionally drop the sync.
      confirmSchemaComposition()

      cy.log('run query, and switch to graph view')
      cy.getByTestID('time-machine-submit-button')
        .should('be.visible')
        .should('not.have.class', 'cf-button--disabled')
      cy.getByTestID('time-machine-submit-button').click()
      cy.getByTestID('data-explorer-results--view').should('be.visible') // parent table query
      cy.getByTestID('data-explorer-results--view', {
        timeout: CSV_PARSING,
      }).contains(tagKey)
      cy.wait('@graph-subQuery')
      cy.wait(CSV_PARSING)
      cy.getByTestID('data-explorer-results--graph-view')
        .should('be.visible')
        .click()
      cy.getByTestID('giraffe-inner-plot').should('be.visible')
    })

    it('handles all supported visualizations', () => {
      const testGraph = ({id, canvasId}) => {
        cy.log(`TESTING GRAPH VIEW: ${id}`)
        cy.getByTestID('view-type--dropdown').should('be.visible').click()
        cy.getByTestID(`view-type--${id}`).click({force: true}) // may be in hidden/scrolled menu item

        // BASE CASE
        cy.log(`Rendering ${id} chart`)
        cy.getByTestID('giraffe-inner-plot').should('be.visible')
        cy.getByTestID('giraffe-inner-plot').within(() => {
          cy.getByTestID(canvasId).should('exist')
        })

        // SMOOTHING ON
        cy.log(`Rendering ${id} chart: does not break with smoothing applied`)
        cy.getByTestID('view-options--smoothing-toggle').should(
          'have.class',
          'active'
        )
        cy.getByTestID('giraffe-inner-plot').should('be.visible')
        cy.getByTestID('giraffe-inner-plot').within(() => {
          cy.getByTestID(canvasId).should('exist')
        })
        cy.log('    --> proper X and Y axis are chosen')
        if (id !== 'histogram') {
          cy.getByTestID('dropdown-x').within(() => {
            cy.getByTestID('dropdown--button').contains('_time')
          })
          cy.getByTestID('dropdown-y').within(() => {
            cy.getByTestID('dropdown--button').contains('_value')
          })
        } else {
          cy.getByTestID('dropdown-x').within(() => {
            cy.getByTestID('dropdown--button').contains('_value')
          })
          cy.getByTestID('dropdown-y').should('not.exist')
        }
        cy.log('    --> choosing another axis for smoothing')
        cy.getByTestID('view-options--smoothing--selector-list').within(() => {
          cy.getByTestID('selector-list--dropdown-button')
            .should('be.visible')
            .click()
          cy.getByTestID(`selector-list ${fieldName}`)
            .should('be.visible')
            .click()
        })
        cy.wait('@graph-subQuery')
        cy.wait(CSV_PARSING)
        cy.getByTestID('giraffe-inner-plot').should('be.visible')
        cy.getByTestID('giraffe-inner-plot').within(() => {
          cy.getByTestID(canvasId).should('exist')
        })

        // SMOOTHING OFF
        cy.log(
          `Rendering ${id} chart: does not break with smoothing turned off`
        )
        cy.getByTestID('view-options--smoothing-toggle')
          .should('be.visible')
          .click()
        cy.wait('@graph-subQuery')
        cy.wait(CSV_PARSING)
        cy.getByTestID('view-options--smoothing-toggle').should(
          'not.have.class',
          'active'
        )
        cy.log('    --> graph is rendered')
        cy.getByTestID('giraffe-inner-plot').should('be.visible')
        cy.getByTestID('giraffe-inner-plot').within(() => {
          cy.getByTestID(canvasId).should('exist')
        })
        cy.log('    --> proper X and Y axis are chosen')
        if (id !== 'histogram') {
          cy.getByTestID('dropdown-x').within(() => {
            cy.getByTestID('dropdown--button').contains('time')
          })
          cy.getByTestID('dropdown-y').within(() => {
            cy.getByTestID('dropdown--button').contains(fieldName)
          })
        } else {
          cy.getByTestID('dropdown-x').within(() => {
            cy.getByTestID('dropdown--button').contains(fieldName)
          })
          cy.getByTestID('dropdown-y').should('not.exist')
        }

        // GROUPING
        cy.log(`Rendering ${id} chart: does not break with no grouping`)
        // turn off grouping
        cy.getByTestID('view-options--grouping--selector-list').within(() => {
          cy.getByTestID('selector-list--dropdown-button')
            .should('exist')
            .click({force: true})
          cy.getByTestID(`selector-list ${tagKey}`)
            .should('exist')
            .click({force: true})
        })
        cy.wait('@graph-subQuery')
        cy.wait(CSV_PARSING)
        // look at graph view
        cy.getByTestID('giraffe-inner-plot').should('be.visible')
        cy.getByTestID('giraffe-inner-plot').within(() => {
          cy.getByTestID(canvasId).should('exist')
        })

        // RESET
        cy.log('reset for next testGraph() in series')
        // reset smoothing
        cy.getByTestID('view-options--smoothing-toggle').click()
        cy.wait('@graph-subQuery')
        cy.wait(CSV_PARSING)
        cy.getByTestID('view-options--smoothing-toggle').should(
          'have.class',
          'active'
        )
        // reset grouping
        cy.getByTestID('view-options--grouping--selector-list').within(() => {
          cy.getByTestID('selector-list--dropdown-button')
            .should('exist')
            .click({force: true})
          cy.getByTestID(`selector-list ${tagKey}`)
            .should('exist')
            .click({force: true})
        })
        cy.wait('@graph-subQuery')
        cy.wait(CSV_PARSING)
        cy.getByTestID('view-options--grouping--selector-list').within(() => {
          cy.getByTestID('selector-list--dropdown-button')
            .should('exist')
            .click({force: true})
          cy.getByTestID('selector-list--dropdown-button').should(
            'have.class',
            'active'
          )
        })
      }

      const testTable = ({id}) => {
        cy.log(`TESTING TABLE-IN-GRAPH VIEW: ${id}`)
        cy.getByTestID('view-type--dropdown').should('be.visible').click()
        cy.getByTestID(`view-type--${id}`).click({force: true}) // may be in hidden/scrolled menu item

        // BASE CASE
        cy.log(`Rendering ${id} table-graph`)
        cy.get('.giraffe-plot').should('be.visible').contains(tagKey)

        // SMOOTHING ON
        cy.log(`Rendering ${id} table: does not break with smoothing applied`)
        cy.getByTestID('view-options--smoothing-toggle').should(
          'have.class',
          'active'
        )
        cy.get('.giraffe-plot').contains('_value')
        cy.get('.giraffe-plot').contains('_time')

        // SMOOTHING OFF
        cy.log(
          `Rendering ${id} table: does not break with smoothing turned off`
        )
        cy.getByTestID('view-options--smoothing-toggle')
          .should('be.visible')
          .click()
        cy.wait('@graph-subQuery')
        cy.wait(CSV_PARSING)
        cy.getByTestID('view-options--smoothing-toggle').should(
          'not.have.class',
          'active'
        )
        cy.get('.giraffe-plot').contains(fieldName)
        cy.get('.giraffe-plot').contains('time')

        // GROUPING
        cy.log(`Rendering ${id} table: does not break with no grouping`)
        // turn off grouping
        cy.getByTestID('view-options--grouping--selector-list').within(() => {
          cy.getByTestID('selector-list--dropdown-button')
            .should('exist')
            .click({force: true})
          cy.getByTestID(`selector-list ${tagKey}`)
            .should('exist')
            .click({force: true})
        })
        cy.wait('@graph-subQuery')
        cy.wait(CSV_PARSING)
        // look at table view
        cy.get('.giraffe-plot').contains(fieldName)
        cy.get('.giraffe-plot').contains('time')

        // RESET
        cy.log('reset for next testGraph() in series')
        // reset smoothing
        cy.getByTestID('view-options--smoothing-toggle').click()
        cy.wait('@graph-subQuery')
        cy.wait(CSV_PARSING)
        cy.getByTestID('view-options--smoothing-toggle').should(
          'have.class',
          'active'
        )
        // reset grouping
        cy.getByTestID('view-options--grouping--selector-list').within(() => {
          cy.getByTestID('selector-list--dropdown-button')
            .should('exist')
            .click({force: true})
          cy.getByTestID(`selector-list ${tagKey}`)
            .should('exist')
            .click({force: true})
        })
        cy.wait('@graph-subQuery')
        cy.wait(CSV_PARSING)
        cy.getByTestID('view-options--grouping--selector-list').within(() => {
          cy.getByTestID('selector-list--dropdown-button')
            .should('exist')
            .click({force: true})
          cy.getByTestID('selector-list--dropdown-button').should(
            'have.class',
            'active'
          )
        })
      }

      const graphsToTest = [
        {id: 'band', canvasId: 'giraffe-layer-band-chart', testFun: testGraph},
        {id: 'xy', canvasId: 'giraffe-layer-line', testFun: testGraph},
        {id: 'heatmap', canvasId: 'giraffe-layer-rect', testFun: testGraph},
        {id: 'scatter', canvasId: 'giraffe-layer--scatter', testFun: testGraph},
        {id: 'histogram', canvasId: 'giraffe-layer-rect', testFun: testGraph},
        {
          id: 'line-plus-single-stat',
          canvasId: 'giraffe-layer-line',
          testFun: testGraph,
        },
        {id: 'simple-table', testFun: testTable},
        {id: 'table', testFun: testTable},
      ]

      graphsToTest.forEach(graphConfig =>
        graphConfig.testFun(graphConfig as any)
      )
    })
  })
})
