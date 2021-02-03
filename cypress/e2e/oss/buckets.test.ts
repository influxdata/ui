import {Organization} from '../../../src/types'

describe('Buckets', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) =>
        cy.fixture('routes').then(({orgs, buckets}) => {
          cy.visit(`${orgs}/${id}${buckets}`)
        })
      )
    })
  })

  // TODO: Skipping this until we can sort out the differences between OSS and Cloud
  it('can sort by name and retention', () => {
    const buckets = ['defbuck', '_tasks', '_monitoring']
    const retentionDesc = ['_monitoring', '_tasks', 'defbuck']
    const retentionAsc = ['defbuck', '_tasks', '_monitoring']

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
    cy.get('.cf-resource-card').should('have.length', 3)

    // filter a bucket
    cy.get<string>('@defaultBucket').then((defaultBucket: string) => {
      cy.getByTestID('search-widget').type(defaultBucket.substr(0, 3))
      cy.get('.cf-resource-card')
        .should('have.length', 1)
        .should('contain', defaultBucket)
    })

    // clear filter and assert all buckets are visible
    cy.getByTestID('search-widget').clear()
    cy.get('.cf-resource-card').should('have.length', 3)
  })
})
