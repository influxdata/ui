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
            const writeData = []
            for (let i = 0; i < 30; i++) {
              writeData.push(`ndbc,air_temp_degc=${i}_degrees station_id=${i}`)
            }
            cy.writeData(writeData, 'defbuck')
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
    const bucketName = 'defbuck'
    const measurement = 'ndbc'
    const searchTagKey = 'air_temp_degc'
    const searchField = 'station_id'

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
      cy.getByTestID('tag-selector--key')
        .should('be.visible')
        .should('not.contain', 'Loading')

      // search a feild, should contain only the feild, no tag keys
      cy.getByTestID('field-tag-key-search-bar')
        .should('be.visible')
        .type(searchField)
      cy.getByTestID('field-selector')
        .should('be.visible')
        .should('not.contain', 'Loading')
        .should('not.contain', 'No Fields Found')
      cy.getByTestID('tag-selector--key')
        .should('be.visible')
        .should('not.contain', 'Loading')
      cy.getByTestID('tag-selector-key')
        .should('be.visible')
        .should('contain', 'No Tags Found')

      // clear the search bar
      cy.getByTestID('dismiss-button').click()

      cy.getByTestID('field-selector')
        .should('be.visible')
        .should('not.contain', 'Loading')
        .should('not.contain', 'No Fields Found')
      cy.getByTestID('tag-selector--key')
        .should('be.visible')
        .should('not.contain', 'Loading')
      cy.getByTestID('tag-selector-key')
        .should('be.visible')
        .should('not.contain', 'No Tags Found')

      // search a tag key, should not contain any fields
      cy.getByTestID('field-tag-key-search-bar')
        .should('be.visible')
        .type(searchTagKey)

      cy.getByTestID('field-selector')
        .should('not.contain', 'Loading')
        .should('contain', 'No Fields Found')

      cy.getByTestID('tag-selector--key')
        .should('be.visible')
        .should('not.contain', 'Loading')
      cy.getByTestID('tag-selector-key')
        .should('be.visible')
        .should('not.contain', 'No Tags Found')

      cy.getByTestID('field-tag-key-search-bar').clear()

      // less than 8 items, no "Load More" button
      cy.getByTestID('field-selector').within(() => {
        cy.getByTestID('field-selector--list-item--selectable')
          .should('be.visible')
          .should('have.length.at.most', 8)
        cy.getByTestID('field-selector--load-more-button').should('not.exist')
      })

      // more than 8 items, show 'Load More' button
      cy.getByTestID('tag-selector--key').within(() => {
        cy.get('.tag-selector-value--header').click()
      })
      cy.getByTestID('tag-selector-value--list-item--selectable')
        .should('be.visible')
        .should('have.length', 8)
      cy.getByTestID('tag-selector-value--load-more-button')
        .should('be.visible')
        .trigger('click')
        .then(() => {
          // when load more is chosen, up to 25 additional entries should be shown
          cy.getByTestID('tag-selector-value--list-item--selectable')
            .should('be.visible')
            .should('have.length.above', 8)
            .and('have.length.at.most', 33) // 8 + 25
        })

      // not recommend to assert for searchTagKey value
      // since it will expand all the tag keys, which triggers
      // numbers of API calls that are time consuming and unnecessary
    })
  })
})
