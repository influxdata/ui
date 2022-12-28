import {Organization} from '../../../src/types'

const setup = (cy: Cypress.Chainable) =>
  cy.flush().then(() =>
    cy.signin().then(() =>
      cy.get('@org').then(({id}: Organization) =>
        cy.fixture('routes').then(({orgs, buckets}) => {
          cy.visit(`${orgs}/${id}${buckets}`)
          return cy.getByTestID('tree-nav')
        })
      )
    )
  )

const bucketName = 'explicit_bucket'
const READFILE_TIMEOUT = 90000
const getDownloadedFileName = (
  schemaName: string,
  fileFormat: string
): string => {
  return `cypress/downloads/${schemaName.split(' ').join('_')}.${fileFormat}`
}

const testSchemaFiles = (
  cy: Cypress.Chainable,
  schemaName: string,
  flavorChoice: string,
  origFileContents: string,
  fixtureFileName: string,
  checkContents: (cy: Cypress.Chainable) => void
) => {
  cy.getByTestID('Create Bucket').click()
  cy.getByTestID('create-bucket-form').should('be.visible')
  cy.getByTestID('bucket-form-name').type(bucketName)
  cy.getByTestID('accordion-header').click()
  cy.getByTestID('create-bucket-schema-type-toggle-box').should('be.visible')
  cy.getByTestID('explicit-bucket-schema-choice-ID').click()
  cy.getByTestID('measurement-schema-section-parent').should('be.visible')

  cy.getByTestID('bucket-form-submit').click()

  // make sure the overlay is closed!
  cy.getByTestID('create-bucket-form').should('not.exist')

  cy.getByTestID(`bucket-card ${bucketName}`)
    .should('exist')
    .within(() => {
      cy.getByTestID('bucket-settings').click()
    })

  cy.getByTestID('bucket-form').should('be.visible')
  cy.getByTestID('accordion-header').click()
  cy.getByTestID('measurement-schema-section-parent').should('be.visible')

  cy.getByTestID('measurement-schema-add-file-button').click()
  cy.getByTestID('measurement-schema-readOnly-panel-0').should('be.visible')
  cy.getByTestID('input-field').type(schemaName)

  cy.getByTestID('drag-and-drop--input').attachFile(fixtureFileName)

  // make sure the file is there before moving on to the next step:
  cy.getByTestID('displayArea').contains(fixtureFileName)

  cy.getByTestID('bucket-form-submit').click()
  cy.getByTestID('notification-success').should('be.visible')
  cy.getByTestID('bucket-form').should('not.exist')

  cy.getByTestID(`bucket-card ${bucketName}`)
    .should('exist')
    .within(() => {
      cy.getByTestID('bucket-settings').click()
    })

  cy.getByTestID('bucket-form').should('be.visible')
  cy.getByTestID('accordion-header').click()

  cy.getByTestID('accordion--advanced-section')
    .should('be.visible')
    .within(() => {
      cy.getByTestID(flavorChoice).click()
      cy.get(`label[for='${flavorChoice}']`).should(
        'have.class',
        'cf-input-label__active'
      )

      cy.getByTestID('measurement-schema-readOnly-panel-0')
        .should('be.visible')
        .within(() => {
          cy.getByTestID('measurement-schema-name-0').contains(schemaName)

          cy.getByTestID('measurement-schema-download-button').click()

          checkContents(cy)
        })
    })
}

