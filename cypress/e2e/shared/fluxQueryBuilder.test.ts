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
      cy.getByTestID('bucket-selector--dropdown-button').contains(bucketName)

      // upon selection, should show measurement selector
      cy.getByTestID('measurement-selector--dropdown').should('be.visible')
    })

    it('measurement selector can search and select a measurement', () => {
      // select a bucket
      // open the measurement list
      // search for a measurement
      // should find the measurement and select it
      // check the measurement is selected
      // upon selection, will show a list of fields and tag keys to the user
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

    describe('search bar for fields and tag keys', () => {
      beforeEach(() => {
        // select a bucket
        // select a measurement
      })

      it('can search dynamically', () => {})
    })
  })
})
