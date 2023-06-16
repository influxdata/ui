import {Organization} from '../../../src/types'

const DEFAULT_INFLUXQL_EDITOR_TEXT = '/* Start by typing InfluxQL here */'

const DELAY_FOR_LAZY_LOAD_EDITOR = 30000

describe('Script Builder -- InfluxQL', () => {
  const bucketName = 'defbuck-influxql'
  const databaseName = 'def-database'
  const retentionPolicyName = 'def-retention-policy-name'
  const anotherBucketName = 'defbuck-influxql-another'
  const measurement = 'ndbc'
  const fieldName = 'air_degrees'
  const fieldName2 = 'humidity'
  const tagKey = 'air_station_id'
  const tagValue = 'ST01'
  const tagValue2 = 'ST02'

  const selectScriptDBRP = (dbName: string, rpName: string) => {
    const dbrpName: string = `${dbName}/${rpName}`
    cy.getByTestID('dbrp-selector--dropdown-button').click()
    cy.getByTestID(`dbrp-selector--dropdown--${dbrpName}`).click()
    cy.getByTestID('dbrp-selector--dropdown-button').should(
      'contain',
      `${dbrpName}`
    )
  }

  // const selectSchema = () => {
  //   cy.log('select database/retention policy')
  //   selectScriptDBRP(databaseName, retentionPolicyName)
  //   cy.confirmSyncIsOn() // influxql composition is dumb. On bucket selection, it will occasionally drop the sync.
  //   cy.log('writes empty query statement with only the timerange')
  //   cy.getByTestID('influxql-editor', {
  //     timeout: DELAY_FOR_LAZY_LOAD_EDITOR,
  //   }).contains(`SELECT *`)
  //   cy.getByTestID('influxql-editor').contains(`WHERE`)
  //   cy.getByTestID('influxql-editor').contains(`time >= now() - 1h`)
  //   cy.confirmSyncIsOn() // influxql sync sometimes toggles off

  //   cy.log('select measurement')
  //   cy.selectScriptMeasurement(measurement)
  // }

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
    cy.scriptsLoginWithFlags({
      influxqlUI: true,
    }).then(() => {
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

    // it('composition sync functionality', () => {
    //   cy.log('default to be on')

    //   cy.log('turn off the sync by clearing the editor text')

    //   cy.log('can still browse schema while not synced')

    //   cy.log('editor text is still empty')

    //   cy.log('turn on the sync and make a composition')

    //   cy.log('editor text contains the composition')

    //   cy.log('sync toggles on and off, with matching styles')
    // })
  })

  // describe('CSV Download', () => {
  // })

  // describe('Save/Load Script', () => {
  // })
})
