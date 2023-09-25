import {Organization} from '../../../src/types'

const DEFAULT_INFLUXQL_EDITOR_TEXT = '/* Start by typing InfluxQL here */'

const DELAY_FOR_LAZY_LOAD_EDITOR = 30000
const DELAY_FOR_FILE_DOWNLOAD = 5000
const NUMBER_OF_ROWS = 5 // see `generateWriteData` for why this number

describe('Script Builder', () => {
  const bucketName = 'bucket-influxql'
  const databaseName = 'database-name'
  const retentionPolicyName = 'retention-policy-name'
  const measurement = 'ndbc'
  const fieldName = 'air_degrees'
  const fieldName2 = 'humidity'
  const tagKey = 'air_station_id'
  const tagValue = 'ST01'
  const tagValue2 = 'ST02'
  let route: string

  const selectScriptDBRP = (dbName: string, rpName: string) => {
    const dbrpName: string = `${dbName}/${rpName}`
    cy.getByTestID('dbrp-selector--dropdown-button').click()
    cy.getByTestID(`dbrp-selector--dropdown--${dbrpName}`).click()
    cy.getByTestID('dbrp-selector--dropdown-button').should(
      'contain',
      `${dbrpName}`
    )
  }

  const selectSchema = () => {
    cy.log('select database/retention policy')
    selectScriptDBRP(databaseName, retentionPolicyName)
    cy.confirmSyncIsOn() // influxql composition is dumb. On bucket selection, it will occasionally drop the sync.
    cy.log('writes empty query statement with only the timerange')
    cy.getByTestID('influxql-editor', {
      timeout: DELAY_FOR_LAZY_LOAD_EDITOR,
    }).contains(`SELECT *`)
    cy.getByTestID('influxql-editor').contains(`WHERE`)
    cy.getByTestID('influxql-editor').contains(`time >= now() - 1h`)
    cy.confirmSyncIsOn() // influxql sync sometimes toggles off

    cy.log('select measurement')
    cy.selectScriptMeasurement(measurement)
  }

  const confirmSchemaComposition = () => {
    cy.log('has basic query')
    cy.getByTestID('influxql-editor', {
      timeout: DELAY_FOR_LAZY_LOAD_EDITOR,
    }).contains(`SELECT *`)
    cy.getByTestID('influxql-editor').contains(`WHERE`)
    cy.getByTestID('influxql-editor').contains(`time >= now() - 1h`)

    cy.log('has measurement chosen as a table')
    cy.getByTestID('influxql-editor').contains(
      `FROM "${databaseName}"."${retentionPolicyName}"."${measurement}"`
    )
    cy.getByTestID('influxql-editor').within(() => {
      cy.log('have four lines of query')
      cy.get('.composition-sync--on').should('have.length', 4)
    })

    cy.log('does not have other fields or tag filters')
    cy.getByTestID('influxql-editor').should('not.contain', 'AND')
  }

  const typeInQuery = () => {
    cy.log('type in a query')
    cy.getByTestID('influxql-editor').monacoType(
      `{selectall}{del}SELECT * FROM "${databaseName}"."${retentionPolicyName}"."${measurement}"`
    )
    cy.getByTestID('influxql-editor').contains(
      `SELECT * FROM "${databaseName}"."${retentionPolicyName}"."${measurement}"`
    )
  }

  before(() => {
    const generateWriteData = (value: number) => {
      // this will generate a table of 5 rows in csv format
      // 1 row of table header + 4 rows of data
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
          route = `/orgs/${id}/data-explorer`

          cy.log('add mock data')
          cy.createBucket(id, name, bucketName).should(response => {
            expect(response.body).to.have.property('id')
            const bucketID: string = response.body['id']
            cy.createDBRP(
              bucketID,
              databaseName,
              retentionPolicyName,
              id
            ).should(response => {
              expect(response.status).to.eq(201)
              cy.log('a DBRP mapping is created')
            })
          })

          cy.log('create time series, with change of value over time')
          cy.writeData(generateWriteData(100), bucketName)
          cy.wait(2000)
          cy.writeData(generateWriteData(20), bucketName)
        })
      })
    })
  })

  beforeEach(() => {
    cy.scriptsLoginWithFlags({}).then(() => {
      cy.clearInfluxQLScriptSession()
      cy.getByTestID('editor-sync--toggle')
      cy.getByTestID('influxql-editor', {timeout: DELAY_FOR_LAZY_LOAD_EDITOR})
    })
  })

  describe('Schema Composition', () => {
    it('can construct a composition with fields and tagValues', () => {
      cy.log('start with default text')
      cy.getByTestID('influxql-editor').within(() => {
        cy.get('textarea.inputarea').should(
          'have.value',
          DEFAULT_INFLUXQL_EDITOR_TEXT
        )
      })

      cy.log(
        'disable run button before selecting a database/retention policy mapping'
      )
      cy.getByTestID('time-machine-submit-button').should('be.disabled')

      cy.log('select database/retention policy')
      selectScriptDBRP(databaseName, retentionPolicyName)

      cy.log('the default text should be gone')
      cy.getByTestID('influxql-editor').should(
        'not.contain',
        DEFAULT_INFLUXQL_EDITOR_TEXT
      )

      cy.log(
        'enable run button after selecting a database and retention policy mapping'
      )
      cy.getByTestID('time-machine-submit-button').should('not.be.disabled')

      cy.log('select measurement')
      cy.selectScriptMeasurement(measurement)

      confirmSchemaComposition()

      cy.log('select field --> add to composition')
      cy.selectScriptFieldOrTag(fieldName, true)
      cy.getByTestID('influxql-editor').contains(`SELECT "${fieldName}"`)
      cy.selectScriptFieldOrTag(fieldName2, true)
      cy.getByTestID('influxql-editor').contains(
        `SELECT "${fieldName}", "${fieldName2}"`
      )

      cy.log('select field --> remove from composition')
      cy.selectScriptFieldOrTag(fieldName2, false)
      cy.getByTestID('influxql-editor').contains(`SELECT "${fieldName}"`)
      cy.getByTestID('influxql-editor').should('not.contain', fieldName2)

      cy.log('select tagValue --> add to composition')
      cy.getByTestID('container-side-bar--tag-keys').within(() => {
        cy.getByTestID('accordion-header').should('be.visible').click()
      })
      cy.selectScriptFieldOrTag(tagValue, true)
      cy.getByTestID('influxql-editor').contains(
        `("${tagKey}" = '${tagValue}')`
      )

      cy.log('select tagValue --> remove from composition')
      cy.selectScriptFieldOrTag(tagValue, false)
      cy.getByTestID('influxql-editor').should('not.contain', tagKey)
    })

    it('composition sync functionality', () => {
      cy.log('default to be on')
      cy.getByTestID('editor-sync--toggle').should('have.class', 'active')

      cy.log('make a composition')
      selectSchema()
      confirmSchemaComposition()

      cy.log('sync toggles on, with matching styles')
      cy.get('.composition-sync--on').should('have.length', 4)
      cy.get('.composition-sync--off').should('have.length', 0)

      cy.log('sync toggles off, with matching styles')
      cy.getByTestID('editor-sync--toggle')
        .should('have.class', 'active')
        .click()
        .should('not.have.class', 'active')
      cy.get('.composition-sync--on').should('have.length', 0)
      cy.get('.composition-sync--off').should('have.length', 4)

      cy.log('can still browse schema while not synced, with matching styles')
      selectScriptDBRP(databaseName, retentionPolicyName)
      cy.selectScriptMeasurement(measurement)
      cy.get('.composition-sync--on').should('have.length', 0)
      cy.get('.composition-sync--off').should('have.length', 4)

      cy.log('sync toggles on')
      cy.getByTestID('editor-sync--toggle')
        .click()
        .should('have.class', 'active')
      cy.get('.composition-sync--on').should('have.length', 4)
      cy.get('.composition-sync--off').should('have.length', 0)
    })
  })

  describe('Other Core Features', () => {
    const CSV_PARSING: number = 2000

    it('Run query', () => {
      cy.getByTestID('time-machine-submit-button')
        .should('be.visible')
        .should('be.disabled')

      selectScriptDBRP(databaseName, retentionPolicyName)
      typeInQuery()

      cy.log('can execute the query')
      cy.getByTestID('time-machine-submit-button')
        .should('be.visible')
        .should('not.have.class', 'cf-button--disabled')
      cy.getByTestID('time-machine-submit-button').click()

      cy.log('result view shows table')
      cy.getByTestID('data-explorer-results--view').should('be.visible')
      cy.getByTestID('data-explorer-results--view', {
        timeout: CSV_PARSING,
      }).contains(tagKey)

      cy.log('should not have graph tab')
      cy.getByTestID('data-explorer-results--graph-view').should('not.exist')
    })

    it('Save/Load as an InfluxQL Script', () => {
      // The save/load functionality works the same for all the languages
      // (i.e. Flux, SQL, InfluxQL) at the backend, and the file
      // `scriptQueryBuilder.scriptsCrud.test.ts` has already include a
      // full coverage in general, so we are just doing a simple test
      // for InfluxQL save/load support here
      const scriptName: string = 'InfluxQL script'
      cy.intercept('POST', '/api/v2/scripts*').as('scripts')

      cy.log('save an InfluxQL query')
      typeInQuery()
      cy.getByTestID('script-query-builder--save-script')
        .should('be.visible')
        .click()
      cy.getByTestID('overlay--container').within(() => {
        cy.getByTestID('save-script-name__input')
          .should('be.visible')
          .type(scriptName)
        cy.getByTestID('script-query-builder--save')
          .should('be.visible')
          .click()
      })

      cy.log('check the script is saved successfully')
      cy.wait('@scripts')
      cy.getByTestID('notification-success')
        .should('be.visible')
        .contains(scriptName)
    })

    it('Download CSV', () => {
      // The csv download functionality works the same for all the languages
      // (i.e. Flux, SQL, InfluxQL), and the file `scriptQueryBuilder.result.test.ts`
      // has already include a full coverage in general, so we are just doing a
      // simple test for InfluxQL csv download here
      cy.intercept('POST', '/query?*', req => {
        req.redirect(route)
      }).as('queryDownloadCSV')

      cy.getByTestID('csv-download-button')
        .should('be.visible')
        .should('be.disabled')

      selectScriptDBRP(databaseName, retentionPolicyName)
      typeInQuery()

      cy.log('will download complete csv data')
      cy.getByTestID('csv-download-button').should('not.be.disabled').click()
      cy.wait('@queryDownloadCSV', {timeout: DELAY_FOR_FILE_DOWNLOAD})
        .its('request', {timeout: DELAY_FOR_FILE_DOWNLOAD})
        .then(req => {
          cy.request(req)
            .then(({body, headers}) => {
              expect(headers).to.have.property(
                'content-type',
                'text/csv; charset=utf-8'
              )
              return Promise.resolve(body)
            })
            .then((csv: string) => {
              cy.wrap(csv)
                .then(doc => doc.trim().split('\n'))
                .then((list: string[]) => {
                  expect(list.length).eq(NUMBER_OF_ROWS)
                })
            })
        })
    })
  })
})
