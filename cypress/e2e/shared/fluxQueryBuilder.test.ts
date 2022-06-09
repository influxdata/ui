import {Organization} from '../../../src/types'

describe('FluxQueryBuilder', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.get('@org').then(({id}: Organization) => {
      cy.fixture('routes').then(({orgs, explorer}) => {
        cy.setFeatureFlags({newDataExplorer: true}).then(() => {
          cy.visit(`${orgs}/${id}${explorer}`)
          cy.getByTestID('tree-nav').should('be.visible')
        })
      })
    })
    cy.getByTestID('slide-toggle').then(toggle => {
      // Switch to Flux Query Builder if it is not on
      if (toggle.find('.active').length === 0) {
        toggle.click()
      }
    })
  })

  describe('Schema browser', () => {
    const bucketName = 'NOAA National Buoy Data'
    const measurement = 'ndbc'
    const searchField = 'air_temp_degc'
    const searchTagKey = 'station_id'

    it('bucket selector can search and select a bucket', () => {
      // no other selectors should be visible, except the bucket selector
      cy.get('.schema-browser')
        .find('.cf-dropdown')
        .should('have.length', 1)

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

      // upon selection, should show measurement selector
      cy.getByTestID('measurement-selector--dropdown').should('be.visible')
    })

    it('measurement selector can search and select a measurement', () => {
      // select a bucket
      cy.getByTestID('bucket-selector--dropdown-button').click()
      cy.getByTestID(`searchable-dropdown--item ${bucketName}`).click()

      // open the measurement list
      cy.getByTestID('measurement-selector--dropdown-button').click()

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
      cy.get('.search-widget-input').should('be.visible')
      cy.get('.field-selector').should('be.visible')
      cy.get('.tag-selector-key').should('be.visible')
    })

    it('search bar can search fields and tag keys dynamically', () => {
      // select a bucket
      cy.getByTestID('bucket-selector--dropdown-button').click()
      cy.getByTestID(`searchable-dropdown--item ${bucketName}`).click()

      // select a measurement
      cy.getByTestID('measurement-selector--dropdown-button').click()
      cy.getByTestID(`searchable-dropdown--item ${measurement}`).click()

      // search a feild, should contain only the feild, no tag keys
      cy.get('.container-side-bar .search-widget-input').type(searchField)
      cy.get('.field-selector--list-item--wrapper').should(
        'contain',
        searchField
      )
      cy.get('.tag-selector-key--list-item').should('contain', 'No Tags Found')

      // clear the search bar
      cy.getByTestID('dismiss-button').click()

      // search a tag key, should contain only that tag key, no fields
      cy.get('.container-side-bar .search-widget-input').type(searchTagKey)
      cy.get('.field-selector--list-item').should('contain', 'No Fields Found')
      cy.get('.tag-selector-key--list-item').should('contain', searchTagKey)
    })

    describe('field selector', () => {
      beforeEach(() => {
        // select a bucket
        // select a measurement
      })

      it('if less than 8 items, show all the items', () => {})

      it("if more than 8 items, show a 'Load More' option to load more", () => {})

      it('when load more is chosen, up to 25 additional entries will be shown', () => {})

      it('if more than 25 more exists in the list, the user has the option to load more', () => {})
    })

    describe('tag values', () => {
      beforeEach(() => {
        // select a bucket
        // select a measurement
      })

      it('allow an expansion of tag keys into a list of tag values', () => {})

      it('allow one or more tag values to be selected', () => {})
    })
  })
})
