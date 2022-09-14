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
  beforeEach(() => {
    cy.flush().then(() => {
      cy.signin().then(() => {
        cy.get('@org').then(({id}: Organization) => {
          cy.visit(`/orgs/${id}/data-explorer`)
          cy.getByTestID('tree-nav').should('be.visible')
          cy.setFeatureFlags({
            newDataExplorer: true,
          }).then(() => {
            const writeData = []
            for (let i = 0; i < 30; i++) {
              writeData.push(
                `ndbc,air_temp_degc=70_degrees station_id_${i}=${i}`
              )
            }
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
      window.sessionStorage.setItem(
        'dataExplorer.schema',
        JSON.parse(JSON.stringify(DEFAULT_SCHEMA))
      )
      window.sessionStorage.setItem('dataExplorer.query', '')

      cy.setFeatureFlags({
        schemaComposition: true,
        saveAsScript: true,
      }).then(() => {
        // cy.wait($time) is necessary to consistently ensure sufficient time for the feature flag override.
        // The flag reset happens via redux, (it's not a network request), so we can't cy.wait($intercepted_route).
        cy.wait(1200).then(() => {
          cy.reload()
          cy.getByTestID('flux-sync--toggle')
        })
      })
    })

    const bucketName = 'defbuck'
    const measurement = 'ndbc'

    const selectSchema = () => {
      cy.log('select bucket')
      cy.getByTestID('bucket-selector--dropdown-button').click()
      cy.getByTestID('bucket-selector--search-bar').type(bucketName)
      cy.getByTestID(`bucket-selector--dropdown--${bucketName}`).click()
      cy.getByTestID('bucket-selector--dropdown-button').should(
        'contain',
        bucketName
      )

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
        cy.get('#schema-composition-sync-icon', {timeout: 3000}).should(
          'have.length',
          1
        )
        cy.get('.composition-sync').should('have.length', 2)
      })
    }

    describe('default sync and resetting behavior:', () => {
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
      })

      it('should clear the editor text, and schema browser, with a new script', () => {
        cy.getByTestID('flux-editor', {timeout: 30000})

        cy.log('modify schema browser')
        selectSchema()

        cy.log('editor text contains the composition')
        cy.getByTestID('flux-editor').contains(
          `|> yield(name: "_editor_composition")`
        )

        cy.log('click new script, and choose to delete current script')
        cy.getByTestID('flux-query-builder--new-script').click({force: true})
        cy.getByTestID('overlay--container')
          .should('be.visible')
          .within(() => {
            cy.getByTestID('flux-query-builder--no-save').click()
          })

        cy.log('editor text is now empty')
        cy.getByTestID('flux-editor').within(() => {
          cy.get('textarea.inputarea').should('have.value', '')
        })

        cy.log('schema browser has been cleared')
        cy.getByTestID('bucket-selector--dropdown-button').contains(
          'Select bucket'
        )
      })

      it('should not be able to modify the composition when unsynced, yet still modify the saved schema -- which updates the composition when re-synced', () => {
        cy.log('start with empty editor text')
        cy.getByTestID('flux-editor', {timeout: 30000}).within(() => {
          cy.get('textarea.inputarea').should('have.value', '')
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
