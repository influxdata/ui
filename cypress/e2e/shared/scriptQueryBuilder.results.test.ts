import {Organization} from '../../../src/types'

const DEFAULT_FLUX_EDITOR_TEXT =
  '// Start by selecting data from the schema browser or typing flux here'

// These delays are separately loaded in the UI.
// But cypress checks for them in series...and the LspServer takes longer.
const DELAY_FOR_LAZY_LOAD_EDITOR = 30000
const DELAY_FOR_LSP_SERVER_BOOTUP = 7000

const DELAY_FOR_FILE_DOWNLOAD = 5000

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

  const selectBucket = (bucketName: string) => {
    cy.getByTestID('bucket-selector--dropdown-button').click()
    cy.getByTestID(`bucket-selector--dropdown--${bucketName}`).click()
    cy.getByTestID('bucket-selector--dropdown-button').should(
      'contain',
      bucketName
    )
  }

  const selectMeasurement = (measurement: string) => {
    cy.getByTestID('measurement-selector--dropdown-button')
      .should('be.visible')
      .should('contain', 'Select measurement')
      .click()
    cy.getByTestID('measurement-selector--dropdown--menu').type(measurement)
    cy.getByTestID(`searchable-dropdown--item ${measurement}`)
      .should('be.visible')
      .click()
    cy.getByTestID('measurement-selector--dropdown-button').should(
      'contain',
      measurement
    )
  }

  const selectSchema = () => {
    cy.log('select bucket')
    selectBucket(bucketName)
    cy.getByTestID('flux-editor', {
      timeout: DELAY_FOR_LAZY_LOAD_EDITOR,
    }).contains(`from(bucket: "${bucketName}")`, {
      timeout: DELAY_FOR_LSP_SERVER_BOOTUP,
    })

    cy.log('select measurement')
    selectMeasurement(measurement)
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

  const clearSession = () => {
    return cy.isIoxOrg().then(isIox => {
      if (isIox) {
        cy.getByTestID('query-builder--new-script').should('be.visible').click()
        cy.getByTestID('script-dropdown__flux').should('be.visible').click()
        cy.getByTestID('overlay--container').within(() => {
          cy.getByTestID('script-query-builder--no-save')
            .should('be.visible')
            .click()
        })
      } else {
        cy.getByTestID('script-query-builder--save-script').then(
          $saveButton => {
            if (!$saveButton.is(':disabled')) {
              cy.getByTestID('script-query-builder--new-script')
                .should('be.visible')
                .click()
              cy.getByTestID('overlay--container').within(() => {
                cy.getByTestID('script-query-builder--no-save')
                  .should('be.visible')
                  .click()
              })
            }
          }
        )
      }
      cy.getByTestID('flux-editor').within(() => {
        cy.get('textarea.inputarea').should(
          'have.value',
          DEFAULT_FLUX_EDITOR_TEXT
        )
      })
      return cy.getByTestID('editor-sync--toggle').then($toggle => {
        if (!$toggle.hasClass('active')) {
          $toggle.click()
        }
      })
    })
  }

  const loginWithFlags = flags => {
    return cy.signinWithoutUserReprovision().then(() => {
      return cy.get('@org').then(({id}: Organization) => {
        cy.visit(`/orgs/${id}/data-explorer`)
        return cy.setFeatureFlags(flags).then(() => {
          cy.getByTestID('script-query-builder-toggle').then($toggle => {
            cy.wrap($toggle).should('be.visible')
            // Switch to Flux Query Builder if not yet
            if (!$toggle.hasClass('active')) {
              // hasClass is a jQuery function
              $toggle.click()
            }
          })
        })
      })
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
          writeDataMoar.forEach(data => cy.writeData(data, 'defbuck4'))
        })
      })
    })
  })

  describe('Results display', () => {
    let route: string

    beforeEach(() => {
      loginWithFlags({
        schemaComposition: true,
        newDataExplorer: true,
        saveAsScript: true,
      }).then(() => {
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

        clearSession()
        cy.getByTestID('editor-sync--toggle').should('have.class', 'active')
        cy.getByTestID('flux-editor', {timeout: DELAY_FOR_LAZY_LOAD_EDITOR})
      })
    })

    it('will allow querying of different data ranges', () => {
      selectSchema()
      confirmSchemaComposition()

      cy.log('query with default date range of -1h')
      cy.getByTestID('time-machine-submit-button').should('exist').click()
      cy.wait('@query -1h')

      cy.log('query date range can be adjusted')
      cy.getByTestID('timerange-dropdown').within(() => {
        cy.getByTestID('dropdown--button').should('exist')
        cy.getByTestID('dropdown--button').clickAttached()
      })
      cy.getByTestID('dropdown-item-past15m').should('exist').click()
      cy.getByTestID('time-machine-submit-button').should('exist').click()
      cy.wait('@query -15m')
    })

    describe('data completeness', () => {
      const downloadsDirectory = Cypress.config('downloadsFolder')

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
        cy.getByTestID('timerange-dropdown').within(() => {
          cy.getByTestID('dropdown--button').should('exist')
          cy.getByTestID('dropdown--button').clickAttached()
        })
        cy.getByTestID('dropdown-item-past1h').should('exist')
        cy.getByTestID('dropdown-item-past1h').clickAttached()
        cy.getByTestID('time-machine-submit-button').should('exist')
        cy.getByTestID('time-machine-submit-button').clickAttached()

        cy.log('run query')
        cy.getByTestID('time-machine-submit-button').should('exist')
        cy.getByTestID('time-machine-submit-button').clickAttached()
        cy.wait('@query -1h')
        cy.wait(1000) // bit more time for csv parsing

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

      beforeEach(() => {
        cy.log('empty downloads directory')
        cy.task('deleteDownloads', {dirPath: downloadsDirectory})
      })

      it('will return 0 tables and 0 rows, for an empty dataset', () => {
        cy.isIoxOrg().then(isIox => {
          // iox uses `${orgId}_${bucketId}` for a namespace_id
          // And gives a namespace_id failure if no data is written yet.
          // https://github.com/influxdata/monitor-ci/issues/402#issuecomment-1362368473
          cy.skipOn(isIox)
        })

        cy.log('turn off composition sync')
        cy.getByTestID('editor-sync--toggle').click()
        cy.getByTestID('editor-sync--toggle').should('not.have.class', 'active')
        cy.log('select empty dataset')
        cy.getByTestID('flux-editor').monacoType(`{selectall}{enter}
          from(bucket: "defbuck3") |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
        `)
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
            newDataExplorer: true,
            schemaComposition: true,
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
