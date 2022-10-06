import {Organization} from '../../../src/types'

const DEFAULT_SCHEMA = {
  bucket: null,
  measurement: null,
  fields: [],
  tagValues: [],
  composition: {
    synced: true,
    diverged: false,
  },
}

describe('Script Builder', () => {
  const writeData: string[] = []
  for (let i = 0; i < 30; i++) {
    writeData.push(`ndbc,air_temp_degc=70_degrees station_id_${i}=${i}`)
    writeData.push(`ndbc2,air_temp_degc=70_degrees station_id_${i}=${i}`)
  }

  const bucketName = 'defbuck'
  const measurement = 'ndbc'

  const selectBucket = (bucketName: string) => {
    cy.getByTestID('bucket-selector--dropdown-button').click()
    cy.getByTestID('bucket-selector--search-bar').type(bucketName)
    cy.getByTestID(`bucket-selector--dropdown--${bucketName}`).click()
    cy.getByTestID('bucket-selector--dropdown-button').should(
      'contain',
      bucketName
    )
  }

  const selectSchema = () => {
    cy.log('select bucket')
    selectBucket(bucketName)

    cy.log('select measurement')
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

  const confirmSchemaComposition = () => {
    cy.getByTestID('flux-editor', {timeout: 30000})
      // we set a manual delay on page load, for composition initialization
      // https://github.com/influxdata/ui/blob/e76f934c6af60e24c6356f4e4ce9b067e5a9d0d5/src/languageSupport/languages/flux/lsp/connection.ts#L435-L440
      .contains(`from(bucket: "${bucketName}")`, {timeout: 30000})
    cy.getByTestID('flux-editor').contains(
      `|> filter(fn: (r) => r._measurement == "${measurement}")`
    )
    cy.getByTestID('flux-editor').contains(
      `|> yield(name: "_editor_composition")`
    )
    cy.getByTestID('flux-editor').within(() => {
      cy.get('.composition-sync--on').should('have.length', 4) // four lines
    })
  }

  const DEFAULT_EDITOR_TEXT =
    '// Start by selecting data from the schema browser or typing flux here'

  const resetSession = () => {
    window.sessionStorage.setItem(
      'dataExplorer.schema',
      JSON.parse(JSON.stringify(DEFAULT_SCHEMA))
    )
    window.sessionStorage.setItem('dataExplorer.query', DEFAULT_EDITOR_TEXT)
  }

  beforeEach(() => {
    cy.flush().then(() => {
      cy.signin().then(() => {
        cy.get('@org').then(({id, name}: Organization) => {
          cy.visit(`/orgs/${id}/data-explorer`)
          cy.getByTestID('tree-nav').should('be.visible')
          cy.setFeatureFlags({
            newDataExplorer: true,
          }).then(() => {
            cy.createBucket(id, name, 'defbuck2')
            cy.createBucket(id, name, 'defbuck3')
            cy.createBucket(id, name, 'defbuck4')
            cy.writeData(writeData, 'defbuck')
            cy.wait(100)
            cy.getByTestID('flux-query-builder-toggle').then($toggle => {
              cy.wrap($toggle).should('be.visible')
              // Switch to Flux Query Builder if not yet
              if (!$toggle.hasClass('active')) {
                // hasClass is a jQuery function
                $toggle.click()
                cy.getByTestID('flux-query-builder--menu').contains('Clear')
              }
            })
          })
        })
      })
    })
  })

  describe('Results display', () => {
    beforeEach(() => {
      resetSession()
      cy.setFeatureFlags({
        schemaComposition: true,
        newDataExplorer: true,
      }).then(() => {
        // cy.wait($time) is necessary to consistently ensure sufficient time for the feature flag override.
        // The flag reset happens via redux, (it's not a network request), so we can't cy.wait($intercepted_route).
        cy.wait(1200).then(() => {
          cy.reload()
          cy.getByTestID('flux-sync--toggle')
        })
      })

      cy.get('@org').then(({id}: Organization) => {
        cy.intercept('POST', `/api/v2/query?orgID=${id}`, req => {
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
        })
      })
    })

    it('will allow querying of different data ranges', () => {
      cy.getByTestID('flux-editor', {timeout: 30000})
      selectSchema()
      confirmSchemaComposition()

      cy.log('query with default date range of -1h')
      cy.getByTestID('time-machine-submit-button').should('exist').click()
      cy.wait('@query -1h')

      cy.log('query date range can be adjusted')
      cy.getByTestID('timerange-dropdown').within(() => {
        cy.getByTestID('dropdown--button').should('exist').click()
      })
      cy.getByTestID('dropdown-item-past15m').should('exist').click()
      cy.getByTestID('time-machine-submit-button').should('exist').click()
      cy.wait('@query -15m')
    })

    describe('data completeness', () => {
      const runTest = (
        tableCnt: number,
        rowCnt: number,
        truncated: boolean
      ) => {
        cy.log('confirm on 1hr')
        cy.getByTestID('timerange-dropdown').within(() => {
          cy.getByTestID('dropdown--button').should('exist').click()
        })
        cy.getByTestID('dropdown-item-past1h').should('exist').click()
        cy.getByTestID('time-machine-submit-button').should('exist').click()

        cy.log('run query')
        cy.getByTestID('time-machine-submit-button').should('exist').click()
        cy.wait('@query -1h')
        cy.wait(1000)

        cy.log('table metadata displayed to user is correct')
        if (truncated) {
          cy.getByTestID('query-stat')
            .should(
              'contain',
              'Maximum Display Limit Exceeded, result truncated to'
            )
            .should('not.contain', 'rows')
            .should('not.contain', 'tables')
        } else {
          cy.getByTestID('query-stat')
            .should('not.contain', 'truncated')
            .contains(`${tableCnt} tables`)
          cy.getByTestID('query-stat').contains(`${rowCnt} rows`)
        }
      }

      it('will return 0 tables and 0 rows, for an empty dataset', () => {
        cy.log('select empty dataset')
        selectBucket('defbuck3')
        cy.getByTestID('flux-editor').contains(`from(bucket: "defbuck3")`, {
          timeout: 30000,
        })

        runTest(0, 0, false)
      })

      describe('will return 1 table', () => {
        beforeEach(() => {
          const writeData: string[] = []
          for (let i = 0; i < 30; i++) {
            writeData.push(`ndbc3,air_temp_degc=70_degrees station_id_=${i}`)
          }
          cy.writeData(writeData, 'defbuck4')
          cy.wait(1200)
        })

        it('for a dataset with only 1 table', () => {
          cy.log('select dataset with 1 table')
          selectBucket('defbuck4')

          runTest(1, 30, false)
        })
      })

      it('will return the complete dataset for smaller payloads', () => {
        cy.log('select smaller dataset')
        selectSchema()
        confirmSchemaComposition()

        runTest(30, 30, false)
      })

      describe('for larger payloads', () => {
        beforeEach(() => {
          const writeData: string[] = []
          for (let i = 0; i < 500; i++) {
            writeData.push(
              `ndbc3,air_temp_degc=70_degrees station_id_${i}=${i}`
            )
            writeData.push(
              `ndbc4,air_temp_degc=70_degrees station_id_${i}=${i}`
            )
            writeData.push(
              `ndbc5,air_temp_degc=70_degrees station_id_${i}=${i}`
            )
            writeData.push(`ndbc6,air_temp_degc=70_degrees station_id=${i}`)
            writeData.push(`ndbc7,air_temp_degc=70_degrees station_id=${i}`)
          }
          cy.writeData(writeData, 'defbuck2')
          cy.setFeatureFlags({
            newDataExplorer: true,
            schemaComposition: true,
            dataExplorerCsvLimit: 10000 as any,
          }).then(() => {
            // cy.wait($time) is necessary to consistently ensure sufficient time for the feature flag override.
            // The flag reset happens via redux, (it's not a network request), so we can't cy.wait($intercepted_route).
            cy.wait(1200)
          })
        })

        it('will return a truncated dataset rows', () => {
          cy.log('select larger dataset')
          selectBucket('defbuck2')
          cy.getByTestID('flux-editor').contains(`from(bucket: "defbuck2")`, {
            timeout: 30000,
          })

          runTest(3 * 500 + 2, 5 * 500, true)
        })
      })
    })
  })

  describe('Schema browser', () => {
    const bucketName = 'defbuck'
    const measurement = 'ndbc'
    const searchTagKey = 'air_temp_degc'
    const searchField = 'station_id_1'

    it('can search buckets, measurements, fields and tag keys dynamically and loads more data when truncated', () => {
      // open the bucket list
      cy.getByTestID('bucket-selector--dropdown-button').click()

      // search for a bucket
      cy.getByTestID('bucket-selector--search-bar').type(bucketName)

      // should find the bucket and select it
      cy.getByTestID(`bucket-selector--dropdown--${bucketName}`).click()

      // check the bucket is selected
      cy.getByTestID('bucket-selector--dropdown-button').should(
        'contain',
        bucketName
      )

      // check the monaco editor is mounted to prepare for schema injection
      cy.getByTestID('flux-editor').should('be.visible')

      // upon the selection of a bucket, should show measurement selector
      // check the measurement is loaded before click on it
      cy.getByTestID('measurement-selector--dropdown-button')
        .should('be.visible')
        .should('contain', 'Select measurement')
        .click()

      // search for a measurement
      cy.getByTestID('measurement-selector--dropdown--menu').type(measurement)

      // should find the measurement and select it
      cy.getByTestID(`searchable-dropdown--item ${measurement}`)
        .should('be.visible')
        .click()

      // check the measurement is selected
      cy.getByTestID('measurement-selector--dropdown-button').should(
        'contain',
        measurement
      )

      // upon selection, will show a search bar
      // and a list of fields and tag keys
      cy.getByTestID('field-tag-key-search-bar').should('be.visible')
      cy.getByTestID('field-selector')
        .should('be.visible')
        .should('not.contain', 'Loading')
      cy.getByTestID('tag-selector-value--header-wrapper')
        .should('be.visible')
        .should('not.contain', 'Loading')

      // search a field, should contain only the field, no tag keys
      cy.getByTestID('field-tag-key-search-bar')
        .should('be.visible')
        .type(searchField)
      cy.getByTestID('field-selector')
        .should('be.visible')
        .should('not.contain', 'Loading')
        .should('not.contain', 'No Fields Found')
      cy.getByTestID('tag-selector')
        .should('be.visible')
        .should('not.contain', 'Loading')
        .should('contain', 'No Tags Found')

      // clear the search bar
      cy.getByTestID('field-tag-key-search-bar').clear()
      cy.getByTestID('field-selector')
        .should('be.visible')
        .should('not.contain', 'Loading')
        .should('not.contain', 'No Fields Found')
      cy.getByTestID('tag-selector')
        .should('be.visible')
        .should('not.contain', 'No Tags Found')

      // search a tag key, should not contain any fields
      cy.getByTestID('field-tag-key-search-bar')
        .should('be.visible')
        .type(searchTagKey)

      cy.getByTestID('field-selector')
        .should('not.contain', 'Loading')
        .should('contain', 'No Fields Found')

      cy.getByTestID('tag-selector-value--header-wrapper')
        .should('be.visible')
        .should('not.contain', 'Loading')
      cy.getByTestID('tag-selector')
        .should('be.visible')
        .should('not.contain', 'No Tags Found')

      // clear the search bar
      cy.getByTestID('field-tag-key-search-bar').clear()
      cy.getByTestID('field-selector')
        .should('be.visible')
        .should('not.contain', 'Loading')
        .should('not.contain', 'No Fields Found')
      cy.getByTestID('tag-selector')
        .should('be.visible')
        .should('not.contain', 'No Tags Found')

      // more than 8 items, show "Load more" button
      cy.getByTestID('field-selector').within(() => {
        cy.getByTestID('field-selector--list-item--selectable')
          .should('be.visible')
          .should('have.length', 8)
        cy.getByTestID('field-selector--load-more-button')
          .should('be.visible')
          .trigger('click')
          .then(() => {
            // when load more is chosen, up to 25 additional entries should be shown
            cy.getByTestID('field-selector--list-item--selectable')
              .should('be.visible')
              .should('have.length.above', 8)
              .and('have.length.at.most', 33) // 8 + 25
          })
      })

      // less than 8 items, no "Load more" button
      cy.getByTestID('tag-selector').within(() => {
        cy.getByTestID('tag-selector-value--header-wrapper')
          .click()
          .then(() => {
            cy.getByTestID('tag-selector-value--list-item--selectable')
              .should('be.visible')
              .should('have.length.below', 8)
            cy.getByTestID('tag-selector-value--load-more-button').should(
              'not.exist'
            )
          })
      })

      // not recommend to assert for searchTagKey value
      // since it will expand all the tag keys, which triggers
      // numbers of API calls that are time consuming and unnecessary
    })
  })

  describe('Schema Composition', () => {
    beforeEach(() => {
      cy.writeData(writeData, 'defbuck2')
      resetSession()

      cy.setFeatureFlags({
        schemaComposition: true,
        saveAsScript: true,
        newDataExplorer: true,
      }).then(() => {
        // cy.wait($time) is necessary to consistently ensure sufficient time for the feature flag override.
        // The flag reset happens via redux, (it's not a network request), so we can't cy.wait($intercepted_route).
        cy.wait(1200).then(() => {
          cy.reload()
          cy.getByTestID('flux-sync--toggle')
        })
      })
    })

    describe('sync and resetting behavior:', () => {
      it('sync defaults to on. Can be toggled on/off. And can diverge (be disabled).', () => {
        cy.log('starts as synced')
        cy.getByTestID('flux-sync--toggle').should('have.class', 'active')

        cy.log('sync toggles on and off')
        cy.getByTestID('flux-sync--toggle')
          .should('have.class', 'active')
          .click()
          .should('not.have.class', 'active')
          .click()
          .should('have.class', 'active')

        cy.log('can diverge from sync')
        selectSchema()
        confirmSchemaComposition()
        cy.getByTestID('flux-editor').monacoType(
          '{upArrow}{upArrow} // make diverge'
        )

        cy.log('toggle is now disabled')
        cy.getByTestID('flux-sync--toggle').should('have.class', 'disabled')

        cy.log('can still browse schema while diverged')
        selectBucket('defbuck2')
      })

      describe('conditions for divergence:', () => {
        it('diverges when typing in composition block', () => {
          cy.getByTestID('flux-sync--toggle').should('have.class', 'active')
          cy.getByTestID('flux-editor', {timeout: 30000})
          selectSchema()
          confirmSchemaComposition()

          cy.log('does not diverge when outside block')
          cy.getByTestID('flux-editor').monacoType('// will not diverge')
          cy.getByTestID('flux-sync--toggle').should(
            'not.have.class',
            'disabled'
          )

          cy.log('does diverge, within block')
          cy.getByTestID('flux-editor').monacoType(
            '{enter}{upArrow}{upArrow}{upArrow} // make diverge'
          )
          cy.log('toggle is now disabled')
          cy.getByTestID('flux-sync--toggle').should('have.class', 'disabled')
        })

        describe('using hotkeys:', () => {
          const runTest = (hotKeyCombo: string) => {
            cy.getByTestID('flux-sync--toggle').should('have.class', 'active')
            cy.getByTestID('flux-editor', {timeout: 30000})
            selectSchema()
            confirmSchemaComposition()

            cy.log('does not diverge when outside block')
            cy.getByTestID('flux-editor').monacoType(`foo ${hotKeyCombo}`)
            cy.getByTestID('flux-sync--toggle').should(
              'not.have.class',
              'disabled'
            )

            cy.log('does diverge, within block')
            cy.getByTestID('flux-editor').monacoType(
              `{upArrow}{upArrow}{upArrow} ${hotKeyCombo}`
            )
            cy.log('toggle is now disabled')
            cy.getByTestID('flux-sync--toggle').should('have.class', 'disabled')
          }

          it('diverges when commenting line', () => {
            runTest('{cmd}/')
          })

          it('diverges when adding lines', () => {
            runTest('{shift+alt+downArrow}')
          })

          it('diverges when removing lines', () => {
            runTest('{cmd+x}')
          })

          it('diverges when moving lines', () => {
            runTest('{alt+downArrow}')
          })

          /// XXX: wiedld (27 Sep 2022) -- we have no way to delineate btwn the LSP applyEdit,
          /// and the undo action applyEdit.
          /// Either we disable the undo/redo hotkeys, or accept this edge case bug.
          it.skip('diverges when using undo hotkeys, to undo composition block change', () => {
            cy.getByTestID('flux-sync--toggle').should('have.class', 'active')
            cy.getByTestID('flux-editor', {timeout: 30000})
            selectSchema()
            confirmSchemaComposition()

            cy.log('make a change, via schema composition')
            const newMeasurement = 'ndbc2'
            cy.getByTestID('measurement-selector--dropdown-button').click()
            cy.getByTestID(`searchable-dropdown--item ${newMeasurement}`)
              .should('be.visible')
              .click()
            cy.getByTestID('measurement-selector--dropdown-button').should(
              'contain',
              newMeasurement
            )
            cy.getByTestID('flux-editor').contains(
              `|> filter(fn: (r) => r._measurement == "${newMeasurement}")`
            )

            cy.log('use undo hotkey')
            cy.getByTestID('flux-editor').monacoType('{cmd+z}')

            cy.log('toggle is now disabled')
            cy.getByTestID('flux-sync--toggle').should('have.class', 'disabled')
          })
        })
      })

      it('should clear the editor text and schema browser, with a new script', () => {
        cy.getByTestID('flux-editor', {timeout: 30000})

        cy.log('modify schema browser')
        selectSchema()
        confirmSchemaComposition()

        cy.log('editor text contains the composition')
        cy.getByTestID('flux-editor').contains(
          `|> yield(name: "_editor_composition")`
        )

        cy.log('click new script, and choose to delete current script')
        cy.getByTestID('flux-query-builder--new-script').click({force: true})
        cy.getByTestID('overlay--container')
          .should('be.visible')
          .within(() => {
            cy.getByTestID('flux-query-builder--no-save')
              .should('be.visible')
              .click()
          })

        cy.log('editor text is now empty')
        cy.getByTestID('flux-editor').within(() => {
          cy.get('textarea.inputarea').should('have.value', DEFAULT_EDITOR_TEXT)
        })

        cy.log('schema browser has been cleared')
        cy.getByTestID('bucket-selector--dropdown-button').contains(
          'Select bucket'
        )
      })

      it('should not be able to modify the composition when unsynced, yet still modify the saved schema -- which updates the composition when re-synced', () => {
        cy.log('start with empty editor text')
        cy.getByTestID('flux-editor', {timeout: 30000}).within(() => {
          cy.get('textarea.inputarea').should('have.value', DEFAULT_EDITOR_TEXT)
        })

        cy.log('turn off sync')
        cy.getByTestID('flux-sync--toggle')
          .should('have.class', 'active')
          .click()
        cy.getByTestID('flux-sync--toggle').should('not.have.class', 'active')

        cy.log('modify schema browser')
        selectSchema()

        cy.log('editor text is still empty')
        cy.getByTestID('flux-editor').within(() => {
          // selecting bucket will empty the editor text
          cy.get('textarea.inputarea').should('have.value', '')
        })

        cy.log('turn on sync')
        cy.getByTestID('flux-sync--toggle')
          .should('not.have.class', 'active')
          .click()
        cy.getByTestID('flux-sync--toggle').should('have.class', 'active')

        cy.log('editor text contains the composition')
        // we set a manual delay for composition initialization
        // https://github.com/influxdata/ui/blob/e76f934c6af60e24c6356f4e4ce9b067e5a9d0d5/src/languageSupport/languages/flux/lsp/connection.ts#L435-L440
        cy.wait(3000)
        confirmSchemaComposition()
      })
    })
  })
})
