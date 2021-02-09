import {Bucket, Organization} from '../../../src/types'

describe('Buckets', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) =>
        cy.fixture('routes').then(({orgs, buckets}) => {
          cy.visit(`${orgs}/${id}${buckets}`)
          cy.getByTestID('tree-nav')
          cy.window().then(win => {
            win.influx.set('csvUploader', true)
            cy.getByTestID('tree-nav')
          })
        })
      )
    })
  })

  describe('from the buckets index page', () => {
    it('can create a bucket', () => {
      const newBucket = '🅱️ucket'
      cy.getByTestID(`bucket--card--name ${newBucket}`).should('not.exist')

      cy.getByTestID('Create Bucket').click()
      cy.getByTestID('overlay--container').within(() => {
        cy.getByInputName('name').type(newBucket)
        cy.get('.cf-button')
          .contains('Create')
          .click()
      })

      cy.getByTestID(`bucket--card--name ${newBucket}`).should('exist')

      // Add a label
      cy.getByTestID('inline-labels--add')
        .first()
        .click()

      const labelName = 'l1'
      cy.getByTestID('inline-labels--popover--contents').type(labelName)
      cy.getByTestID('inline-labels--create-new').click()
      // Wait for animation to complete
      cy.wait(500)
      cy.getByTestID('create-label-form--submit').click()

      // Delete the label
      cy.getByTestID(`label--pill--delete ${labelName}`).click({force: true})
      cy.getByTestID('inline-labels--empty').should('exist')
    })

    it('can create a bucket with retention', () => {
      const newBucket = '🅱️ucket'
      cy.getByTestID(`bucket-card ${newBucket}`).should('not.exist')

      // create bucket with retention
      cy.getByTestID('Create Bucket').click()
      cy.getByTestID('overlay--container').within(() => {
        cy.getByInputName('name').type(newBucket)
        cy.getByTestID('retention-intervals--button').click()
        cy.getByTestID('duration-selector--button').click()
        cy.getByTestID('duration-selector--12h')
          .click()
          .then(() => {
            cy.getByTestID('bucket-form-submit').click()
          })
      })

      // assert bucket with retention
      cy.getByTestID(`bucket-card ${newBucket}`)
        .should('exist')
        .within(() => {
          cy.getByTestID('bucket-retention').should('contain', '12 hours')
        })
    })

    it("can update a bucket's retention rules", () => {
      cy.get<Bucket>('@bucket').then(({name}: Bucket) => {
        cy.getByTestID(`bucket-settings`).click()
        cy.getByTestID(`bucket--card--name ${name}`).should(
          'not.contain',
          '7 days'
        )
      })

      cy.getByTestID('retention-intervals--button').click()
      cy.getByTestID('duration-selector--button').click()
      cy.getByTestID('duration-selector--7d').click()

      cy.getByTestID('overlay--container').within(() => {
        cy.contains('Save').click()
      })

      cy.get<Bucket>('@bucket').then(() => {
        cy.getByTestID(`bucket-retention`).should('contain', '7 days')
      })
    })

    it('can delete a bucket', () => {
      const bucket1 = 'newbucket1'
      cy.get<Organization>('@org').then(({id, name}: Organization) => {
        cy.createBucket(id, name, bucket1)
      })

      cy.getByTestID(`bucket-card ${bucket1}`).trigger('mouseover')
      cy.getByTestID(`context-delete-menu ${bucket1}`).click()
      cy.intercept('DELETE', '/buckets').as('deleteBucket')
      cy.getByTestID(`context-delete-bucket ${bucket1}`).click({force: true})
      cy.wait('@deleteBucket')
      cy.getByTestID(`bucket--card--name ${bucket1}`).should('not.exist')
    })
  })

  // skipping until feature flag feature is removed for deleteWithPredicate
  describe.skip('should default the bucket to the selected bucket', () => {
    beforeEach(() => {
      cy.get<Organization>('@org').then(({id, name}) => {
        cy.createBucket(id, name, 'Funky Town').then(() => {
          cy.createBucket(id, name, 'ABC').then(() => {
            cy.createBucket(id, name, 'Jimmy Mack')
          })
        })
      })
    })

    it('should set the default bucket in the dropdown to the selected bucket', () => {
      cy.getByTestID('bucket-delete-task')
        .first()
        .click()
        .then(() => {
          cy.getByTestID('dropdown--button').contains('ABC')
          cy.get('.cf-overlay--dismiss').click()
        })
        .then(() => {
          cy.getByTestID('bucket-delete-task')
            .last()
            .click()
            .then(() => {
              cy.getByTestID('dropdown--button').contains('Jimmy Mack')
            })
        })
    })

    it('alphabetizes buckets', () => {
      cy.getByTestID('bucket-delete-task')
        .first()
        .click()
        .then(() => {
          cy.getByTestID('dropdown--button')
            .contains('ABC')
            .click()
            .then(() => {
              // get the bucket list
              cy.get('.cf-dropdown-item--children')
                .should('have.length', 6)
                .then(el => {
                  const results = []
                  // output in an array
                  el.text((index, currentContent) => {
                    results[index] = currentContent
                  })
                  cy.get<string>('@defaultBucket').then(
                    (defaultBucket: string) => {
                      const expectedOrder = [
                        'ABC',
                        defaultBucket,
                        'Funky Town',
                        'Jimmy Mack',
                        '_monitoring',
                        '_tasks',
                      ]
                      // check the order
                      expect(results).to.deep.equal(expectedOrder)
                    }
                  )
                })
            })
        })
    })
  })

  // skipping until feature flag feature is removed for deleteWithPredicate
  describe.skip('delete with predicate', () => {
    beforeEach(() => {
      cy.getByTestID('bucket-delete-task').click()
      cy.getByTestID('overlay--container').should('have.length', 1)
    })

    it('requires consent to perform delete with predicate', () => {
      // confirm delete is disabled
      cy.getByTestID('confirm-delete-btn').should('be.disabled')
      // checks the consent input
      cy.getByTestID('delete-checkbox').check({force: true})
      // can delete
      cy.getByTestID('confirm-delete-btn')
        .should('not.be.disabled')
        .click()
    })

    // this is currently not producing success, its actually failing, im going to write a separate issue for this
    it('closes the overlay upon a successful delete with predicate submission', () => {
      cy.getByTestID('delete-checkbox').check({force: true})
      cy.getByTestID('confirm-delete-btn').click()
      cy.getByTestID('overlay--container').should('not.exist')
      cy.getByTestID('notification-success').should('have.length', 1)
    })
    // needs relevant data in order to test functionality
    it.skip('should require key-value pairs when deleting predicate with filters', () => {
      // confirm delete is disabled
      cy.getByTestID('add-filter-btn').click()
      // checks the consent input
      cy.getByTestID('delete-checkbox').check({force: true})
      // cannot delete
      cy.getByTestID('confirm-delete-btn').should('be.disabled')

      // should display warnings
      cy.getByTestID('form--element-error').should('have.length', 2)

      // TODO: add filter values based on dropdown selection in key / value
    })
  })

  describe('routing directly to the edit overlay', () => {
    it('reroutes to buckets view if bucket does not exist', () => {
      cy.get('@org').then(({id}: Organization) => {
        cy.fixture('routes').then(({orgs, buckets}) => {
          const idThatDoesntExist = '261234d1a7f932e4'
          cy.visit(`${orgs}/${id}${buckets}/${idThatDoesntExist}/edit`)
          cy.location('pathname').should('contain', `${orgs}/${id}${buckets}/`)
        })
      })
    })

    it('displays overlay if bucket exists', () => {
      cy.get('@org').then(({id: orgID}: Organization) => {
        cy.fixture('routes').then(({orgs, buckets}) => {
          cy.get('@bucket').then(({id: bucketID}: Bucket) => {
            cy.visit(`${orgs}/${orgID}${buckets}/${bucketID}/edit`)
            cy.location('pathname').should(
              'contain',
              `${orgs}/${orgID}${buckets}/${bucketID}/edit`
            )
          })
          cy.getByTestID(`overlay`).should('exist')
        })
      })
    })
  })

  describe('add data', function() {
    it('can write data to buckets', () => {
      cy.get('@org').then(({id: orgID}: Organization) => {
        // writing a well-formed line is accepted
        cy.getByTestID('add-data--button').click()
        cy.getByTestID('bucket-add-client-library').click()
        cy.location('pathname').should('contain', `/orgs/${orgID}/load-data/`)
        cy.go('back')
        cy.getByTestID('add-data--button').click()

        cy.getByTestID('bucket-add-line-protocol').click()
        cy.getByTestID('Enter Manually').click()
        cy.getByTestID('lp-write-data--button').should('be.disabled')
        cy.getByTestID('line-protocol--text-area').type('m1,t1=v1 v=1.0')
        cy.getByTestID('lp-write-data--button').click()
        cy.getByTestID('line-protocol--status').contains('Success')
        cy.getByTestID('lp-close--button').click()

        // writing a poorly-formed line errors
        cy.getByTestID('add-data--button').click()
        cy.getByTestID('bucket-add-line-protocol').click()
        cy.getByTestID('Enter Manually').click()
        cy.getByTestID('line-protocol--text-area').type('invalid invalid')
        cy.getByTestID('lp-write-data--button').click()
        cy.getByTestID('line-protocol--status').contains('Unable')
        cy.getByTestID('lp-cancel--button').click()

        // writing a well-formed line with millisecond precision is accepted
        cy.getByTestID('wizard-step--lp-precision--dropdown').click()
        cy.getByTestID('wizard-step--lp-precision-ms').click()
        const now = Date.now()
        cy.getByTestID('line-protocol--text-area').type(`m2,t2=v2 v=2.0 ${now}`)
        cy.getByTestID('lp-write-data--button').click()
        cy.getByTestID('line-protocol--status').contains('Success')
      })
    })

    it('upload a file and write data', () => {
      cy.getByTestID('add-data--button').click()
      cy.getByTestID('bucket-add-line-protocol').click()
      cy.getByTestID('Upload File').click()

      // When a file is larger than 10MB
      const bigFile = 'data-big.txt'
      const type = 'plain/text'
      const testFile = new File(
        ['a'.repeat(1e7) + 'just a bit over 10mb'],
        bigFile,
        {type}
      )
      const event = {dataTransfer: {files: [testFile]}, force: true}
      cy.getByTestID('drag-and-drop--input')
        .trigger('dragover', event)
        .trigger('drop', event)

      cy.getByTestID('dnd--header-error').contains(bigFile)
      cy.getByTestID('cancel-upload--button').click()

      cy.getByTestID('wizard-step--lp-precision--dropdown').click()
      cy.getByTestID('wizard-step--lp-precision-ms').click()
      cy.getByTestID('wizard-step--lp-precision--dropdown').contains(
        'Milliseconds'
      )

      // When a file is the correct size
      const smallFile = 'data.txt'
      cy.fixture(smallFile, 'base64')
        .then(Cypress.Blob.base64StringToBlob)
        .then(blob => {
          const type = 'plain/text'
          const testFile = new File([blob], smallFile, {type})
          const event = {dataTransfer: {files: [testFile]}, force: true}
          cy.getByTestID('drag-and-drop--input')
            .trigger('dragover', event)
            .trigger('drop', event)
        })

      cy.getByTestID('write-data--button').click()
      cy.getByTestID('lp-close--button').click()

      // navigate to data explorer to see data
      cy.getByTestID('nav-item-data-explorer').click({force: true})
      cy.getByTestID('timerange-dropdown').click()
      cy.getByTestID('dropdown-item-customtimerange').click()

      // time range start
      cy.getByTestID('timerange--input')
        .first()
        .clear()
        .type('2020-08-06 00:00:00.000')

      // time range stop
      cy.getByTestID('timerange--input')
        .last()
        .clear()
        .type('2020-08-08 00:00:00.000')

      cy.getByTestID('daterange--apply-btn').click()

      // TODO replace this with proper health checks
      cy.wait(1000)
      cy.get<string>('@defaultBucketListSelector').then(
        (defaultBucketListSelector: string) => {
          cy.getByTestID(defaultBucketListSelector).click()
        }
      )
      // mymeasurement comes from fixtures/data.txt
      cy.getByTestID('selector-list mymeasurement').should('exist')
    })

    it('configure telegraf agent', () => {
      // click "add data" and choose Configure Telegraf Agent
      cy.getByTestID('add-data--button').click()
      cy.get('.bucket-add-data--option')
        .contains('Configure Telegraf Agent')
        .click()

      // assert default bucket
      cy.get<string>('@defaultBucket').then((defaultBucket: string) => {
        cy.getByTestID('bucket-dropdown--button').should(
          'contain',
          defaultBucket
        )
      })

      // filter plugins and choose system
      cy.getByTestID('input-field')
        .type('sys')
        .then(() => {
          cy.getByTestID('square-grid--card').should('have.length', 1)
          cy.getByTestID('input-field')
            .clear()
            .then(() => {
              cy.getByTestID('square-grid--card').should('have.length', 5)
            })
        })
      cy.getByTestID('telegraf-plugins--System').click()
      cy.getByTestID('next').click()

      // add telegraf name and description
      cy.getByTitle('Telegraf Configuration Name')
        .clear()
        .type('Telegraf from bucket')
      cy.getByTitle('Telegraf Configuration Description')
        .clear()
        .type('This is a telegraf description')
      cy.getByTestID('next').click()

      // assert notifications
      cy.getByTestID('notification-success').should(
        'contain',
        'Your configurations have been saved'
      )
      cy.getByTestID('notification-success').should(
        'contain',
        'Successfully created dashboards for telegraf plugin: system.'
      )
      cy.getByTestID('next').click()

      // assert telegraf card parameters
      cy.getByTestID('collector-card--name').should(
        'contain',
        'Telegraf from bucket'
      )
      cy.getByTestID('resource-list--editable-description').should(
        'contain',
        'This is a telegraf description'
      )
      cy.get<string>('@defaultBucket').then((defaultBucket: string) => {
        cy.getByTestID('bucket-name').should('contain', defaultBucket)
      })
    })
  })

  describe('upload csv', function() {
    it('can write a properly annotated csv', () => {
      // Navigate to csv uploader
      cy.getByTestID('add-data--button').click()
      cy.getByTestID('bucket-add-csv').click()

      // Upload the file
      const csv = 'good-csv.csv'
      cy.fixture(csv, 'base64')
        .then(Cypress.Blob.base64StringToBlob)
        .then(blob => {
          const type = 'plain/text'
          const testFile = new File([blob], csv, {type})
          const event = {dataTransfer: {files: [testFile]}, force: true}
          cy.getByTestID('drag-and-drop--input')
            .trigger('dragover', event)
            .trigger('drop', event)
        })

      cy.getByTestID('csv-uploader--success')
    })

    it('fails to write improperly formatted csv', () => {
      // Navigate to csv uploader
      cy.getByTestID('add-data--button').click()
      cy.getByTestID('bucket-add-csv').click()

      // Upload the file
      const csv = 'missing-column-csv.csv'
      cy.fixture(csv, 'base64')
        .then(Cypress.Blob.base64StringToBlob)
        .then(blob => {
          const type = 'plain/text'
          const testFile = new File([blob], csv, {type})
          const event = {dataTransfer: {files: [testFile]}, force: true}
          cy.getByTestID('drag-and-drop--input')
            .trigger('dragover', event)
            .trigger('drop', event)
        })

      cy.getByTestID('csv-uploader--error')
      cy.getByTestID('notification-error').should('be.visible')
    })
  })
})