describe('Explicit Buckets', () => {
  beforeEach(() => {
    setup(cy)
  })

  it('can create a bucket with an explicit schema', () => {
    // TODO: iox is not yet supporting explicit schema.
    cy.isIoxOrg().then(isIox => {
      cy.skipOn(isIox)
    })
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

    // make sure the overlay is closed!
    cy.getByTestID('create-bucket-form').should('not.exist')

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

      cy.isIoxOrg().then(isIox => {
        // TODO: iox is not yet supporting explicit schema.
        if (!isIox) {
          cy.getByTestID('schemaBucketToggle').click()

          // check that it is there; but don't click on it; leave it as implicit:
          cy.getByTestID('explicit-bucket-schema-choice-ID').should(
            'be.visible'
          )

          // implicit button should be selected by default:
          cy.getByTestID('implicit-bucket-schema-choice-ID--input').should(
            'be.checked'
          )
        }
      })

      // measurement schema section should NOT be showing at this time
      // (b/c it only shows if explicit is set)
      cy.getByTestID('measurement-schema-section-parent').should('not.exist')

      cy.getByTestID('bucket-form-submit').click()
    })

    // make sure the overlay is closed!
    cy.getByTestID('create-bucket-form').should('not.exist')

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

  it('should be able to create an explicit bucket using one schema file', function () {
    // TODO: iox is not yet supporting explicit schema.
    cy.isIoxOrg().then(isIox => {
      cy.skipOn(isIox)
    })
    const schemaName = 'only one schema'
    const filename = 'validSchema1.json'

    cy.getByTestID('Create Bucket').click()
    cy.getByTestID('create-bucket-form').should('be.visible')
    cy.getByTestID('bucket-form-name').type(bucketName)
    cy.getByTestID('accordion-header').click()
    cy.getByTestID('create-bucket-schema-type-toggle-box').should('be.visible')
    cy.getByTestID('explicit-bucket-schema-choice-ID').click()
    cy.getByTestID('measurement-schema-section-parent').should('be.visible')

    cy.getByTestID('measurement-schema-add-file-button').click()
    cy.getByTestID('measurement-schema-readOnly-panel-0').should('be.visible')
    cy.getByTestID('input-field').type(schemaName)

    cy.getByTestID('drag-and-drop--input').attachFile(filename)

    // make sure the file is there before moving on to the next step:
    cy.getByTestID('displayArea').contains(filename)

    cy.getByTestID('bucket-form-submit').click()
    cy.getByTestID('notification-success').should('be.visible')
    cy.getByTestID('bucket-form').should('not.exist')

    cy.getByTestID(`bucket-card ${bucketName}`)
      .should('exist')
      .within(() => {
        cy.getByTestID('bucket-settings').click()
      })

    cy.getByTestID('bucket-form').should('be.visible')
    cy.getByTestID('accordion-header').click()

    cy.getByTestID('measurement-schema-readOnly-panel-0')
      .should('be.visible')
      .within(() => {
        cy.getByTestID('measurement-schema-name-0').contains(schemaName)

        cy.getByTestID('measurement-schema-download-button').click()
        cy.readFile(getDownloadedFileName(schemaName, 'json'), 'utf-8', {
          timeout: READFILE_TIMEOUT,
        }).should(fileContent => {
          expect(Array.isArray(fileContent)).to.equal(true)
          expect(fileContent.length).equal(2)
          expect(fileContent).to.deep.equal([
            {name: 'time', type: 'timestamp'},
            {name: 'fsWrite', type: 'field', dataType: 'float'},
          ])
        })
      })
  })

  it('should be able to create an explicit bucket and add json schema file during editing', function () {
    // TODO: iox is not yet supporting explicit schema.
    cy.isIoxOrg().then(isIox => {
      cy.skipOn(isIox)
    })
    const origFileContents = `[{"name":"time","type":"timestamp"},
        {"name":"fsWrite","type":"field","dataType":"float"} ]`

    const schemaName = 'schema json file'
    const checkContents = (cy: Cypress.Chainable) => {
      cy.readFile(getDownloadedFileName(schemaName, 'json'), 'utf-8', {
        timeout: READFILE_TIMEOUT,
      }).should(fileContent => {
        expect(Array.isArray(fileContent)).to.equal(true)
        expect(fileContent.length).equal(2)
        expect(fileContent).to.deep.equal([
          {name: 'time', type: 'timestamp'},
          {name: 'fsWrite', type: 'field', dataType: 'float'},
        ])
      })
    }

    testSchemaFiles(
      cy,
      schemaName,
      'json-download-flavor-choice',
      origFileContents,
      'validSchema1.json',
      checkContents
    )
  })

  it('should be able to create an explicit bucket and add csv schema file during editing', function () {
    // TODO: iox is not yet supporting explicit schema.
    cy.isIoxOrg().then(isIox => {
      cy.skipOn(isIox)
    })
    const origFileContents = `name,type,dataType
time,timestamp,
host,tag,
service,tag,
fsRead,field,float`

    const schemaName = 'schema csv file'
    const checkContents = (cy: Cypress.Chainable) => {
      cy.readFile(getDownloadedFileName(schemaName, 'csv'), 'utf-8', {
        timeout: READFILE_TIMEOUT,
      }).should('eq', origFileContents)
    }
    testSchemaFiles(
      cy,
      schemaName,
      'csv-download-flavor-choice',
      origFileContents,
      'schema.csv',
      checkContents
    )
  })

  it('should be able to create an explicit bucket and update the existing schema file during editing', function () {
    // TODO: iox is not yet supporting explicit schema.
    cy.isIoxOrg().then(isIox => {
      cy.skipOn(isIox)
    })
    cy.getByTestID('Create Bucket').click()
    cy.getByTestID('create-bucket-form').should('be.visible')
    cy.getByTestID('bucket-form-name').type(bucketName)
    cy.getByTestID('accordion-header').click()
    cy.getByTestID('create-bucket-schema-type-toggle-box').should('be.visible')
    cy.getByTestID('explicit-bucket-schema-choice-ID').click()
    cy.getByTestID('measurement-schema-section-parent').should('be.visible')

    cy.getByTestID('bucket-form-submit').click()

    // make sure the overlay is closed!
    cy.getByTestID('create-bucket-form').should('not.exist')

    cy.getByTestID(`bucket-card ${bucketName}`)
      .should('exist')
      .within(() => {
        cy.getByTestID('bucket-settings').click()
      })

    const schemaName = 'updated schema'
    const fileName = 'validSchema1.json'

    cy.getByTestID('bucket-form').should('be.visible')
    cy.getByTestID('accordion-header').click()
    cy.getByTestID('measurement-schema-section-parent').should('be.visible')

    cy.getByTestID('measurement-schema-add-file-button').click()
    cy.getByTestID('measurement-schema-readOnly-panel-0').should('be.visible')
    cy.getByTestID('input-field').type(schemaName)

    cy.getByTestID('drag-and-drop--input').attachFile(fileName)

    // make sure the file is there before moving on to the next step:
    cy.getByTestID('displayArea').contains(fileName)

    cy.getByTestID('bucket-form-submit').click()
    cy.getByTestID('notification-success').should('be.visible')
    cy.getByTestID('bucket-form').should('not.exist')

    cy.getByTestID(`bucket-card ${bucketName}`)
      .should('exist')
      .within(() => {
        cy.getByTestID('bucket-settings').click()
      })

    cy.getByTestID('bucket-form').should('be.visible')
    cy.getByTestID('accordion-header').click()

    cy.getByTestID('accordion--advanced-section').should('be.visible')

    cy.getByTestID('measurement-schema-name-0').contains(schemaName)

    // cancel button should not be showing yet
    cy.getByTestID('dndContainer-cancel-update').should('not.exist')

    // use the invalid file first to test the error handling
    cy.getByTestID('drag-and-drop--input').attachFile('invalidSchema.json')

    // should show error
    cy.getByTestID('form--element-error').should('be.visible')

    // cancel it
    cy.getByTestID('dndContainer-cancel-update').click()

    // error should be gone
    cy.getByTestID('form--element-error').should('not.exist')

    const updateFilename = 'updateValidSchema1.json'
    // add the valid one
    cy.getByTestID('drag-and-drop--input').attachFile(updateFilename)

    // make sure the file is there before moving on to the next step:
    cy.getByTestID('displayArea').contains(updateFilename)
    cy.getByTestID('bucket-form-submit').click()

    cy.getByTestID('notification-success').should('be.visible')
    cy.getByTestID('bucket-form').should('not.exist')

    cy.getByTestID(`bucket-card ${bucketName}`)
      .should('exist')
      .within(() => {
        cy.getByTestID('bucket-settings').click()
      })

    cy.getByTestID('bucket-form').should('be.visible')
    cy.getByTestID('accordion-header').click()

    cy.getByTestID('measurement-schema-readOnly-panel-0').should('be.visible')

    cy.getByTestID('measurement-schema-name-0').contains(schemaName)

    cy.getByTestID('measurement-schema-download-button').click()
    cy.readFile(getDownloadedFileName(schemaName, 'json'), 'utf-8', {
      timeout: READFILE_TIMEOUT,
    }).should(fileContent => {
      expect(Array.isArray(fileContent)).to.equal(true)
      expect(fileContent.length).equal(3)
      expect(fileContent).to.deep.equal([
        {name: 'time', type: 'timestamp'},
        {name: 'fsWrite', type: 'field', dataType: 'float'},
        {name: 'hello there', type: 'field', dataType: 'string'},
      ])
    })
  })
})

describe('Buckets', () => {
  beforeEach(() => {
    setup(cy)
  })

  it('can sort by name and retention', () => {
    cy.get<string>('@defaultBucket').then((defaultBucket: string) => {
      const tasksBucket = '_tasks'
      const monitoringBucket = '_monitoring'
      const createdBucket = 'womp womp'
      const buckets = [
        createdBucket,
        defaultBucket,
        tasksBucket,
        monitoringBucket,
      ]
      const retentionDesc = [
        defaultBucket,
        createdBucket,
        monitoringBucket,
        tasksBucket,
      ]
      const retentionAsc = [
        createdBucket,
        defaultBucket,
        tasksBucket,
        monitoringBucket,
      ]

      cy.getByTestID('Create Bucket').click()
      cy.getByTestID('overlay--container').within(() => {
        cy.getByInputName('name').type(createdBucket)
        cy.getByTestID('retention-intervals--button').click()
        cy.getByTestID('duration-selector--button').click()
        cy.getByTestID('duration-selector--7d')
          .click()
          .then(() => {
            cy.getByTestID('bucket-form-submit').click()
          })
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
