import {Organization} from '../../../src/types'

// These delays are separately loaded in the UI.
// But cypress checks for them in series...and the LspServer takes longer.
const DELAY_FOR_LAZY_LOAD_EDITOR = 30000
const DELAY_FOR_LSP_SERVER_BOOTUP = 7000

const DELAY_FOR_FILE_DOWNLOAD = 5000

const DEFAULT_DELAY_MS = 2000

describe('Script Builder', () => {
  const writeData: string[] = []
  for (let i = 0; i < 30; i++) {
    writeData.push(`ndbc,air_temp_degc=70_degrees station_id_${i}=${i}`)
    writeData.push(`ndbc2,air_temp_degc=70_degrees station_id_${i}=${i}`)
  }
  const writeDataMoar: Array<string[]> = [[], [], [], []]
  const numOfUniqueColumns = 198 // 200 - 2
  for (let i = 0; i < numOfUniqueColumns; i++) {
    writeDataMoar[0]?.push(
      `ndbc_big,air_temp_degc=70_degrees station_id_A${i}=${i}`
    )
    writeDataMoar[1]?.push(
      `ndbc_big,air_temp_degc=70_degrees station_id_A${i}=${
        i + numOfUniqueColumns
      }`
    )
  }

  const bucketName = 'defbuck'
  const measurement = 'ndbc'

  const selectSchema = () => {
    cy.selectScriptBucket(bucketName)
    cy.selectScriptMeasurement(measurement)
  }

  const confirmSchemaComposition = () => {
    cy.getByTestID('flux-editor', {
      timeout: DELAY_FOR_LAZY_LOAD_EDITOR,
    }).contains(`from(bucket: "${bucketName}")`, {
      timeout: DELAY_FOR_LSP_SERVER_BOOTUP,
    })
    cy.getByTestID('flux-editor').contains(
      `fn: (r) => r._measurement == "${measurement}"`
    )
    cy.getByTestID('flux-editor').within(() => {
      cy.get('.composition-sync--on').should('have.length', 3) // three lines
    })
  }

  before(() => {
    cy.flush().then(() => {
      return cy.signin().then(() => {
        return cy.get('@org').then(({id, name}: Organization) => {
          cy.log('add mock data')
          cy.createBucket(id, name, 'defbuck2')
          cy.createBucket(id, name, 'defbuck3') // 0 tables, 0 rows
          cy.createBucket(id, name, 'defbuck4') // load certain amts of data, per measurement
          cy.writeData(writeData, 'defbuck')
          cy.writeData(writeData, 'defbuck2')
          cy.writeData(
            [`ndbc_1table,air_temp_degc=70_degrees station_id=1`],
            'defbuck4'
          )
          writeDataMoar.forEach(data => {
            if (data.length > 0) {
              cy.writeData(data, 'defbuck4')
            }
          })
        })
      })
    })
  })

  describe('Results display', () => {
    let route: string

    beforeEach(() => {
      cy.scriptsLoginWithFlags({}).then(() => {
        cy.get('@org').then(({id: orgID}: Organization) => {
          route = `/orgs/${orgID}/data-explorer`
          cy.intercept(
            'POST',
            `/api/v2/query?${new URLSearchParams({orgID})}`,
            req => {
              const {extern} = req.body
              if (
                extern?.body[0]?.location?.source ==
                `option v =  {  timeRangeStart: -1h,\n  timeRangeStop: now()}`
              ) {
                req.alias = 'query -1h'
              } else if (
                extern?.body[0]?.location?.source ==
                `option v =  {  timeRangeStart: -15m,\n  timeRangeStop: now()}`
              ) {
                req.alias = 'query -15m'
              }
            }
          )
        })
        cy.setScriptToFlux()
        cy.getByTestID('editor-sync--toggle').should('have.class', 'active')
        cy.getByTestID('flux-editor', {timeout: DELAY_FOR_LAZY_LOAD_EDITOR})
      })
    })

    // Temporarily disabled due to excess flake. Do not re-enable without rewriting this test.
    it.skip('will allow querying of different data ranges', () => {
      cy.log('Ensure LSP is online') // deflake
      cy.wait(DELAY_FOR_LSP_SERVER_BOOTUP)

      selectSchema()
      confirmSchemaComposition()

      cy.log('query with default date range of -1h')
      cy.getByTestID('time-machine-submit-button').should('exist').click()
      cy.wait('@query -1h')

      cy.log('query date range can be adjusted')
      cy.getByTestID('timerange-dropdown--button')
        .should('be.visible')
        .click()
        .wait(DEFAULT_DELAY_MS)
      cy.getByTestID('dropdown-item-past15m')
        .should('exist')
        .click()
        .wait(DEFAULT_DELAY_MS)
      cy.getByTestID('time-machine-submit-button')
        .should('exist')
        .click()
        .wait(DEFAULT_DELAY_MS)
      cy.wait('@query -15m')
    })

    describe('data completeness', () => {
      const validateCsv = (csv: string, tableCnt: number) => {
        cy.wrap(csv)
          .then(doc => doc.trim().split('\n'))
          .then(list => {
            expect(list[list.length - 1]).contains(`,${tableCnt - 1},`)
          })
      }

      const runTest = (
        tableCnt: number,
        rowCnt: number,
        truncated: boolean
      ) => {
        cy.log('confirm on 1hr')
        cy.getByTestID('timerange-dropdown--button')
          .should('be.visible')
          .click()
        cy.getByTestID('dropdown-item-past1h').should('exist')
        cy.getByTestID('dropdown-item-past1h').clickAttached()
        cy.getByTestID('time-machine-submit-button').should('exist')
        cy.getByTestID('time-machine-submit-button').clickAttached()

        cy.log('run query')
        cy.getByTestID('time-machine-submit-button').should('exist')
        cy.getByTestID('time-machine-submit-button').clickAttached()
        cy.wait('@query -1h')
        cy.wait(DEFAULT_DELAY_MS) // bit more time for csv parsing

        cy.log('table metadata displayed to user is correct')
        if (truncated) {
          cy.getByTestID('query-stat')
            .should('contain', 'truncated')
            .should('not.contain', 'rows')
            .should('not.contain', 'tables')
        } else {
          cy.getByTestID('query-stat')
            .should('not.contain', 'truncated')
            .contains(`${tableCnt} tables`)
          cy.getByTestID('query-stat').contains(`${rowCnt} rows`)
        }

        cy.log('will download complete csv data')
        cy.intercept('POST', '/api/v2/query?*', req => {
          req.redirect(route)
        }).as('queryDownloadCSV')

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
              .then(csv => {
                if (tableCnt == 0) {
                  csv.trim() == ''
                } else {
                  validateCsv(csv, tableCnt)
                }
              })
          })
      }

      it('will return 0 tables and 0 rows, for an empty dataset', () => {
        cy.isIoxOrg().then(isIox => {
          // iox uses `${orgId}_${bucketId}` for a namespace_id
          // And gives a namespace_id failure if no data is written yet.
          // https://github.com/influxdata/monitor-ci/issues/402#issuecomment-1362368473
          cy.skipOn(isIox)
        })

        cy.log('turn off composition sync')
        cy.getByTestID('editor-sync--toggle').click().wait(DEFAULT_DELAY_MS)
        cy.getByTestID('editor-sync--toggle').should('not.have.class', 'active')
        cy.log('select empty dataset')
        cy.getByTestID('flux-editor')
          .monacoType(
            `{selectall}{enter}
          from(bucket: "defbuck3") |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
        `
          )
          .wait(DEFAULT_DELAY_MS)
        cy.getByTestID('flux-editor').contains('defbuck3')

        runTest(0, 0, false)
      })

      it('will return 1 table, for a dataset with only 1 table', () => {
        cy.log('select dataset with 1 table')
        cy.getByTestID('csv-download-button').should('be.disabled')
        cy.getByTestID('flux-editor').monacoType(`{selectall}{enter}
          from(bucket: "defbuck4") |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
          |> filter(fn: (r) => r._measurement == "ndbc_1table")
        `)
        cy.getByTestID('flux-editor').contains('defbuck4')

        runTest(1, 1, false)
      })

      it('will return the complete dataset for smaller payloads', () => {
        cy.log('select smaller dataset')
        cy.getByTestID('flux-editor').monacoType(`{selectall}{enter}
          from(bucket: "${bucketName}") |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
          |> filter(fn: (r) => r._measurement == "${measurement}")
        `)
        cy.getByTestID('flux-editor').contains(bucketName)

        runTest(30, 30, false)
      })

      describe('for larger payloads', () => {
        beforeEach(() => {
          cy.setFeatureFlags({
            enableFluxInScriptBuilder: true,
            dataExplorerCsvLimit: 10000 as any,
          })
        })

        it('will return a truncated dataset rows', () => {
          cy.log('select larger dataset')
          cy.getByTestID('csv-download-button').should('be.disabled')
          cy.getByTestID('flux-editor').monacoType(`{selectall}{enter}
            from(bucket: "defbuck4") |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
            |> filter(fn: (r) => r._measurement == "ndbc_big")
          `)
          cy.getByTestID('flux-editor').contains(
            `|> filter(fn: (r) => r._measurement == "ndbc_big")`
          )

          runTest(numOfUniqueColumns, 2 * numOfUniqueColumns, true)
        })
      })
    })
  })
})
