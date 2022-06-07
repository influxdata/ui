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
          // Switch to Flux Query Builder
          cy.getByTestID('slide-toggle')
            .should('be.visible')
            .click()
        })
      })
    })
  })

  describe('Schema browser', () => {
    const bucketName = 'NOAA National Buoy Data'

    describe('bucket selector', () => {
      it('show empty list if fetching buckets failed', () => {})

      it('upon selection, will show measurement selector', () => {
        // open the bucket list
        cy.getByTestID('bucket-selector--dropdown-button').click()

        // select a bucket
        cy.getByTestID(`searchable-dropdown--item ${bucketName}`).click()
        cy.getByTestID('bucket-selector--dropdown-button').contains(bucketName)

        // upon selection, should show measurement selector
        cy.getByTestID('measurement-selector--dropdown').should('be.visible')
      })
    })

    describe('measurement selector', () => {
      beforeEach(() => {
        // select a bucket
      })

      it('show empyt list if fetching measurements failed', () => {})

      it('allow the user to select one (and only one) measurement', () => {})

      it('upon selection, will show a list of fields and tag keys to the user', () => {
        // only show bucket selector if no measurement is selected
      })
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
