import {Organization} from '../../../src/types'

describe('Buckets', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) =>
        cy.fixture('routes').then(({orgs, buckets}) => {
          cy.visit(`${orgs}/${id}${buckets}`)
          cy.getByTestID('tree-nav')
        })
      )
    })
  })

  // TODO: Skipping this until we can sort out the differences between OSS and Cloud
  it('can sort by name and retention', () => {
    cy.get<string>('@defaultBucket').then((defaultBucket: string) => {
      const demoDataBucket = 'Website Monitoring Bucket'
      const tasksBucket = '_tasks'
      const monitoringBucket = '_monitoring'
      const buckets = [
        demoDataBucket,
        defaultBucket,
        tasksBucket,
        monitoringBucket,
      ]
      const retentionDesc = [
        monitoringBucket,
        demoDataBucket,
        tasksBucket,
        defaultBucket,
      ]
      const retentionAsc = [
        defaultBucket,
        tasksBucket,
        monitoringBucket,
        demoDataBucket,
      ]

      // if demo data bucket doesn't exist, create a bucket with the same name
      cy.getByTestID('resource-list').then($body => {
        if (
          $body.find(`[data-testid="bucket-card ${demoDataBucket}"]`).length ===
          0
        ) {
          cy.getByTestID(`bucket-card ${demoDataBucket}`).should('not.exist')
          cy.getByTestID('Create Bucket').click()
          cy.getByTestID('overlay--container').within(() => {
            cy.getByInputName('name').type(demoDataBucket)
            cy.getByTestID('retention-intervals--button').click()
            cy.getByTestID('duration-selector--button').click()
            cy.getByTestID('duration-selector--7d')
              .click()
              .then(() => {
                cy.getByTestID('bucket-form-submit').click()
              })
          })
        }
      })

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

      cy.get<string>('@defaultBucket').then((defaultBucket: string) => {
        cy.get('.cf-resource-card')
          .should('have.length', 1)
          .should('contain', defaultBucket)
      })

      // clear filter and assert all buckets are visible
      cy.getByTestID('search-widget').clear()
      cy.get('.cf-resource-card').should('have.length', 4)
    })
  })
})
