import {Organization} from '../../../src/types'

describe('Buckets', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin()
      .then(() =>
        cy.request({
          method: 'GET',
          url: '/api/v2/buckets',
        })
      )
      .then(response => {
        cy.wrap(response.body.buckets[0]).as('bucket')
      })
      .then(() => {
        cy.get('@org').then(({id}: Organization) =>
          cy.fixture('routes').then(({orgs, buckets}) => {
            cy.visit(`${orgs}/${id}${buckets}`)
          })
        )
      })
  })

  // TODO: Skipping this until we can sort out the differences between OSS and Cloud
  it('can sort by name and retention', () => {
    const buckets = [
      'Website Monitoring Bucket',
      'defbuck',
      '_tasks',
      '_monitoring',
    ]
    const retentionDesc = [
      '_monitoring',
      'Website Monitoring Bucket',
      '_tasks',
      'defbuck',
    ]
    const retentionAsc = [
      'defbuck',
      '_tasks',
      '_monitoring',
      'Website Monitoring Bucket',
    ]

    cy.getByTestID('resource-sorter--button')
      .click()
      .then(() => {
        cy.getByTestID('resource-sorter--name-desc').click()
      })
      .then(() => {
        cy.get('[data-testid*="bucket-card"]').each((val, index) => {
          const testID = val.attr('data-testid')
          expect(testID).to.include(buckets[index])
        })
      })

    cy.getByTestID('resource-sorter--button')
      .click()
      .then(() => {
        cy.getByTestID(
          'resource-sorter--retentionRules[0].everySeconds-desc'
        ).click()
      })
      .then(() => {
        cy.get('[data-testid*="bucket-card"]').each((val, index) => {
          const testID = val.attr('data-testid')
          expect(testID).to.include(retentionDesc[index])
        })
      })

    cy.getByTestID('resource-sorter--button')
      .click()
      .then(() => {
        cy.getByTestID(
          'resource-sorter--retentionRules[0].everySeconds-asc'
        ).click()
      })
      .then(() => {
        cy.get('[data-testid*="bucket-card"]').each((val, index) => {
          const testID = val.attr('data-testid')
          expect(testID).to.include(retentionAsc[index])
        })
      })

    // assert buckets amount
    cy.get('.cf-resource-card').should('have.length', 4)

    // filter a bucket
    cy.getByTestID('search-widget').type('def')
    cy.get('.cf-resource-card')
      .should('have.length', 1)
      .should('contain', 'defbuck')

    // clear filter and assert all buckets are visible
    cy.getByTestID('search-widget').clear()
    cy.get('.cf-resource-card').should('have.length', 4)
  })
})
