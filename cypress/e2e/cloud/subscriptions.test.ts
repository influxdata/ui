import {Organization} from '../../../src/types'

const BROKER_PORT = 1883

describe('Subscriptions', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(({id}: Organization) => {
          cy.fixture('routes').then(({orgs}) => {
            cy.quartzProvision({
              accountType: 'pay_as_you_go',
            }).then(() => {
              cy.visit(`${orgs}/${id}/load-data/sources`)

              cy.setFeatureFlags({
                subscriptionsUI: true,
                multiOrg: true,
                quartzIdentity: true,
              })

              cy.getByTestID('subscriptions--tab').should('be.visible')
              cy.intercept('POST', `/api/v2private/broker/subs*`).as(
                'CreateSubscription'
              )
              cy.intercept('DELETE', `/api/v2private/broker/subs/*`).as(
                'DeleteSubscription'
              )
              cy.intercept('GET', `/api/v2private/broker/subs*`).as(
                'GetSubscriptions'
              )
              cy.intercept('GET', '/api/v2private/broker/subs/statuses', []).as(
                'GetStatuses'
              )
            })
          })
        })
      })
    )
  )

  const deleteSubscription = (subscription: string) => {
    cy.getByTestID('subscription-card')
      .contains(subscription)
      // delete
      .parents('[data-testid="subscription-card"]')
      .find('[data-testid="context-delete-menu--button"]')
      .first()
      .click()
    cy.getByTestID('context-delete-menu--confirm-button').should('be.visible')
    cy.getByTestID('context-delete-menu--confirm-button').click()
    cy.wait('@DeleteSubscription')
    cy.wait('@GetSubscriptions')
  }

  const createBasicLPSubscription = (name: string) => {
    cy.getByTestID('subscriptions--tab').click()
    cy.getByTestID('create-subscription-button--control-bar')
      .should('be.visible')
      .first()
      .click()

    // broker form
    cy.getByTestID('create-broker-form-overlay').should('be.visible')
    // back to create landing
    cy.getByTestID('create-sub-form--cancel').should('be.visible')
    cy.getByTestID('create-sub-form--cancel').click()
    // return to broker form
    cy.getByTestID('create-subscription-button--control-bar').should(
      'be.visible'
    )
    cy.getByTestID('create-subscription-button--control-bar').first().click()
    cy.getByTestID('create-broker-form-overlay').should('be.visible')
    // fill in broker form
    cy.getByTestID('create-broker-form--name').type(name)
    cy.getByTestID('create-broker-form--description').type('My Description')
    cy.getByTestID('dropdown').contains('MQTT').click()
    cy.getByTestID('create-broker-form--host').type('broker.hivemq.com')
    cy.getByTestID('create-broker-form--port').type(`${BROKER_PORT}`)
    // subscription form
    cy.getByTestID('create-subscription-form--overlay-form').should(
      'be.visible'
    )
    // fill in subscription form
    cy.getByTestID('create-subscription-form--topic').type('topic')
    cy.getByTestID('list-item').contains('defbuck').click()
    // parsing form
    cy.getByTestID('create-parsing-form-overlay').should('be.visible')

    // line protocol
    cy.getByTestID('create-parsing-form-line-protocol--button').click()
    cy.getByTestID('create-sub-form--submit').should('be.visible').click()

    // wait for intercepts
    cy.wait('@CreateSubscription')
    cy.wait('@GetSubscriptions')
  }

  it('should filter listing', () => {
    const subscription1 = 'My Subscription'
    const subscription2 = 'Your Subscription'
    createBasicLPSubscription(subscription1)
    createBasicLPSubscription(subscription2)

    // subscriptions list view
    cy.get('.subscriptions-list').should('be.visible')
    cy.wait('@GetStatuses')
    cy.getByTestID('subscription-card')
      .should('be.visible')
      .should('have.length', 2)
    cy.getByTestID('subscription-card')
      .children()
      .getByTestID('copy-subscription--component')
      .should('be.visible')
    cy.getByTestID('subscription-card')
      .children()
      .getByTestID(`subscription-notifications--label No Notifications`)
      .should('be.visible')
    cy.getByTestID('search-widget').clear().type('my ')
    cy.getByTestID('subscription-card')
      .should('be.visible')
      .should('have.length', 1)
    cy.getByTestID('dismiss-button').click()
    cy.getByTestID('subscription-card')
      .should('be.visible')
      .should('have.length', 2)

    // Search for subscription2 name(partial match)
    cy.getByTestID('search-widget').clear().type('your ')
    cy.getByTestID('subscription-card')
      .should('be.visible')
      .should('have.length', 1)
    cy.getByTestID('dismiss-button').click()
    cy.getByTestID('subscription-card')
      .should('be.visible')
      .should('have.length', 2)

    deleteSubscription(subscription1)
    deleteSubscription(subscription2)
  })

  it('should navigate to empty subscriptions page via sources tab', () => {
    cy.getByTestID('tree-nav-toggle').should('be.visible')
    cy.getByTestID('tree-nav-toggle').click()
    cy.getByTestID('nav-item-load-data').should('be.visible')
    cy.getByTestID('nav-item-load-data').click()
    cy.getByTestID('subscriptions--tab').should('be.visible')
    cy.getByTestID('load-data-item mqtt').scrollIntoView().should('be.visible')
    cy.getByTestID('load-data-item mqtt').click()
    cy.getByTestID('subscriptions-empty-state').should('exist')
  })

  it('should navigate to empty subscriptions page via load data dropdown', () => {
    cy.getByTestID('tree-nav-toggle').should('be.visible')
    cy.getByTestID('tree-nav-toggle').click()
    cy.getByTestID('nav-item-load-data').should('be.visible')
    cy.getByTestID('nav-item-load-data').click()
    cy.getByTestID('nav-subitem-subscriptions').should('be.visible')
    cy.getByTestID('nav-subitem-subscriptions').click()
    cy.getByTestID('subscriptions-empty-state').should('exist')
  })

  it('should create, update, stop, start and delete LP subscription', () => {
    let subscription = 'My Subscription'
    // subscriptions list view
    createBasicLPSubscription(subscription)
    cy.wait('@GetStatuses')

    cy.get('.subscriptions-list').should('be.visible')
    cy.get('.cf-resource-card').should('be.visible')
    cy.get('.cf-resource-card').should('have.length', 1)
    cy.get('.cf-resource-card').contains('My Subscription')

    // bucket review
    cy.getByTestID('subscription-card').should('be.visible')
    cy.getByTestID('subscription-name').should('be.visible')
    cy.getByTestID('subscription-name').click()
    cy.get('.subscription-details-page').should('be.visible')
    cy.getByTestID('update-subscription-form--bucket')
      .scrollIntoView()
      .should('be.visible')
      .contains('defbuck')
    cy.getByTestID('update-sub-form--edit').click()
    cy.getByTestID('buckets--list').scrollIntoView().should('be.visible')
    cy.getByTestID('list-item')
      .should('have.length', 1)
      .should('have.attr', 'style')
    cy.getByTestID('update-sub-form--cancel').click()

    // update
    cy.getByTestID('subscription-card').should('be.visible')
    cy.getByTestID('subscription-name').should('be.visible')
    cy.getByTestID('subscription-name').click()
    cy.get('.subscription-details-page').should('be.visible')
    cy.getByTestID('update-sub-form--edit').should('be.visible').click()

    cy.getByTestID(`subscription-notifications--label No Notification`).should(
      'not.exist'
    )
    subscription = 'My Edited Subscription'
    cy.getByTestID('update-broker-form--name').should('be.visible')
    cy.getByTestID('update-broker-form--name').clear().type(subscription)
    cy.getByTestID('update-broker-form--description')
      .clear()
      .type('Edited Description')
    cy.getByTestID('update-broker-form--host').clear().type('broker.hivemq.com')
    cy.getByTestID('update-broker-form--user--button').click()
    cy.getByTestID('update-broker-form--username').clear().type('username')
    cy.getByTestID('update-broker-form--password').clear().type('password')
    cy.getByTestID('update-subscription-form--topic').should('be.visible')
    cy.getByTestID('update-subscription-form--topic').clear().type('edit/topic')
    cy.getByTestID('Create Bucket').click()
    cy.getByTestID('form--validation-element').should('be.visible')
    cy.getByTestID('bucket-form-name').type('nifid')
    cy.getByTestID('bucket-form-submit').click()
    cy.getByTestID('heading').should('be.visible').contains('Data Format')
    cy.getByTestID('lp-timestamp-precision')
      .scrollIntoView()
      .should('be.visible')
      .contains('Nanoseconds')
    cy.getByTestID('update-sub-form--submit').should('be.visible').click()
    cy.get('.cf-resource-card').should('have.length', 1)
    cy.get('.cf-resource-card').contains('My Edited Subscription')

    // stop subscription
    cy.getByTestID('subscription-name').should('be.visible')
    cy.getByTestID('subscription-name').click()
    cy.get('.subscription-details-page').should('be.visible')
    cy.getByTestID('subscription-details-page--status-button')
      .should('be.visible')
      .click()
    cy.get('.cf-spinner-container').should('be.visible')
    cy.get('.subscription-details-page__status--STOPPED')
      .should('be.visible')
      .contains('STOPPED')
    // start subscription
    cy.getByTestID('subscription-details-page--status-button')
      .should('be.visible')
      .click()
    cy.get('.cf-spinner-container').should('be.visible')
    cy.get('.subscription-details-page__status--RUNNING')
      .should('be.visible')
      .contains('RUNNING')
    cy.getByTestID('update-sub-form--cancel').should('be.visible').click()

    // delete
    deleteSubscription(subscription)

    cy.getByTestID('subscriptions-empty-state').should('be.visible')
  })

  it('should create, update, stop, start and delete a JSON subscription', () => {
    let subscription = 'My Subscription 2'
    cy.getByTestID('subscriptions--tab').click()
    cy.getByTestID('create-subscription-button--control-bar').should(
      'be.visible'
    )
    cy.getByTestID('create-subscription-button--control-bar').first().click()
    // broker form
    cy.getByTestID('create-broker-form-overlay').should('be.visible')
    cy.getByTestID('create-broker-form--name').type(subscription)
    cy.getByTestID('create-broker-form--description').type('My Description')
    cy.getByTestID('dropdown').contains('MQTT').click()
    cy.getByTestID('create-broker-form--host').type('broker.hivemq.com')
    cy.getByTestID('create-broker-form--port').type(`${BROKER_PORT}`)
    // subscription form
    cy.getByTestID('create-subscription-form--overlay-form').should(
      'be.visible'
    )
    cy.getByTestID('create-subscription-form--topic').type('topic')
    cy.getByTestID('list-item').contains('defbuck').click()
    // parsing form
    cy.getByTestID('create-parsing-form-overlay').should('be.visible')
    // json
    cy.getByTestID('create-parsing-form-json--button').click()
    cy.getByTestID('timestamp-json-parsing').type('$.t')
    cy.getByTestID('json-timestamp-precision')
      .scrollIntoView()
      .should('be.visible')
      .click()
    cy.getByTestID('json-timestamp-precision-Nanoseconds').first().click()
    cy.getByTestID('measurement-json-parsing-type').contains('String').click()
    cy.getByTestID('measurement-json-parsing-path').type('$.m')
    // add tag
    cy.getByTestID('json-parsing-add-rule').click()
    cy.getByTestID('json-parsing-add-rule-1').first().click()
    cy.getByTestID('true-json-parsing-name').type('t')
    cy.getByTestID('true-json-parsing-type').contains('String').click()
    cy.getByTestID('true-json-parsing-path').type('$.t')
    // delete tag
    cy.getByTestID('true-json-delete-label--button').should('be.visible')
    cy.getByTestID('true-json-delete-label--button').first().click()
    cy.getByTestID('true-json-delete-label--confirm-button').should(
      'be.visible'
    )
    cy.getByTestID('true-json-delete-label--confirm-button').click()
    // add tag
    cy.getByTestID('json-parsing-add-rule').click()
    cy.getByTestID('json-parsing-add-rule-1').first().click()
    cy.getByTestID('true-json-parsing-name').type('t')
    cy.getByTestID('true-json-parsing-type').contains('String').click()
    cy.getByTestID('true-json-parsing-path').type('$.t')
    // add field
    cy.getByTestID('false-json-parsing-name').type('f')
    cy.getByTestID('false-json-parsing-type').first().contains('String').click()
    cy.getByTestID('false-json-parsing-path').type('$.f')
    // submit
    cy.getByTestID('create-sub-form--submit').should('be.visible').click()
    // wait for intercepts
    cy.wait('@CreateSubscription')
    cy.wait('@GetSubscriptions')
    // subscriptions list
    cy.get('.subscriptions-list').should('be.visible')
    cy.get('.cf-resource-card').should('be.visible')
    cy.get('.cf-resource-card').should('have.length', 1)
    cy.get('.cf-resource-card').contains('My Subscription 2')
    // update
    cy.getByTestID('subscription-name').click()
    cy.get('.subscription-details-page').should('be.visible')
    cy.getByTestID('update-sub-form--edit').should('be.visible').click()
    subscription = 'My Edited Subscription'
    cy.getByTestID('update-broker-form--name').should('be.visible')
    cy.getByTestID('update-broker-form--name').clear().type(subscription)
    cy.get('.subway-navigation-step-flex-wrapper')
      .eq(1)
      .should('be.visible')
      .click()
    cy.getByTestID('update-subscription-form--topic')
      .scrollIntoView()
      .should('be.visible')
    cy.getByTestID('update-subscription-form--topic').clear().type('edit/topic')
    cy.get('.subway-navigation-step-flex-wrapper')
      .eq(2)
      .should('be.visible')
      .click()
    cy.getByTestID('heading').should('be.visible').contains('Data Format')
    cy.getByTestID('json-timestamp-precision')
      .scrollIntoView()
      .should('be.visible')
      .contains('Nanoseconds')
    cy.getByTestID('measurement-json-parsing-path')
      .scrollIntoView()
      .should('be.visible')
      .clear()
      .type('$.m1')
    cy.getByTestID('true-json-parsing-name').clear().type('t2')
    cy.getByTestID('true-json-parsing-type').contains('String').click()
    cy.getByTestID('true-json-parsing-path').clear().type('$.t2')
    // add field
    cy.getByTestID('json-parsing-add-rule').click()
    cy.getByTestID('json-parsing-add-rule-0').first().click()
    // delete field
    cy.getByTestID('false-json-delete-label--button').should('be.visible')
    cy.getByTestID('false-json-delete-label--button').first().click()
    cy.getByTestID('false-json-delete-label--confirm-button').should(
      'be.visible'
    )
    cy.getByTestID('false-json-delete-label--confirm-button').click()
    // add field
    cy.getByTestID('false-json-parsing-name').clear().type('f2')
    cy.getByTestID('false-json-parsing-type').first().contains('String').click()
    cy.getByTestID('false-json-parsing-path').clear().type('$.f2')
    cy.getByTestID('update-sub-form--submit').should('be.visible').click()
    cy.get('.cf-resource-card').should('have.length', 1)
    cy.get('.cf-resource-card').contains('My Edited Subscription')
    // stop subscription
    cy.getByTestID('subscription-name').should('be.visible')
    cy.getByTestID('subscription-name').click()
    cy.get('.subscription-details-page').should('be.visible')
    cy.getByTestID('subscription-details-page--status-button')
      .should('be.visible')
      .click()
    cy.get('.cf-spinner-container').should('be.visible')
    cy.get('.subscription-details-page__status--STOPPED')
      .should('be.visible')
      .contains('STOPPED')
    // start subscription
    cy.getByTestID('subscription-details-page--status-button')
      .should('be.visible')
      .click()
    cy.get('.cf-spinner-container').should('be.visible')
    cy.get('.subscription-details-page__status--RUNNING')
      .should('be.visible')
      .contains('RUNNING')
    cy.getByTestID('update-sub-form--cancel').should('be.visible').click()
    // delete
    deleteSubscription(subscription)
    cy.getByTestID('subscriptions-empty-state').should('be.visible')
  })

  it('should create, update, stop, start and delete a String subscription', () => {
    let subscription = 'My Subscription 3'
    cy.getByTestID('subscriptions--tab').click()
    cy.getByTestID('create-subscription-button--control-bar').should(
      'be.visible'
    )
    cy.getByTestID('create-subscription-button--control-bar').first().click()
    // broker form
    cy.getByTestID('create-broker-form-overlay').should('be.visible')
    cy.getByTestID('create-broker-form--name').type(subscription)
    cy.getByTestID('create-broker-form--description').type('My Description')
    cy.getByTestID('dropdown').contains('MQTT').click()
    cy.getByTestID('create-broker-form--host').type('broker.hivemq.com')
    cy.getByTestID('create-broker-form--port').type(`${BROKER_PORT}`)
    // subscription form
    cy.getByTestID('create-subscription-form--overlay-form').should(
      'be.visible'
    )
    cy.getByTestID('create-subscription-form--topic').type('topic')
    cy.getByTestID('list-item').contains('defbuck').click()
    // parsing form
    cy.getByTestID('create-parsing-form-overlay').should('be.visible')
    // string
    cy.getByTestID('create-parsing-form-string--button').click()
    cy.getByTestID('timestamp-string-parsing').type('0123456789')
    cy.getByTestID('string-timestamp-precision')
      .scrollIntoView()
      .should('be.visible')
      .click()
    cy.getByTestID('string-timestamp-precision-Nanoseconds').first().click()
    cy.getByTestID('measurment-string-parsing-pattern').type('m=//m')
    // add tag
    cy.getByTestID('string-parsing-add-rule').click()
    cy.getByTestID('string-parsing-add-rule-1').first().click()
    cy.getByTestID('Tag-string-parsing-name').type('tag')
    cy.getByTestID('Tag-string-parsing-pattern').type('t=//t')
    // delete tag
    cy.getByTestID('Tag-string-delete-label--button').should('be.visible')
    cy.getByTestID('Tag-string-delete-label--button').first().click()
    cy.getByTestID('Tag-string-delete-label--confirm-button').should(
      'be.visible'
    )
    cy.getByTestID('Tag-string-delete-label--confirm-button').click()
    // add tag
    cy.getByTestID('string-parsing-add-rule').click()
    cy.getByTestID('string-parsing-add-rule-1').first().click()
    cy.getByTestID('Tag-string-parsing-name').type('tag')
    cy.getByTestID('Tag-string-parsing-pattern').type('t=//t')
    // add field
    cy.getByTestID('Field-string-parsing-name').type('field')
    cy.getByTestID('Field-string-parsing-pattern').type('f=//f')
    // submit
    cy.getByTestID('create-sub-form--submit').should('be.visible').click()
    // wait for intercepts
    cy.wait('@CreateSubscription')
    cy.wait('@GetSubscriptions')
    // list page
    cy.get('.subscriptions-list').should('be.visible')
    cy.get('.cf-resource-card').should('be.visible')
    cy.get('.cf-resource-card').should('have.length', 1)
    cy.get('.cf-resource-card').contains('My Subscription 3')
    // update
    cy.getByTestID('subscription-name').click()
    cy.get('.subscription-details-page').should('be.visible')
    cy.getByTestID('update-sub-form--edit').should('be.visible').click()
    subscription = 'My Edited Subscription'
    cy.getByTestID('update-broker-form--name').should('be.visible')
    cy.getByTestID('update-broker-form--name').clear().type(subscription)
    cy.get('.subway-navigation-step-flex-wrapper')
      .eq(0)
      .should('be.visible')
      .click()
    cy.getByTestID('update-subscription-form--topic')
      .scrollIntoView()
      .should('be.visible')
    cy.getByTestID('update-subscription-form--topic').clear().type('edit/topic')
    cy.getByTestID('heading').should('be.visible').contains('Data Format')
    cy.getByTestID('measurment-string-parsing-pattern')
      .scrollIntoView()
      .should('be.visible')
      .clear()
      .type('m1=//m1')
    cy.getByTestID('string-timestamp-precision')
      .scrollIntoView()
      .should('be.visible')
      .contains('Nanoseconds')
    cy.getByTestID('timestamp-string-parsing').clear().type('987654321')
    cy.getByTestID('Tag-string-parsing-name').clear().type('tag2')
    cy.getByTestID('Tag-string-parsing-pattern').clear().type('t2=//t')
    // add field
    cy.getByTestID('string-parsing-add-rule').click()
    cy.getByTestID('string-parsing-add-rule-0').first().click()
    // delete field
    cy.getByTestID('Field-string-delete-label--button').should('be.visible')
    cy.getByTestID('Field-string-delete-label--button').first().click()
    cy.getByTestID('Field-string-delete-label--confirm-button').should(
      'be.visible'
    )
    cy.getByTestID('Field-string-delete-label--confirm-button').click()
    // add field
    cy.getByTestID('Field-string-parsing-name').clear().type('field2')
    cy.getByTestID('Field-string-parsing-pattern').clear().type('f2=//f')
    cy.getByTestID('update-sub-form--submit').should('be.visible').click()
    cy.get('.cf-resource-card').should('have.length', 1)
    cy.get('.cf-resource-card').contains('My Edited Subscription')
    // stop subscription
    cy.getByTestID('subscription-name').should('be.visible')
    cy.getByTestID('subscription-name').click()
    cy.get('.subscription-details-page').should('be.visible')
    cy.getByTestID('subscription-details-page--status-button')
      .should('be.visible')
      .click()
    cy.get('.cf-spinner-container').should('be.visible')
    cy.get('.subscription-details-page__status--STOPPED')
      .should('be.visible')
      .contains('STOPPED')
    // start subscription
    cy.getByTestID('subscription-details-page--status-button')
      .should('be.visible')
      .click()
    cy.get('.cf-spinner-container').should('be.visible')
    cy.get('.subscription-details-page__status--RUNNING')
      .should('be.visible')
      .contains('RUNNING')
    cy.getByTestID('update-sub-form--cancel').should('be.visible').click()

    // delete
    deleteSubscription(subscription)

    cy.getByTestID('subscriptions-empty-state').should('be.visible')
  })

  it('should create, update, stop, then disable start button on error', () => {
    const mockErroredSubscription = {
      id: '603dd8ae88aee000',
      orgID: '9c9c9c9c9c9c9c9c',
      processGroupID: 'f762b298-0180-1000-0000-000067f29ae1',
      brokerHost: 'broker.hivemq.com',
      brokerPort: BROKER_PORT,
      topic: 'datopic',
      dataFormat: 'lineprotocol',
      jsonMeasurementKey: {name: 'measurement', path: '$.', type: 'string'},
      jsonFieldKeys: [{name: '', path: '$.', type: 'string'}],
      jsonTagKeys: [{name: '', path: '$.', type: 'string'}],
      jsonTimestamp: {name: 'timestamp', path: '', type: 'string'},
      createdAt: '2022-05-24T18:44:44.196Z',
      updatedAt: '2022-05-24T19:20:48.371Z',
      protocol: 'mqtt',
      bucket: 'devbucket',
      name: 'aaaa',
      stringMeasurement: {name: 'measurement', pattern: ''},
      stringFields: [{name: '', pattern: ''}],
      stringTags: [{name: '', pattern: ''}],
      stringTimestamp: {name: '', pattern: ''},
      tokenID: '0969d8059c6c9000',
      description: 'aaaa',
      isActive: true,
      flowVersion: 5,
      status: 'ERRORED',
      timestampPrecision: 'NS',
    }
    const subscription = 'My Subscription'
    createBasicLPSubscription(subscription)

    // subscriptions list view
    cy.get('.subscriptions-list').should('be.visible')
    cy.get('.cf-resource-card').should('be.visible')
    cy.get('.cf-resource-card').should('have.length', 1)
    cy.get('.cf-resource-card').contains('My Subscription')
    // update
    cy.getByTestID('subscription-card').should('be.visible')
    cy.getByTestID('subscription-name').should('be.visible')
    cy.getByTestID('subscription-name').click()
    cy.get('.subscription-details-page').should('be.visible')
    cy.getByTestID('update-sub-form--edit').should('be.visible').click()
    cy.getByTestID('update-broker-form--name').should('be.visible')
    cy.getByTestID('update-broker-form--name')
      .clear()
      .type('My Edited Subscription')
    cy.getByTestID('update-broker-form--description')
      .clear()
      .type('Edited Description')
    cy.getByTestID('update-broker-form--host').clear().type('broker.hivemq.com')
    cy.getByTestID('update-broker-form--user--button').click()
    cy.getByTestID('update-broker-form--username').clear().type('username')
    cy.getByTestID('update-broker-form--password').clear().type('password')
    cy.getByTestID('update-subscription-form--topic').should('be.visible')
    cy.getByTestID('update-subscription-form--topic').clear().type('edit/topic')
    cy.getByTestID('Create Bucket').click()
    cy.getByTestID('form--validation-element').should('be.visible')
    cy.getByTestID('bucket-form-name').type('nifid')
    cy.getByTestID('bucket-form-submit').click()
    cy.getByTestID('heading').should('be.visible').contains('Data Format')
    cy.getByTestID('update-sub-form--submit').should('be.visible').click()
    cy.get('.cf-resource-card').should('have.length', 1)
    cy.get('.cf-resource-card').contains('My Edited Subscription')
    // stop subscription
    cy.getByTestID('subscription-name').should('be.visible')
    cy.getByTestID('subscription-name').click()
    cy.get('.subscription-details-page').should('be.visible')
    cy.getByTestID('subscription-details-page--status-button')
      .should('be.visible')
      .click()
    cy.get('.cf-spinner-container').should('be.visible')
    cy.get('.subscription-details-page__status--STOPPED')
      .should('be.visible')
      .contains('STOPPED')
    cy.intercept(
      'GET',
      '/api/v2private/broker/subs/*',
      mockErroredSubscription
    ).as('GetMockedErroredSubscription')
    // start subscription
    cy.getByTestID('subscription-details-page--status-button')
      .should('be.visible')
      .click()
    cy.wait('@GetMockedErroredSubscription')
    cy.getByTestID('subscription-details-page--status-button').should(
      'be.disabled'
    )
  })
})
