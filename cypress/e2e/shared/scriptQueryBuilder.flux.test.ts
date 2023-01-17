import {Organization} from '../../../src/types'

const DEFAULT_FLUX_EDITOR_TEXT =
  '// Start by selecting data from the schema browser or typing flux here'

// These delays are separately loaded in the UI.
// But cypress checks for them in series...and the LspServer takes longer.
const DELAY_FOR_LAZY_LOAD_EDITOR = 30000
const DELAY_FOR_LSP_SERVER_BOOTUP = 7000

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

  const selectListItem = (name, beActive) => {
    cy.getByTestID('field-selector').should('be.visible')
    cy.getByTestID(`selector-list ${name}`)
      .should('be.visible')
      .click({force: true})
    cy.getByTestID(`selector-list ${name}`).should(
      beActive ? 'have.class' : 'not.have.class',
      'cf-list-item__active'
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
      cy.get('.composition-sync--on').should('have.length.gte', 3) // three lines
    })
  }

  const setScriptToFlux = () => {
    return cy.isIoxOrg().then(isIox => {
      if (isIox) {
        cy.getByTestID('query-builder--new-script').should('be.visible').click()
        cy.getByTestID('script-dropdown__flux').should('be.visible').click()
        cy.getByTestID('overlay--container').within(() => {
          cy.getByTestID('script-query-builder--no-save')
            .should('be.visible')
            .click()
        })
      }
      return cy.getByTestID('flux-editor').within(() => {
        cy.get('textarea.inputarea').should(
          'have.value',
          DEFAULT_FLUX_EDITOR_TEXT
        )
      })
    })
  }

  const clearSession = () => {
    return cy.isIoxOrg().then(isIox => {
      if (isIox) {
        setScriptToFlux()
      } else {
        cy.getByTestID('script-query-builder--save-script').then($saveButton => {
          if (!$saveButton.is(':disabled')) {
            cy.getByTestID('flux-query-builder--new-script')
              .should('be.visible')
              .click()
            cy.getByTestID('overlay--container').within(() => {
              cy.getByTestID('script-query-builder--no-save')
                .should('be.visible')
                .click()
            })
          }
        })
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
          cy.writeData(writeData, 'defbuck')
          cy.writeData(writeData, 'defbuck2')
        })
      })
    })
  })

  describe('Schema browser, without composition or saveAsScript', () => {
    beforeEach(() => {
      loginWithFlags({
        schemaComposition: false,
        newDataExplorer: true,
      }).then(() => {
        cy.getByTestID('editor-sync--toggle').should('not.exist')
        cy.getByTestID('flux-query-builder--menu').contains('New Script')
        setScriptToFlux()
      })
    })

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
      loginWithFlags({
        schemaComposition: true,
        newDataExplorer: true,
        saveAsScript: true,
      }).then(() => {
        clearSession()
        cy.getByTestID('editor-sync--toggle')
        cy.getByTestID('flux-editor', {timeout: DELAY_FOR_LAZY_LOAD_EDITOR})
      })
    })

    describe('basic functionality', () => {
      it('can construct a composition with fields', () => {
        cy.log('empty editor text')
        cy.getByTestID('flux-editor').monacoType('{selectAll}{del}')

        cy.log('Ensure LSP is online') // deflake
        cy.wait(DELAY_FOR_LSP_SERVER_BOOTUP)

        cy.log('select bucket and measurement')
        selectSchema()
        confirmSchemaComposition()

        cy.log('select field --> adds to composition')
        const fieldName0 = 'station_id_0'
        const fieldName10 = 'station_id_10'
        selectListItem(fieldName0, true)
        cy.getByTestID('flux-editor').contains(
          `|> filter(fn: (r) => r._field == "${fieldName0}")`
        )
        selectListItem(fieldName10, true)
        cy.getByTestID('flux-editor').contains(
          `fn: (r) => r._field == "${fieldName0}" or r._field == "${fieldName10}"`
        )

        cy.log('select field --> removes from composition')
        selectListItem(fieldName10, false)
        cy.wait(1000)
        cy.getByTestID('flux-editor').contains(
          `|> filter(fn: (r) => r._field == "${fieldName0}")`
        )
        cy.getByTestID('flux-editor').within(() => {
          cy.get('textarea.inputarea').should('not.contain', fieldName10)
        })
      })

      it('can construct a composition with tagValues', () => {
        cy.log('empty editor text')
        cy.getByTestID('flux-editor').monacoType('{selectAll}{del}')

        cy.log('Ensure LSP is online') // deflake
        cy.wait(DELAY_FOR_LSP_SERVER_BOOTUP)

        cy.log('select bucket and measurement')
        selectSchema()
        confirmSchemaComposition()

        cy.log('select tagValue --> adds to composition')
        cy.getByTestID('container-side-bar--tag-keys').within(() => {
          cy.getByTestID('accordion-header').should('be.visible').click()
        })
        const tagKey = 'air_temp_degc'
        const tagValue = '70_degrees'
        selectListItem(tagValue, true)
        cy.getByTestID('flux-editor').contains(
          `|> filter(fn: (r) => r.${tagKey} == "${tagValue}")`
        )

        cy.log('select tagValue --> removes from composition')
        selectListItem(tagValue, false)
        cy.wait(1000)
        cy.getByTestID('flux-editor').within(() => {
          cy.get('textarea.inputarea').should('not.contain', tagKey)
        })
      })

      it('will empty the default text on first bucket selection', () => {
        cy.log('start with default text')
        cy.getByTestID('flux-editor').within(() => {
          cy.get('textarea.inputarea').should(
            'have.value',
            DEFAULT_FLUX_EDITOR_TEXT
          )
        })

        cy.log('select bucket')
        selectBucket(bucketName)
        cy.getByTestID('flux-editor').contains(`from(bucket: "${bucketName}")`)
        cy.getByTestID('flux-editor').should(
          'not.contain',
          DEFAULT_FLUX_EDITOR_TEXT
        )
      })

      // TODO: this works fine in remocal, but fails in cypress
      it.skip('can re-attached a composition on page reload', () => {
        cy.log('empty editor text')
        cy.getByTestID('flux-editor').monacoType('{selectAll}{del}')

        cy.log('make composition')
        selectSchema()
        confirmSchemaComposition()

        cy.reload()

        cy.log('confirm composition is re-attached')
        cy.getByTestID('flux-editor', {
          timeout: DELAY_FOR_LAZY_LOAD_EDITOR,
        }).within(() => {
          cy.get('.composition-sync--on', {
            timeout: DELAY_FOR_LSP_SERVER_BOOTUP,
          }).should('have.length.gte', 3)
        })

        cy.log('can still change composition')
        const fieldName10 = 'station_id_10'
        selectListItem(fieldName10, false)
        cy.getByTestID('flux-editor').contains(
          `|> filter(fn: (r) => r._field == "${fieldName10}")`
        )
      })
    })

    describe('sync and resetting behavior:', () => {
      it('sync defaults to on. Can be toggled on/off. And can diverge (be disabled).', () => {
        cy.log('starts as synced')
        cy.getByTestID('editor-sync--toggle').should('have.class', 'active')

        cy.log('empty editor text')
        cy.getByTestID('flux-editor').monacoType('{selectAll}{del}')

        cy.log('Ensure LSP is online') // deflake
        cy.wait(DELAY_FOR_LSP_SERVER_BOOTUP)

        cy.log('make a composition')
        selectSchema()
        confirmSchemaComposition()

        cy.log('sync toggles on and off, with matching styles')
        cy.get('.composition-sync--on').should('have.length.gte', 3)
        cy.get('.composition-sync--off').should('have.length', 0)
        cy.getByTestID('editor-sync--toggle')
          .should('have.class', 'active')
          .click()
          .should('not.have.class', 'active')
        cy.get('.composition-sync--on').should('have.length', 0)
        cy.get('.composition-sync--off').should('have.length.gte', 3)
        cy.getByTestID('editor-sync--toggle')
          .click()
          .should('have.class', 'active')
        cy.get('.composition-sync--on').should('have.length.gte', 3)
        cy.get('.composition-sync--off').should('have.length', 0)

        cy.log('turn off flux sync')
        cy.getByTestID('editor-sync--toggle')
          .click()
          .should('not.have.class', 'active')

        cy.log('can still browse schema while not synced')
        selectBucket('defbuck2')
      })

      it('should clear the editor text and schema browser, with a new script', () => {
        cy.getByTestID('flux-editor', {timeout: DELAY_FOR_LAZY_LOAD_EDITOR})

        cy.log('modify schema browser')
        selectSchema()

        cy.log('editor text contains the composition')
        confirmSchemaComposition()

        cy.log('click new script, and choose to delete current script')
        clearSession()
      })

      it('should not be able to modify the composition when unsynced, yet still modify the saved schema -- which updates the composition when re-synced', () => {
        cy.log('empty editor text')
        cy.getByTestID('flux-editor').monacoType('{selectall}{enter}')

        cy.log('turn off sync')
        cy.getByTestID('editor-sync--toggle')
          .should('have.class', 'active')
          .click()
        cy.getByTestID('editor-sync--toggle').should('not.have.class', 'active')

        cy.log('modify schema browser')
        selectBucket(bucketName)
        selectMeasurement(measurement)

        cy.log('editor text is still empty')
        cy.getByTestID('flux-editor').within(() => {
          // selecting bucket will empty the editor text
          cy.get('textarea.inputarea').should('have.value', '\n')
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
})
