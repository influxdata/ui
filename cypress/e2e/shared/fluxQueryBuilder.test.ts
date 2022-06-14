import {Organization} from '../../../src/types'

describe('FluxQueryBuilder', () => {
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
            // Switch to Flux Query Builder
            cy.getByTestID('flux-query-builder-toggle')
              .should('be.visible')
              .click()
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
      cy.get('.searchable-dropdown--input-container').type(bucketName)

      // should find the bucket and select it
      cy.get('.cf-dropdown-item')
        .should('contain', bucketName)
        .click()

      // check the bucket is selected
      cy.getByTestID('bucket-selector--dropdown-button').should(
        'contain',
        bucketName
      )

      // upon the selection of a bucket, should show measurement selector
      cy.getByTestID('measurement-selector--dropdown-button')
        .should('be.visible')
        .click()

      // search for a measurement
      cy.get('.searchable-dropdown--input-container').type(measurement)

      // should find the measurement and select it
      cy.get('.cf-dropdown-item')
        .should('contain', measurement)
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
      cy.getByTestID(`searchable-dropdown--item ${bucketName}`).click()

      // select a measurement
      cy.getByTestID('measurement-selector--dropdown-button').click()
      cy.getByTestID(`searchable-dropdown--item ${measurement}`).click()

      // search a feild, should contain only the feild, no tag keys
      cy.getByTestID('field-tag-key-search-bar').type(searchField)
      cy.get('.field-selector--list-item--wrapper').should(
        'contain',
        searchField
      )
      cy.get('.tag-selector-key--list-item').should('contain', 'No Tags Found')

      // clear the search bar
      cy.getByTestID('dismiss-button').click()

      // search a tag key, should contain only that tag key, no fields
      cy.getByTestID('field-tag-key-search-bar').type(searchTagKey)
      cy.get('.field-selector--list-item').should('contain', 'No Fields Found')
      cy.get('.tag-selector-key--list-item').should('contain', searchTagKey)
    })

    it('fields show all items when less than 8 items, and show "Load More" when more than 8 items', () => {
      // if less than 8 items, show all items
      const bucketNameA = 'Air Sensor Data'
      const measurementA = 'airSensors'

      // select a bucket
      cy.getByTestID('bucket-selector--dropdown-button').click()
      cy.getByTestID(`searchable-dropdown--item ${bucketNameA}`).click()

      // select a measurement
      cy.getByTestID('measurement-selector--dropdown-button').click()
      cy.getByTestID(`searchable-dropdown--item ${measurementA}`).click()

      // less than 8 items, no "Load More" button
      cy.get('.field-selector--list-item--wrapper').should(
        'have.length.at.most',
        8
      )
      cy.get('.load-more-button').should('not.exist')

      // if more than 8 items, show "Load More" button
      // and load additional 25 items

      // select another bucket
      cy.getByTestID('bucket-selector--dropdown-button').click()
      cy.getByTestID(`searchable-dropdown--item ${bucketName}`).click()

      // select another measurement
      cy.getByTestID('measurement-selector--dropdown-button').click()
      cy.getByTestID(`searchable-dropdown--item ${measurement}`).click()

      // more than 8 items, show 'Load More' button
      cy.get('.field-selector--list-item--wrapper').should('have.length', 8)
      cy.get('.load-more-button')
        .should('exist')
        .click()

      // when load more is chosen, up to 25 additional entries will be shown
      cy.get('.field-selector--list-item--wrapper').should(
        'have.length.above',
        8
      )
      cy.get('.field-selector--list-item--wrapper').should(
        'have.length.at.most',
        33
      ) // 8 + 25
    })
  })
})
