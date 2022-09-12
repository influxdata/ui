import {Bucket, Organization} from '../../../src/types'

describe('Buckets', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.get('@org').then(({id}: Organization) =>
      cy.fixture('routes').then(({orgs, buckets}) => {
        cy.visit(`${orgs}/${id}${buckets}`)
      })
    )
    cy.getByTestID('tree-nav')
  })

  describe('the buckets index page', () => {
    it('can create a bucket', () => {
      const newBucket = '🅱️ucket'
      cy.getByTestID(`bucket--card--name ${newBucket}`).should('not.exist')

      cy.getByTestID('Create Bucket').click()
      cy.getByTestID('overlay--container').within(() => {
        cy.getByInputName('name').type(newBucket)
        cy.get('.cf-button').contains('Create').click()
      })

      cy.getByTestID(`bucket--card--name ${newBucket}`).should('exist')

      // Add a label
      cy.getByTestID('inline-labels--add').first().click()

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
        cy.getByTestID('duration-selector--12h').click()
        cy.getByTestID('bucket-form-submit').click()
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

      cy.getByTestID(`bucket-retention`).should('contain', '7 days')
    })

    it('can delete a bucket', () => {
      const bucket1 = 'newbucket1'
      cy.get<Organization>('@org').then(({id, name}: Organization) => {
        cy.createBucket(id, name, bucket1)
      })
      cy.reload()
      cy.getByTestID(`bucket-card ${bucket1}`).trigger('mouseover')
      cy.getByTestID(`context-delete-menu ${bucket1}--button`).click()
      cy.intercept('DELETE', '/api/v2/buckets/*').as('deleteBucket')
      cy.getByTestID(`context-delete-menu ${bucket1}--confirm-button`).click({
        force: true,
      })
      cy.wait('@deleteBucket')
      cy.getByTestID(`bucket--card--name ${bucket1}`).should('not.exist')
    })

    it('can sort by name and retention', () => {
      const buckets = ['defbuck', '_tasks', '_monitoring']
      const retentionDesc = ['defbuck', '_monitoring', '_tasks']
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

  describe('explore a newly created bucket', () => {
    beforeEach(() => {
      cy.setFeatureFlags({
        exploreWithFlows: true,
      })
    })
    it('with redirect to notebooks', () => {
      const newBucket = 'Bucket for templating'
      cy.getByTestID(`bucket--card--name ${newBucket}`).should('not.exist')

      cy.getByTestID('Create Bucket').click()
      cy.getByTestID('overlay--container').within(() => {
        cy.getByInputName('name').type(newBucket)
        cy.get('.cf-button').contains('Create').click()
      })

      cy.getByTestID(`bucket--card--name ${newBucket}`).should('exist').click()

      cy.getByTestID('page-title').contains(newBucket)
    })
    it('with notebooks using the bucket crud object', () => {
      const newBucket = 'Bucket for templating 1'
      cy.getByTestID(`bucket--card--name ${newBucket}`).should('not.exist')

      cy.getByTestID('Create Bucket').click()
      cy.getByTestID('overlay--container').within(() => {
        cy.getByInputName('name').type(newBucket)
        cy.get('.cf-button').contains('Create').click()
      })

      cy.getByTestID(`bucket--card--name ${newBucket}`).should('exist')
      cy.log('Bucket created')

      cy.intercept('PATCH', '/api/v2private/notebooks/*').as('updateNotebook')

      cy.getByTestID(`bucket--card--name ${newBucket}`)
        .parent()
        .parent()
        .within(() => {
          cy.get('.copy-bucket-id')
            .invoke('text')
            .then(text => {
              const bucketId = text.split('ID:')[0].trim()
              cy.getByTestID(`bucket--card--name ${newBucket}`)
                .should('exist')
                .click()

              cy.wait('@updateNotebook').then(interception => {
                expect(JSON.stringify(interception.response?.body)).to.include(
                  newBucket
                )
                expect(JSON.stringify(interception.response?.body)).to.include(
                  bucketId
                )
              })
            })
        })
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
            cy.getByTestID('tree-nav')
          })
          cy.getByTestID(`overlay`).should('exist')
        })
      })
    })
  })

  describe('adding data', () => {
    const TELEGRAF_SYSTEMS_PLUGINS_ORIGINAL_COUNT = 5

    it('configures a telegraf agent', () => {
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

      // many plugins with "sys" in their names have been added
      cy.getByTestID('input-field').type('sys')
      cy.getByTestID('square-grid--card').should('have.length.greaterThan', 1)
      cy.getByTestID('input-field').clear()

      // total plugins should be greater than just the original Systems plugins
      cy.getByTestID('square-grid--card').should(
        'have.length.greaterThan',
        TELEGRAF_SYSTEMS_PLUGINS_ORIGINAL_COUNT
      )
      cy.getByTestID('telegraf-plugins--System').click()
      cy.getByTestID('plugin-create-configuration-continue-configuring').click()

      // cancel mid-flow and redo steps, ensuring user is still at Load Data > Buckets
      cy.get('button.cf-overlay--dismiss').click()
      cy.getByTestID('add-data--button').click()
      cy.get('.bucket-add-data--option')
        .contains('Configure Telegraf Agent')
        .click()
      cy.get<string>('@defaultBucket').then((defaultBucket: string) => {
        cy.getByTestID('bucket-dropdown--button').should(
          'contain',
          defaultBucket
        )
      })
      cy.getByTestID('telegraf-plugins--System').click()
      cy.getByTestID('plugin-create-configuration-continue-configuring').click()

      // add telegraf name and description
      cy.getByTestID('plugin-create-configuration-customize-input--name')
        .clear()
        .type('Telegraf from bucket')
      cy.getByTestID('plugin-create-configuration-customize-input--description')
        .clear()
        .type('This is a telegraf description')
      cy.getByTestID('plugin-create-configuration-save-and-test').click()

      cy.getByTestID('notification-success').should('be.visible')

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
    })
  })

  describe('uploading a csv', function () {
    it('writes a properly annotated csv', () => {
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

    it('fails to write an improperly formatted csv', () => {
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
