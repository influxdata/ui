import {Organization} from '../../../src/types'

const setupData = (cy: Cypress.Chainable, enableMeasurementSchema = false) =>
  cy.flush().then(() =>
    cy.signin().then(() =>
      cy.get('@org').then(({id}: Organization) =>
        cy.fixture('routes').then(({orgs, buckets}) => {
          cy.visit(`${orgs}/${id}${buckets}`)
          return cy
            .setFeatureFlags({measurementSchema: enableMeasurementSchema})
            .then(() => {
              return cy.getByTestID('tree-nav')
            })
        })
      )
    )
  )
describe('Explicit Buckets', () => {
  beforeEach(() => {
    setupData(cy, true)
  })

  it('can create a bucket with an explicit schema', () => {
    cy.getByTestID('Create Bucket').click()
    cy.getByTestID('overlay--container').within(() => {
      cy.getByInputName('name').type('explicit-bucket-test')

      cy.getByTestID('schemaBucketToggle').click()

      // measurement schema section should NOT be showing at this time
      // (b/c in 'implicit' mode by default)
      cy.getByTestID('measurement-schema-section-parent').should('not.exist')

      const explicitBtn = cy.getByTestID('explicit-bucket-schema-choice-ID')
      explicitBtn.should('be.visible')
      explicitBtn.click()

      // measurement schema section should BE showing at this time
      // (b/c just changed mode to explicit)
      cy.getByTestID('measurement-schema-section-parent').should('exist')

      cy.getByTestID('bucket-form-submit').click()
    })

    cy.getByTestID('bucket-card explicit-bucket-test').within($card => {
      expect($card.length).to.equal(1)

      // should have an explicit schema tag in the meta card:
      cy.getByTestID('bucket-schemaType').contains('Schema Type: Explicit')

      // should have the show schema button in the actions:
      cy.getByTestID('bucket-showSchema').contains('Show Schema')

      // click on settings; open up the advanced section, and should see the "explicit" as the bucket schema type:
      cy.getByTestID('bucket-settings').click()
    })
    cy.getByTestID('overlay--container').within(() => {
      cy.getByTestID('schemaBucketToggle').click()
      cy.getByTestID('bucket-readonly-schema-label').contains('Explicit')

      // the  radio buttons should NOT be there:
      cy.getByTestID('explicit-bucket-schema-choice-ID').should('not.exist')

      // measurement schema section should BE showing at this time
      // (b/c just added capability to add schemas)
      cy.getByTestID('measurement-schema-section-parent').should('exist')
    })
  })

  it('can create a (normal) bucket with an implicit schema', () => {
    cy.getByTestID('Create Bucket').click()
    cy.getByTestID('overlay--container').within(() => {
      cy.getByInputName('name').type('implicit-bucket-test')

      cy.getByTestID('schemaBucketToggle').click()

      // check that it is there; but don't click on it; leave it as implicit:
      cy.getByTestID('explicit-bucket-schema-choice-ID').should('be.visible')

      // implicit button should be selected by default:
      cy.getByTestID('implicit-bucket-schema-choice-ID--input').should(
        'be.checked'
      )

      // measurement schema section should NOT be showing at this time
      // (b/c it only shows if explicit is set)
      cy.getByTestID('measurement-schema-section-parent').should('not.exist')

      cy.getByTestID('bucket-form-submit').click()
    })

    cy.getByTestID('bucket-card implicit-bucket-test').within($card => {
      expect($card.length).to.equal(1)

      // should have an implicit schema tag in the meta card:
      cy.getByTestID('bucket-schemaType').contains('Schema Type: Implicit')

      // should NOT have the show schema button in the actions:
      cy.getByTestID('bucket-showSchema').should('not.exist')

      // click on settings; open up the advanced section, and should see the "implicit" as the bucket schema type:
      cy.getByTestID('bucket-settings').click()
    })
    cy.getByTestID('overlay--container').within(() => {
      cy.getByTestID('schemaBucketToggle').click()
      cy.getByTestID('bucket-readonly-schema-label').contains('Implicit')

      // the  radio buttons should NOT be there:
      cy.getByTestID('explicit-bucket-schema-choice-ID').should('not.exist')

      // measurement schema section should NOT be showing at this time
      // (b/c it only shows if explicit is set)
      cy.getByTestID('measurement-schema-section-parent').should('not.exist')
    })
  })
  it('should be able to create an explicit bucket using one schema file', function() {
    cy.getByTestID('Create Bucket').click()
    cy.getByTestID('bucket-form-name').type('explicit_bucket')
    cy.getByTestID('accordion-header').click()
    cy.getByTestID('explicit-bucket-schema-choice-ID').click()
    cy.getByTestID('measurement-schema-add-file-button').click()
    cy.getByTestID('input-field').type('first schema file')

    const schemaFile = 'valid.json'
    const type = 'application/json'
    const testFile = new File(
      [
        `[{"name":"time","type":"timestamp"},
        {"name":"fsWrite","type":"field","dataType":"float"} ]`,
      ],
      schemaFile,
      {type}
    )

    const event = {dataTransfer: {files: [testFile]}, force: true}
    cy.getByTestID('dndContainer')
      .trigger('dragover', event)
      .trigger('drop', event)

    cy.getByTestID('bucket-form-submit').click()

    cy.getByTestID(`bucket-card explicit_bucket`)
      .should('exist')
      .within(() => {
        cy.getByTestID('bucket-settings').click()
      })
    cy.getByTestID('accordion-header').click()

    cy.getByTestID('measurement-schema-readOnly-panel-0')
      .should('exist')
      .within(() => {
        cy.getByTestID('measurement-schema-name-0')
          .contains('first schema file')
          .should('exist')
        cy.getByTestID('measurement-schema-download-button').click()
        cy.readFile(`cypress/downloads/first_schema_file.json`)
          .should('exist')
          .then(fileContent => {
            expect(fileContent[0].name).to.be.equal('time')
            expect(fileContent[0].type).to.be.equal('timestamp')

            expect(fileContent[1].name).to.be.equal('fsWrite')
            expect(fileContent[1].type).to.be.equal('field')
            expect(fileContent[1].dataType).to.be.equal('float')
          })
      })
  })

  it('should be able to create an explicit bucket and add schema file during editing', function() {
    cy.getByTestID('Create Bucket').click()
    cy.getByTestID('bucket-form-name').type('explicit_bucket')
    cy.getByTestID('accordion-header').click()
    cy.getByTestID('explicit-bucket-schema-choice-ID').click()

    cy.getByTestID('bucket-form-submit').click()

    cy.getByTestID(`bucket-card explicit_bucket`)
      .should('exist')
      .within(() => {
        cy.getByTestID('bucket-settings').click()
      })
    cy.getByTestID('accordion-header').click()

    cy.getByTestID('measurement-schema-add-file-button').click()
    cy.getByTestID('input-field').type('first schema file')

    const schemaFile = 'valid.json'
    const type = 'application/json'
    const testFile = new File(
      [
        `[{"name":"time","type":"timestamp"},
        {"name":"fsWrite","type":"field","dataType":"float"} ]`,
      ],
      schemaFile,
      {type}
    )

    const event = {dataTransfer: {files: [testFile]}, force: true}
    cy.getByTestID('dndContainer')
      .trigger('dragover', event)
      .trigger('drop', event)

    cy.getByTestID('bucket-form-submit').click()

    cy.getByTestID(`bucket-card explicit_bucket`)
      .should('exist')
      .within(() => {
        cy.getByTestID('bucket-settings').click()
      })
    cy.getByTestID('accordion-header').click()

    cy.getByTestID('measurement-schema-readOnly-panel-0')
      .should('exist')
      .within(() => {
        cy.getByTestID('measurement-schema-name-0')
          .contains('first schema file')
          .should('exist')
      })
  })
})

describe('Buckets', () => {
  beforeEach(() => {
    setupData(cy)
  })

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
        defaultBucket,
        monitoringBucket,
        demoDataBucket,
        tasksBucket,
      ]
      const retentionAsc = [
        tasksBucket,
        monitoringBucket,
        demoDataBucket,
        defaultBucket,
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
