import {Organization} from '../../../src/types'

describe.skip('FluxQueryBuilder', () => {
  beforeEach(() => {
    cy.flush().then(() => {
      cy.signin().then(() => {
        cy.get('@org').then(({id}: Organization) => {
          cy.visit(`/orgs/${id}/data-explorer`)
          cy.getByTestID('tree-nav').should('be.visible')
          cy.setFeatureFlags({
            newDataExplorer: true,
          }).then(() => {
            cy.wait(100)
            cy.getByTestID('flux-query-builder-toggle').then($toggle => {
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
    })
  })

  describe('Schema browser', () => {
    const bucketName = 'NOAA National Buoy Data'
    const measurement = 'ndbc'
    const searchField = 'air_temp_degc'
    const searchTagKey = 'station_id'

    it('bucket selector can search and select a bucket, then search and select a measurement', () => {
      // no other selectors should be visible, except the bucket selector
      cy.getByTestID('bucket-selector--dropdown-button').should('be.visible')
      cy.getByTestID('measurement-selector--dropdown-button').should(
        'not.exist'
      )
      cy.getByTestID('field-tag-key-search-bar').should('not.exist')
      cy.getByTestID('field-selector').should('not.exist')
      cy.getByTestID('tag-selector-key').should('not.exist')

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
      cy.getByTestID('field-selector').should('be.visible')
      cy.getByTestID('tag-selector-key').should('be.visible')
    })

    it('search bar can search fields and tag keys dynamically', () => {
      // select a bucket
      cy.getByTestID('bucket-selector--dropdown-button').click()
      cy.getByTestID(`bucket-selector--dropdown--${bucketName}`).click()

      // check the monaco editor is mounted to prepare for schema injection
      cy.getByTestID('flux-editor').should('be.visible')

      // select a measurement
      cy.getByTestID('measurement-selector--dropdown-button')
        .should('contain', 'Select measurement')
        .click()
      cy.getByTestID(`searchable-dropdown--item ${measurement}`).click()

      // search a feild, should contain only the feild, no tag keys
      cy.getByTestID('field-tag-key-search-bar')
        .should('be.visible')
        .type(searchField)
      cy.getByTestID('field-selector--list-item--selectable').should(
        'contain',
        searchField
      )

      // clear the search bar
      cy.getByTestID('dismiss-button').click()

      // search a tag key, should not contain any fields
      cy.getByTestID('field-tag-key-search-bar')
        .should('be.visible')
        .type(searchTagKey)

      cy.getByTestID('field-selector--list-item')
        .should('be.visible')
        .should('contain', 'No Fields Found')

      // not recommend to assert for searchTagKey value
      // since it will expand all the tag keys, which triggers
      // numbers of API calls that are time consuming and unnecessary
    })

    it.skip('fields show all items when less than 8 items, and show "Load More" when more than 8 items', () => {
      // if less than 8 items, show all items
      const bucketNameA = 'Air Sensor Data'
      const measurementA = 'airSensors'

      // select a bucket
      cy.getByTestID('bucket-selector--dropdown-button').click()
      cy.getByTestID(`bucket-selector--dropdown--${bucketNameA}`).click()

      // check the monaco editor is mounted to prepare for schema injection
      cy.getByTestID('flux-editor').should('be.visible')

      // select a measurement
      cy.getByTestID('measurement-selector--dropdown-button')
        .should('contain', 'Select measurement')
        .click()
      cy.getByTestID(`searchable-dropdown--item ${measurementA}`).click()

      // less than 8 items, no "Load More" button
      cy.getByTestID('field-selector--list-item--selectable')
        .should('be.visible')
        .should('have.length.at.most', 8)
      cy.getByTestID('field-selector--load-more-button').should('not.exist')

      // if more than 8 items, show "Load More" button
      // and load additional 25 items

      // select another bucket
      cy.getByTestID('bucket-selector--dropdown-button').click()
      cy.getByTestID(`bucket-selector--dropdown--${bucketName}`).click()

      // select another measurement
      cy.getByTestID('measurement-selector--dropdown-button')
        .should('contain', 'Select measurement')
        .click()
      cy.getByTestID(`searchable-dropdown--item ${measurement}`).click()

      // more than 8 items, show 'Load More' button
      cy.getByTestID('field-selector--list-item--selectable')
        .should('be.visible')
        .should('have.length', 8)
      cy.getByTestID('field-selector--load-more-button')
        .should('be.visible')
        .click()
        .then(() => {
          // when load more is chosen, up to 25 additional entries will be shown
          cy.getByTestID('field-selector--list-item--selectable')
            .should('be.visible')
            .should('have.length.above', 8)

          cy.getByTestID('field-selector--list-item--selectable').should(
            'have.length.at.most',
            33
          ) // 8 + 25
        })
    })
  })
})
