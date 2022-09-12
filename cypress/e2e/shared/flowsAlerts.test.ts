import {Organization} from '../../src/types'

describe('flows alert panel', () => {
  const selectAlertMeasurementAndField = () => {
    cy.log('Select alert measurement')
    cy.getByTestID('dropdown--measurements').click()
    cy.getByTestID('dropdown-item--measurement').first().click()

    cy.log('Select alert threshold field')
    cy.getByTestID('dropdown--threshold-fields').click()
    cy.getByTestID('dropdown-item--threshold-field').first().click()
  }

  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() =>
        cy.get('@org').then(({id}: Organization) =>
          cy.fixture('routes').then(({orgs}) => {
            cy.visit(`${orgs}/${id}`)
            cy.getByTestID('version-info')
            return cy
              .setFeatureFlags({
                notebooksExp: true,
                notebooksNewEndpoints: true,
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

    cy.getByTestID('preset-new').first().click()
    cy.getByTestID('time-machine-submit-button').should('be.visible')

    cy.getByTestID('page-title').first().click()
    cy.getByTestID('renamable-page-title--input').type(`${flowName}`)

    cy.getByTestID('sidebar-button').first().click()
    cy.getByTestID('Delete--list-item').click()

    cy.get('.flow-divider--button').first().click()

    // opening the menu adds another Query Builder button
    cy.getByTestID('add-flow-btn--queryBuilder').should('have.length', 2)

    // click the newest Query Builder button
    cy.getByTestID('add-flow-btn--queryBuilder').last().click()

    // select our bucket, measurement, field and tag
    cy.getByTestID('bucket-selector').within(() => {
      cy.getByTestID(`selector-list ${newBucketName}`).click()
    })

    // select measurement and field
    cy.getByTestID('builder-card')
      .eq(0)
      .within(() => {
        cy.getByTestID(`selector-list test`).click()
      })
    cy.getByTestID('builder-card')
      .eq(1)
      .within(() => {
        cy.getByTestID(`selector-list dopeness`).click()
      })
    // select beans tag and click preview
    cy.getByTestID('builder-card')
      .eq(2)
      .within(() => {
        cy.getByTestID(`selector-list beans`).click()
      })

    // add an alert cell using the last flow panel
    cy.get('.flow-divider--button').last().click()

    // there are 2 Alert buttons, click the newest from menu that opened
    cy.getByTestID('add-flow-btn--notification').should('have.length', 2)
    cy.getByTestID('add-flow-btn--notification').last().click()
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

    // NOTE: we need to verify that the generated task flux contains
    //    `|> set(key: "_notebook_link", value: "${url}")`
    // but we dont currently redirect to the task editor anymore
  })

  it('should build alert for each endpoint', () => {
    const newBucketName = 'shmucket'
    const now = Date.now()
    cy.get<Organization>('@org').then(({id, name}: Organization) => {
      cy.createBucket(id, name, newBucketName)
      cy.upsertSecret(id, {mySecret: 'shhh'})
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

    cy.getByTestID('preset-new').first().click()
    cy.getByTestID('time-machine-submit-button').should('be.visible')

    cy.getByTestID('page-title').first().click()
    cy.getByTestID('renamable-page-title--input').type(`${flowName}`)

    // select our bucket, measurement, field and tag
    cy.getByTestID('sidebar-button').first().click()
    cy.getByTestID('Delete--list-item').click()

    cy.get('.flow-divider--button').first().click()

    // opening the menu adds another Query Builder button
    cy.getByTestID('add-flow-btn--queryBuilder').should('have.length', 2)

    // click the newest Query Builder button
    cy.getByTestID('add-flow-btn--queryBuilder').last().click()

    cy.getByTestID('bucket-selector').within(() => {
      cy.getByTestID(`selector-list ${newBucketName}`).click()
    })

    // select measurement and field
    cy.getByTestID('builder-card')
      .eq(0)
      .within(() => {
        cy.getByTestID(`selector-list test`).click()
      })
    cy.getByTestID('builder-card')
      .eq(1)
      .within(() => {
        cy.getByTestID(`selector-list dopeness`).click()
      })
    // select beans tag and click preview
    cy.getByTestID('builder-card')
      .eq(2)
      .within(() => {
        cy.getByTestID(`selector-list beans`).click()
      })

    // add an alert cell using the last flow panel
    cy.get('.flow-divider--button').last().click()

    // there are 2 Alert buttons, click the newest from menu that opened
    cy.getByTestID('add-flow-btn--notification').should('have.length', 2)
    cy.getByTestID('add-flow-btn--notification').last().click()
    cy.getByTestID('time-machine-submit-button').click()
    cy.getByTestID('notification-exp-button').scrollIntoView()
    cy.getByTestID('text-editor').should('be.visible')

    const fakeEmail = 'super@fake.com'
    const fakeUrl = 'super-fake.com'
    const fakeChannel = 'fake-channel'

    // === AWS SES ===

    // complete fields
    cy.getByTestID('dropdown-item--aws').click()
    cy.getByTestID('input--url').clear()
    cy.getByTestID('input--url').type(fakeUrl)
    cy.getByTestID('dropdown--accessKey').click()
    cy.getByTestID('dropdown-item--mySecret').click()
    cy.getByTestID('dropdown--authAlgo').click()
    cy.getByTestID('dropdown-item--mySecret').click()
    cy.getByTestID('dropdown--credScope').click()
    cy.getByTestID('dropdown-item--mySecret').click()
    cy.getByTestID('dropdown--signedHeaders').click()
    cy.getByTestID('dropdown-item--mySecret').click()
    cy.getByTestID('dropdown--calcSignature').click()
    cy.getByTestID('dropdown-item--mySecret').click()
    cy.getByTestID('input--email').type(fakeEmail)

    cy.log('Export attempt without selecting a measurement, will error')
    cy.getByTestID('task-form-save').click()
    cy.getByTestID('notification-error').should('be.visible')
    cy.getByTestID('notification-error--dismiss').click()
    selectAlertMeasurementAndField()

    cy.getByTestID('task-form-save').click()
    /* NOTE: we used to be able to test that the generated flux contained the the
     * selected values, but that mechanism has been removed from the product
     * we should add back that ability here
     */

    // === HTTP ===

    // complete fields
    cy.getByTestID('dropdown-item--http').click()
    cy.getByTestID('option--bearer').click()
    cy.getByTestID('input--url').clear()
    cy.getByTestID('input--url').click()
    cy.getByTestID('dropdown--token').click()
    cy.getByTestID('dropdown-item--mySecret').click()

    cy.getByTestID('task-form-save').click()
    /* NOTE: we used to be able to test that the generated flux contained the the
     * selected values, but that mechanism has been removed from the product
     * we should add back that ability here
     */

    // === MAILGUN ===
    const mailgunDomain = 'fake.com'

    // complete fields
    cy.getByTestID('dropdown-item--mailgun').click()
    cy.getByTestID('input--domain').type(mailgunDomain)
    cy.getByTestID('dropdown--apiKey').click()
    cy.getByTestID('dropdown-item--mySecret').click()
    cy.getByTestID('input--email').type(fakeEmail)

    cy.getByTestID('task-form-save').click()
    /* NOTE: we used to be able to test that the generated flux contained the the
     * selected values, but that mechanism has been removed from the product
     * we should add back that ability here
     */

    // === MAILJET ===

    // complete fields
    cy.getByTestID('dropdown-item--mailjet').click()
    cy.getByTestID('dropdown--apiKey').click()
    cy.getByTestID('dropdown-item--mySecret').click()
    cy.getByTestID('dropdown--apiSecret').click()
    cy.getByTestID('dropdown-item--mySecret').click()
    cy.getByTestID('input--email').type(fakeEmail)

    cy.getByTestID('task-form-save').click()
    /* NOTE: we used to be able to test that the generated flux contained the the
     * selected values, but that mechanism has been removed from the product
     * we should add back that ability here
     */

    // === PAGERDUTY ===
    const pagerDutyRoutingKey = 'fake-key'

    // complete fields
    cy.getByTestID('dropdown-item--pagerduty').click()
    cy.getByTestID('input--url').type(fakeUrl)
    cy.getByTestID('input--key').type(pagerDutyRoutingKey)

    cy.getByTestID('task-form-save').click()
    /* NOTE: we used to be able to test that the generated flux contained the the
     * selected values, but that mechanism has been removed from the product
     * we should add back that ability here
     */

    // === SENDGRID ===

    // complete fields
    cy.getByTestID('dropdown-item--sendgrid').click()
    cy.getByTestID('input--email').type(fakeEmail)
    cy.getByTestID('dropdown--apiKey').click()
    cy.getByTestID('dropdown-item--mySecret').click()

    cy.getByTestID('task-form-save').click()
    /* NOTE: we used to be able to test that the generated flux contained the the
     * selected values, but that mechanism has been removed from the product
     * we should add back that ability here
     */

    // === SLACK ===

    // complete fields
    cy.getByTestID('dropdown-item--slack').click()
    cy.getByTestID('input--url').type(fakeUrl)
    cy.getByTestID('input--channel').type(fakeChannel)

    cy.getByTestID('task-form-save').click()
    /* NOTE: we used to be able to test that the generated flux contained the the
     * selected values, but that mechanism has been removed from the product
     * we should add back that ability here
     */

    // === TELEGRAM ===

    // complete fields
    cy.getByTestID('dropdown-item--telegram').click()
    cy.getByTestID('input--channel').type(fakeChannel)

    // test create secret sidebar
    cy.getByTestID('dropdown--token').click()
    cy.getByTestID('dropdown-item--create-secret').click()
    cy.getByTestID('input--secret-name').type('an apple a day')
    cy.getByTestID('input--secret-value').type('keeps the doctor away')
    cy.getByTestID('variable-form-save').click()
    cy.getByTestID('dropdown-button--token').contains('an apple a day')

    cy.getByTestID('task-form-save').click()
    /* NOTE: we used to be able to test that the generated flux contained the the
     * selected values, but that mechanism has been removed from the product
     * we should add back that ability here
     */

    // === ZENOSS ===
    const zenossAction = 'my-action'
    const zenossMethod = 'my-method'

    // complete fields
    cy.getByTestID('dropdown-item--zenoss').click()
    cy.getByTestID('input--url').type(fakeUrl)
    cy.getByTestID('dropdown--username').click()
    cy.getByTestID('dropdown-item--mySecret').click()
    cy.getByTestID('dropdown--password').click()
    cy.getByTestID('dropdown-item--mySecret').click()
    cy.getByTestID('dropdown--severity').click()
    cy.getByTestID('dropdown-item--Critical').click()
    cy.getByTestID('input--action').type(zenossAction)
    cy.getByTestID('input--method').type(zenossMethod)

    cy.getByTestID('task-form-save').click()
    /* NOTE: we used to be able to test that the generated flux contained the the
     * selected values, but that mechanism has been removed from the product
     * we should add back that ability here
     */
  })
})
