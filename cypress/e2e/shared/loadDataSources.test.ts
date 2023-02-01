import {Organization} from '../../src/types'

describe.skip('Load Data Sources', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.get('@org').then(({id}: Organization) =>
      cy.fixture('routes').then(({orgs}) => {
        cy.visit(`${orgs}/${id}/load-data/sources`)
        cy.getByTestID('tree-nav')
      })
    )
  })

  it('navigates to Client Library details view and renders details without a wizard', () => {
    cy.getByTestID('write-data--section client-libraries').within(() => {
      cy.getByTestID('square-grid').within(() => {
        cy.getByTestIDSubStr('load-data-item csharp').first().click()
      })
    })

    const contentContainer = cy.getByTestID('load-data-details-content')
    contentContainer.should('exist')
    contentContainer.children().should('exist')

    const logoElement = cy.getByTestID('load-data-details-thumb')
    logoElement.should('exist')
  })

  it('navigates to Client Library details view and renders a wizard', () => {
    const libaryWithWizard = 'Arduino'
    cy.getByTestID('write-data--section client-libraries').within(() => {
      cy.getByTestID('square-grid').within(() => {
        cy.getByTestIDSubStr(`load-data-item ${libaryWithWizard.toLowerCase()}`)
          .first()
          .click()
      })
    })

    const contentNav = cy.getByTestID('subway-nav')
    contentNav.should('exist')
    contentNav.children().should('exist')

    const titleElement = cy.get('.subway-navigation-title-text')
    titleElement.contains(libaryWithWizard)
  })

  it('navigates to Telegraf Plugin details view and render it with essentials', () => {
    cy.getByTestID('write-data--section telegraf-plugins').within(() => {
      cy.getByTestID('square-grid').within(() => {
        cy.getByTestIDSubStr('load-data-item').first().click()
      })
    })

    const contentContainer = cy.getByTestID('load-data-details-content')
    contentContainer.should('exist')
    contentContainer.children().should('exist')

    const logoElement = cy.getByTestID('load-data-details-thumb')
    logoElement.should('exist')
  })

  it('lets you search things', () => {
    cy.getByTestID('write-data--search').type('diskio')

    cy.getByTestID('write-data--section telegraf-plugins').should('exist')

    cy.getByTestID('write-data--section file-upload').should('not.exist')

    cy.getByTestID('write-data--section client-libraries').should('not.exist')

    cy.getByTestID('load-data-item diskio').should('exist')
  })

  // TODO(ariel): address these skipped tests later https://github.com/influxdata/ui/issues/3394
  it.skip('can write data to buckets', () => {
    // writing a well-formed line is accepted
    cy.getByTestID('load-data-item lp').click()
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

    // Using the Edit button should show the same invalid text
    cy.getByTestID('lp-edit--button').click()
    cy.getByTestID('line-protocol--text-area').contains('invalid invalid')

    // Using the Clear button should clear text
    cy.getByTestID('lp-write-data--button').click()
    cy.getByTestID('lp-cancel--button').click()
    cy.getByTestID('line-protocol--text-area').should('have.value', '')

    // writing a well-formed line with millisecond precision is accepted
    cy.getByTestID('wizard-step--lp-precision--dropdown').click()
    cy.getByTestID('wizard-step--lp-precision-ms').click()
    const now = Date.now()
    cy.getByTestID('line-protocol--text-area').type(`m2,t2=v2 v=2.0 ${now}`)
    cy.getByTestID('lp-write-data--button').click()
    cy.getByTestID('line-protocol--status').contains('Success')
  })

  it.skip('upload a file and write data', () => {
    cy.getByTestID('load-data-item lp').click()
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
})
