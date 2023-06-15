import {Organization} from '../../../src/types'

const DELAY_FOR_LAZY_LOAD_EDITOR = 35000

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
      cy.log('empty editor text')

      cy.log(
        'disable run button before selecting a database/retention policy mapping'
      )

      cy.log('empty the default text on first bucket selection')
    })
  })

  // describe('CSV Download', () => {
  // })

  // describe('Save/Load Script', () => {
  // })
})
