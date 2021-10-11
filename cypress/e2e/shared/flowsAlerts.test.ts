import {Organization} from '../../src/types'

describe('flows alert panel', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() =>
        cy.get('@org').then(({id}: Organization) =>
          cy.fixture('routes').then(({orgs}) => {
            cy.visit(`${orgs}/${id}`)
            cy.getByTestID('version-info')
            return cy
              .setFeatureFlags({
                simpleTable: true,
                notebooksExp: true,
                notebooksEmail: true,
              })
              .then(() => {
                cy.getByTestID('nav-item-flows').should('be.visible')
                return cy.getByTestID('nav-item-flows').click()
              })
          })
        )
      )
    )
  )
  it('should build expressions list and allow for injection', () => {
    const newBucketName = 'shmucket'
    const now = Date.now()
    cy.get<Organization>('@org').then(({id, name}: Organization) => {
      cy.createBucket(id, name, newBucketName)
    })
    cy.writeData(
      [
        `test,container_name=cool dopeness=12 ${now - 1000}000000`,
        `test,container_name=beans dopeness=18 ${now - 1200}000000`,
        `test,container_name=cool dopeness=14 ${now - 1400}000000`,
        `test,container_name=beans dopeness=10 ${now - 1600}000000`,
      ],
      newBucketName
    )

    const flowName = 'Flowbooks'

    cy.getByTestID('create-flow--button')
      .first()
      .click()
    cy.getByTestID('time-machine-submit-button').should('be.visible')

    cy.getByTestID('page-title').click()
    cy.getByTestID('renamable-page-title--input').type(`${flowName}`)

    // select our bucket, measurement, field and tag
    cy.getByTestID('sidebar-button')
      .first()
      .click()
    cy.getByTestID('Delete--list-item').click()

    cy.getByTestID('panel-add-btn--1').click()
    cy.getByTestID('add-flow-btn--metricSelector').click()
    cy.getByTestID('flow-bucket-selector').click()
    cy.getByTestID(`flow-bucket-selector--${newBucketName}`).click()
    cy.getByTestID('measurement-selector test').click()
    cy.getByTestID('field-selector dopeness').click()
    cy.getByTestID('tag-selector beans').click()

    // add an alert cell
    cy.getByTestID('panel-add-btn-2').click()
    cy.getByTestID('add-flow-btn--notification').click()
    cy.getByTestID('time-machine-submit-button').click()
    cy.getByTestID('notification-exp-button').scrollIntoView()
    cy.getByTestID('text-editor').should('be.visible')

    // open exp sidebar panel
    cy.getByTestID('notification-exp-button').should('be.visible')
    cy.getByTestID('notification-exp-button').click()
    cy.getByTestID('flux-toolbar--list').should('be.visible')

    // check that all expressions are listed
    cy.getByTestID('fields-dopeness').should('be.visible')
    cy.getByTestID('tags-container_name').should('be.visible')
    cy.getByTestID('columns-_start').should('be.visible')
    cy.getByTestID('system-_source_measurement')
      .scrollIntoView()
      .should('be.visible')

    // filter for dopeness
    cy.getByTestID('flux-toolbar-search--input').type('dopeness')
    cy.getByTestID('flux--fields-dopeness--inject').click({force: true})
    cy.getByTestID('flux-toolbar-search--input').clear()
    // filter for notebook
    cy.getByTestID('flux-toolbar-search--input').type('notebook')
    cy.getByTestID('flux--system-_notebook_link--inject').click({force: true})

    // make sure message contains injected expressions
    cy.getByTestID('notification-message--monaco-editor').contains('r.dopeness')
    cy.getByTestID('notification-message--monaco-editor').contains(
      'r._notebook_link'
    )

    // make sure task export contains notebook link
    cy.getByTestID('task-form-save').click()
    cy.getByTestID('export-as-overlay--header').should('be.visible')
    cy.getByTestID('flux-editor').should('exist')
    cy.getByTestID('form--footer').scrollIntoView()
    cy.getByTestID('overlay--body').within(() => {
      cy.url().then(url => {
        cy.getByTestID('flux-editor').contains(
          `|> set(key: "_notebook_link", value: "${url}")`
        )
      })
    })
  })

  it('should build alert for each endpoint', () => {
    const newBucketName = 'shmucket'
    const now = Date.now()
    cy.get<Organization>('@org').then(({id, name}: Organization) => {
      cy.createBucket(id, name, newBucketName)
    })
    cy.writeData(
      [
        `test,container_name=cool dopeness=12 ${now - 1000}000000`,
        `test,container_name=beans dopeness=18 ${now - 1200}000000`,
        `test,container_name=cool dopeness=14 ${now - 1400}000000`,
        `test,container_name=beans dopeness=10 ${now - 1600}000000`,
      ],
      newBucketName
    )

    const flowName = 'Flowbooks'

    cy.getByTestID('create-flow--button')
      .first()
      .click()
    cy.getByTestID('time-machine-submit-button').should('be.visible')

    cy.getByTestID('page-title').click()
    cy.getByTestID('renamable-page-title--input').type(`${flowName}`)

    // select our bucket, measurement, field and tag
    cy.getByTestID('sidebar-button')
      .first()
      .click()
    cy.getByTestID('Delete--list-item').click()

    cy.getByTestID('panel-add-btn--1').click()
    cy.getByTestID('add-flow-btn--metricSelector').click()
    cy.getByTestID('flow-bucket-selector').click()
    cy.getByTestID(`flow-bucket-selector--${newBucketName}`).click()
    cy.getByTestID('measurement-selector test').click()
    cy.getByTestID('field-selector dopeness').click()
    cy.getByTestID('tag-selector beans').click()

    // add an alert cell
    cy.getByTestID('panel-add-btn-2').click()
    cy.getByTestID('add-flow-btn--notification').click()
    cy.getByTestID('time-machine-submit-button').click()
    cy.getByTestID('notification-exp-button').scrollIntoView()
    cy.getByTestID('text-editor').should('be.visible')

    const fakeEmail = 'super@fake.com'
    const fakeUrl = 'super-fake.com'

    // === AWS SES ===
    const awsAccessKey = 'fake-key'
    const awsAuthAlgo = 'fake-algo'
    const awsCredScoe = 'fake-cred-scope'
    const awsSignedHeaders = 'fake-headers'
    const awsCalcSig = 'fake-signature'

    // complete fields
    cy.getByTestID('dropdown-item--aws').click()
    cy.getByTestID('input--url').clear()
    cy.getByTestID('input--url').type(fakeUrl)
    cy.getByTestID('input--accessKey').type(awsAccessKey)
    cy.getByTestID('input--authAlgo').type(awsAuthAlgo)
    cy.getByTestID('input--credScope').type(awsCredScoe)
    cy.getByTestID('input--signedHeaders').type(awsSignedHeaders)
    cy.getByTestID('input--calcSignature').type(awsCalcSig)
    cy.getByTestID('input--email').type(fakeEmail)

    // make sure task export contains the fields
    cy.getByTestID('task-form-save').click()
    cy.getByTestID('export-as-overlay--header').should('be.visible')
    cy.getByTestID('flux-editor').should('exist')
    cy.getByTestID('form--footer').scrollIntoView()
    cy.getByTestID('overlay--body').within(() => {
      cy.getByTestID('flux-editor').contains(fakeUrl)
      cy.getByTestID('flux-editor').contains(awsAccessKey)
      cy.getByTestID('flux-editor').contains(awsAuthAlgo)
      cy.getByTestID('flux-editor').contains(awsCredScoe)
      cy.getByTestID('flux-editor').contains(awsSignedHeaders)
      cy.getByTestID('flux-editor').contains(awsCalcSig)
      cy.getByTestID('flux-editor').contains(fakeEmail)
    })

    // close popup
    cy.get('.cf-overlay--dismiss').click()

    // === HTTP ===
    const token = 'fake-token'

    // complete fields
    cy.getByTestID('dropdown-item--http').click()
    cy.getByTestID('option--bearer').click()
    cy.getByTestID('input--url').clear()
    cy.getByTestID('input--url').type(fakeUrl)
    cy.getByTestID('input--token').type(token)

    // make sure task export contains the fields
    cy.getByTestID('task-form-save').click()
    cy.getByTestID('export-as-overlay--header').should('be.visible')
    cy.getByTestID('flux-editor').should('exist')
    cy.getByTestID('form--footer').scrollIntoView()
    cy.getByTestID('overlay--body').within(() => {
      cy.getByTestID('flux-editor').contains(fakeUrl)
      cy.getByTestID('flux-editor').contains(token)
    })

    // close popup
    cy.get('.cf-overlay--dismiss').click()

    // === MAILGUN ===
    const mailgunDomain = 'fake.com'
    const mailgunApiKey = 'fake-key'

    // complete fields
    cy.getByTestID('dropdown-item--mailgun').click()
    cy.getByTestID('input--domain').type(mailgunDomain)
    cy.getByTestID('input--apiKey').type(mailgunApiKey)
    cy.getByTestID('input--email').type(fakeEmail)

    // make sure task export contains the fields
    cy.getByTestID('task-form-save').click()
    cy.getByTestID('export-as-overlay--header').should('be.visible')
    cy.getByTestID('flux-editor').should('exist')
    cy.getByTestID('form--footer').scrollIntoView()
    cy.getByTestID('overlay--body').within(() => {
      cy.getByTestID('flux-editor').contains(mailgunDomain)
      cy.getByTestID('flux-editor').contains(mailgunApiKey)
      cy.getByTestID('flux-editor').contains(fakeEmail)
    })

    // close popup
    cy.get('.cf-overlay--dismiss').click()

    // === MAILJET ===
    const mailjetApiKey = 'fake-key'
    const mailjetApiSecret = 'fake-secret'

    // complete fields
    cy.getByTestID('dropdown-item--mailjet').click()
    cy.getByTestID('input--apiKey').type(mailjetApiKey)
    cy.getByTestID('input--apiSecret').type(mailjetApiSecret)
    cy.getByTestID('input--email').type(fakeEmail)

    // make sure task export contains the fields
    cy.getByTestID('task-form-save').click()
    cy.getByTestID('export-as-overlay--header').should('be.visible')
    cy.getByTestID('flux-editor').should('exist')
    cy.getByTestID('form--footer').scrollIntoView()
    cy.getByTestID('overlay--body').within(() => {
      cy.getByTestID('flux-editor').contains(mailjetApiKey)
      cy.getByTestID('flux-editor').contains(mailjetApiSecret)
      cy.getByTestID('flux-editor').contains(fakeEmail)
    })

    // close popup
    cy.get('.cf-overlay--dismiss').click()

    // === PAGERDUTY ===
    const pagerDutyRoutingKey = 'fake-key'

    // complete fields
    cy.getByTestID('dropdown-item--pagerduty').click()
    cy.getByTestID('input--url').type(fakeUrl)
    cy.getByTestID('input--key').type(pagerDutyRoutingKey)

    // make sure task export contains the fields
    cy.getByTestID('task-form-save').click()
    cy.getByTestID('export-as-overlay--header').should('be.visible')
    cy.getByTestID('flux-editor').should('exist')
    cy.getByTestID('form--footer').scrollIntoView()
    cy.getByTestID('overlay--body').within(() => {
      cy.getByTestID('flux-editor').contains(fakeUrl)
      cy.getByTestID('flux-editor').contains(pagerDutyRoutingKey)
    })

    // close popup
    cy.get('.cf-overlay--dismiss').click()

    // === SENDGRID ===
    const sendgridApiKey = 'fake-key'

    // complete fields
    cy.getByTestID('dropdown-item--sendgrid').click()
    cy.getByTestID('input--email').type(fakeEmail)
    cy.getByTestID('input--apiKey').type(sendgridApiKey)

    // make sure task export contains the fields
    cy.getByTestID('task-form-save').click()
    cy.getByTestID('export-as-overlay--header').should('be.visible')
    cy.getByTestID('flux-editor').should('exist')
    cy.getByTestID('form--footer').scrollIntoView()
    cy.getByTestID('overlay--body').within(() => {
      cy.getByTestID('flux-editor').contains(fakeEmail)
      cy.getByTestID('flux-editor').contains(sendgridApiKey)
    })

    // close popup
    cy.get('.cf-overlay--dismiss').click()

    // === SLACK ===
    const fakeChannel = 'fake-channel'
    const slackColor = '#34BB55'

    // complete fields
    cy.getByTestID('dropdown-item--slack').click()
    cy.getByTestID('input--url').type(fakeUrl)
    cy.getByTestID('input--channel').type(fakeChannel)

    // make sure task export contains the fields
    cy.getByTestID('task-form-save').click()
    cy.getByTestID('export-as-overlay--header').should('be.visible')
    cy.getByTestID('flux-editor').should('exist')
    cy.getByTestID('form--footer').scrollIntoView()
    cy.getByTestID('overlay--body').within(() => {
      cy.getByTestID('flux-editor').contains(fakeUrl)
      cy.getByTestID('flux-editor').contains(fakeChannel)
      cy.getByTestID('flux-editor').contains(slackColor)
    })

    // close popup
    cy.get('.cf-overlay--dismiss').click()

    // === TELEGRAM ===
    const parseMode = 'MarkdownV2'
    const telegramURL = 'https://api.telegram.org/bot'

    // complete fields
    cy.getByTestID('dropdown-item--telegram').click()
    cy.getByTestID('input--channel').type(fakeChannel)
    cy.getByTestID('input--token').type(token)

    // make sure task export contains the fields
    cy.getByTestID('task-form-save').click()
    cy.getByTestID('export-as-overlay--header').should('be.visible')
    cy.getByTestID('flux-editor').should('exist')
    cy.getByTestID('form--footer').scrollIntoView()
    cy.getByTestID('overlay--body').within(() => {
      cy.getByTestID('flux-editor').contains(telegramURL)
      cy.getByTestID('flux-editor').contains(fakeChannel)
      cy.getByTestID('flux-editor').contains(token)
      cy.getByTestID('flux-editor').contains(parseMode)
    })
  })
})
