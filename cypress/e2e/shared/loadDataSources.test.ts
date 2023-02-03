import {Organization} from '../../src/types'

const isIOxOrg = Boolean(Cypress.env('useIox'))
const isTSMOrg = !isIOxOrg

// Library to use when testing client library details view.
// As of 2/2023, IOx only has one client library - python, which has a wizard.
// In TSM, there are more libraries, and it's desirable to test a page both with and without a wizard.
const libraryWithWizard = isIOxOrg ? 'python' : 'arduino'
const libraryWithoutWizard = 'csharp'

describe('Load Data Sources', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.setFeatureFlags({
      newDataExplorer: true,
      showOldDataExplorerInNewIOx: true,
    })
    cy.get('@org').then(({id}: Organization) =>
      cy.fixture('routes').then(({orgs}) => {
        cy.visit(`${orgs}/${id}/load-data/sources`)
        cy.getByTestID('tree-nav')
      })
    )
  })

  it('navigates to Client Library details view and renders details without a wizard', () => {
    // Skip this test in IOx because as of 2/2023, there is only one library (python), which has a wizard.
    cy.skipOn(isIOxOrg)

    cy.getByTestID('write-data--section client-libraries').within(() => {
      cy.getByTestID('square-grid').within(() => {
        cy.getByTestIDSubStr(`load-data-item ${libraryWithoutWizard}`)
          .first()
          .click()
      })
    })

    const contentContainer = cy.getByTestID('load-data-details-content')
    contentContainer.should('exist')
    contentContainer.children().should('exist')

    const logoElement = cy.getByTestID('load-data-details-thumb')
    logoElement.should('exist')
  })

  it('navigates to Client Library details view and renders a wizard', () => {
    cy.getByTestID('write-data--section client-libraries').within(() => {
      cy.getByTestID('square-grid').within(() => {
        cy.getByTestIDSubStr(`load-data-item ${libraryWithWizard}`)
          .first()
          .click()
      })
    })

    const contentNav = cy.getByTestID('subway-nav')
    contentNav.should('exist')
    contentNav.children().should('exist')

    const titleElement = cy.get('.subway-navigation-title-text')

    const capitalizedLibraryWithWizard =
      libraryWithWizard[0].toUpperCase() + libraryWithWizard.slice(1)

    titleElement.contains(capitalizedLibraryWithWizard)
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
  it('can write data to buckets', () => {
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

  it('upload a file and write data', () => {
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
    // use new data explorer, since old data explorer is being deprecated
    cy.getByTestID('nav-item-data-explorer').click({force: true})

    cy.getByTestID('script-query-builder-toggle').click()

    cy.getByTestID('timerange-dropdown').click()

    // time range start
    cy.get('.date-picker__input')
      .first()
      .clear()
      .type('2020-08-06 00:00:00.000')

    // time range stop
    cy.get('.date-picker__input').last().clear().type('2020-08-08 00:00:00.000')

    cy.getByTestID('daterange--apply-btn').click()

    cy.wait(1000)
    cy.getByTestID('bucket-selector--dropdown-button').click()
    cy.getByTestID('bucket-selector--dropdown--defbuck').click()

    // mymeasurement comes from fixtures/data.txt
    cy.getByTestID('measurement-selector--dropdown-button').click()
    cy.getByTestID('searchable-dropdown--item mymeasurement')
      .contains('mymeasurement')
      .click()
  })
})

describe('Load Data Sources - New IOx', () => {
  it('there is no old data explorer for new iox orgs', () => {
    cy.skipOn(isTSMOrg)
    cy.flush()
    cy.signin()
    cy.setFeatureFlags({
      newDataExplorer: true,
    })
    cy.get('@org').then(({id}: Organization) =>
      cy.fixture('routes').then(({orgs}) => {
        cy.visit(`${orgs}/${id}/load-data/sources`)
        cy.getByTestID('tree-nav')
      })
    )
  })
})
