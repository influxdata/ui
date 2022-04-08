import {Organization} from '../../../src/types'

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
            })
          })
        })
      })
    )
  )

  it('should navigate to empty subscriptions page via sources tab', () => {
    cy.getByTestID('tree-nav-toggle').should('be.visible')
    cy.getByTestID('tree-nav-toggle').click()
    cy.getByTestID('nav-item-load-data').should('be.visible')
    cy.getByTestID('nav-item-load-data').click()
    cy.getByTestID('subscriptions--tab').should('be.visible')
    cy.getByTestID('load-data-item mqtt')
      .scrollIntoView()
      .should('be.visible')
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
    cy.getByTestID('subscriptions--tab').click()
    cy.getByTestID('create-subscription-button--empty').should('be.visible')
    cy.getByTestID('create-subscription-button--empty')
      .first()
      .click()
    // broker form
    cy.getByTestID('create-broker-form-overlay').should('be.visible')
    // back to create landing
    cy.getByTestID('create-broker-form--cancel').should('be.visible')
    cy.getByTestID('create-broker-form--cancel').click()
    // return to broker form
    cy.getByTestID('create-subscription-button--control-bar').should(
      'be.visible'
    )
    cy.getByTestID('create-subscription-button--control-bar')
      .first()
      .click()
    cy.getByTestID('create-broker-form-overlay').should('be.visible')
    // fill in broker form
    cy.getByTestID('create-broker-form--name').type('My Subscription')
    cy.getByTestID('create-broker-form--description').type('My Description')
    cy.getByTestID('dropdown')
      .contains('MQTT')
      .click()
    cy.getByTestID('create-broker-form--host').type('localhost')
    cy.getByTestID('create-broker-form--port').type('1883')
    cy.getByTestID('create-broker-form--submit').click()
    // subscription form
    cy.getByTestID('create-subscription-form--overlay-form').should(
      'be.visible'
    )
    // back to broker form
    cy.getByTestID('create-subscription-form--back').should('be.visible')
    cy.getByTestID('create-subscription-form--back').click()
    cy.getByTestID('create-broker-form-overlay').should('be.visible')
    // return to subscription
    cy.getByTestID('create-broker-form--submit').should('be.visible')
    cy.getByTestID('create-broker-form--submit').click()
    cy.getByTestID('create-subscription-form--overlay-form').should(
      'be.visible'
    )
    // fill in subscription form
    cy.getByTestID('create-subscription-form--topic').type('topic')
    cy.getByTestID('list-item')
      .contains('defbuck')
      .click()
    cy.getByTestID('create-subscription-form--submit').click()
    // parsing form
    cy.getByTestID('create-parsing-form-overlay').should('be.visible')
    // back to subscription
    cy.getByTestID('create-parsing-form--back').should('be.visible')
    cy.getByTestID('create-parsing-form--back').click()
    cy.getByTestID('create-subscription-form--overlay-form').should(
      'be.visible'
    )
    // return to parsing
    cy.getByTestID('create-subscription-form--submit').click()
    // line protocol
    cy.getByTestID('create-parsing-form-line-protocol--button').click()
    cy.getByTestID('create-parsing-form--submit').click()
    // wait for intercepts
    cy.wait('@CreateSubscription')
    cy.wait('@GetSubscriptions')
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
    cy.getByTestID('update-broker-form--edit')
      .should('be.visible')
      .click()
    cy.getByTestID('update-broker-form--name').should('be.visible')
    cy.getByTestID('update-broker-form--name')
      .clear()
      .type('My Edited Subscription')
    cy.getByTestID('update-broker-form--description')
      .clear()
      .type('Edited Description')
    cy.getByTestID('update-broker-form--host')
      .clear()
      .type('local.host')
    cy.getByTestID('update-broker-form--port')
      .clear()
      .type('1884')
    cy.getByTestID('update-broker-form--user--button').click()
    cy.getByTestID('update-broker-form--username')
      .clear()
      .type('username')
    cy.getByTestID('update-broker-form--password')
      .clear()
      .type('password')
    cy.getByTestID('update-broker-form--submit')
      .should('be.visible')
      .click()
    cy.getByTestID('update-subscription-form--topic').should('be.visible')
    cy.getByTestID('update-subscription-form--topic')
      .clear()
      .type('edit/topic')
    cy.getByTestID('Create Bucket').click()
    cy.getByTestID('form--validation-element').should('be.visible')
    cy.getByTestID('bucket-form-name').type('nifid')
    cy.getByTestID('bucket-form-submit').click()
    cy.getByTestID('update-subscription-form--submit')
      .should('be.visible')
      .click()
    cy.getByTestID('heading')
      .should('be.visible')
      .contains('Data Format')
    cy.getByTestID('update-parsing-form--submit')
      .should('be.visible')
      .click()
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
    cy.getByTestID('update-broker-form--cancel')
      .should('be.visible')
      .click()
    // delete
    cy.getByTestID('context-delete-menu--button').should('be.visible')
    cy.getByTestID('context-delete-menu--button').click()
    cy.getByTestID('context-delete-menu--confirm-button').should('be.visible')
    cy.getByTestID('context-delete-menu--confirm-button').click()
    // empty list
    cy.wait('@DeleteSubscription')
    cy.wait('@GetSubscriptions')
    cy.getByTestID('subscriptions-empty-state').should('be.visible')
  })
  it('should create, update, stop, start and delete a JSON subscription', () => {
    cy.getByTestID('subscriptions--tab').click()
    cy.getByTestID('create-subscription-button--control-bar').should(
      'be.visible'
    )
    cy.getByTestID('create-subscription-button--control-bar')
      .first()
      .click()
    // broker form
    cy.getByTestID('create-broker-form-overlay').should('be.visible')
    cy.getByTestID('create-broker-form--name').type('My Subscription 2')
    cy.getByTestID('create-broker-form--description').type('My Description')
    cy.getByTestID('dropdown')
      .contains('MQTT')
      .click()
    cy.getByTestID('create-broker-form--host').type('localhost')
    cy.getByTestID('create-broker-form--port').type('1883')
    cy.getByTestID('create-broker-form--submit').click()
    // subscription form
    cy.getByTestID('create-subscription-form--overlay-form').should(
      'be.visible'
    )
    cy.getByTestID('create-subscription-form--topic').type('topic')
    cy.getByTestID('list-item')
      .contains('defbuck')
      .click()
    cy.getByTestID('create-subscription-form--submit').click()
    // parsing form
    cy.getByTestID('create-parsing-form-overlay').should('be.visible')
    // json
    cy.getByTestID('create-parsing-form-json--button').click()
    cy.getByTestID('timestamp-json-parsing').type('$.t')
    cy.getByTestID('measurement-json-parsing-name').type('m')
    cy.getByTestID('measurement-json-parsing-type')
      .contains('String')
      .click()
    cy.getByTestID('measurement-json-parsing-path').type('$.m')
    cy.getByTestID('true-json-parsing-name').type('t')
    cy.getByTestID('true-json-parsing-type')
      .contains('String')
      .click()
    cy.getByTestID('true-json-parsing-path').type('$.t')
    // add field
    cy.getByTestID('json-parsing-add-rule').click()
    cy.getByTestID('json-parsing-add-rule-0')
      .first()
      .click()
    // delete field
    cy.getByTestID('false-json-delete-label--button').should('be.visible')
    cy.getByTestID('false-json-delete-label--button')
      .first()
      .click()
    cy.getByTestID('false-json-delete-label--confirm-button').should(
      'be.visible'
    )
    cy.getByTestID('false-json-delete-label--confirm-button').click()
    // add field
    cy.getByTestID('false-json-parsing-name').type('f')
    cy.getByTestID('false-json-parsing-type')
      .first()
      .contains('String')
      .click()
    cy.getByTestID('false-json-parsing-path').type('$.f')
    // submit
    cy.getByTestID('create-parsing-form--submit').click()
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
    cy.getByTestID('update-broker-form--name').should('be.visible')
    cy.getByTestID('update-broker-form--name')
      .clear()
      .type('My Edited Subscription')
    cy.getByTestID('update-broker-form--edit')
      .should('be.visible')
      .click()
    cy.getByTestID('update-broker-form--submit')
      .should('be.visible')
      .click()
    cy.getByTestID('update-subscription-form--topic').should('be.visible')
    cy.getByTestID('update-subscription-form--topic')
      .clear()
      .type('edit/topic')
    cy.getByTestID('update-subscription-form--submit')
      .should('be.visible')
      .click()
    cy.getByTestID('heading')
      .should('be.visible')
      .contains('Data Format')
    cy.getByTestID('measurement-json-parsing-path')
      .should('be.visible')
      .clear()
      .type('$.m1')
    cy.getByTestID('true-json-parsing-name')
      .clear()
      .type('t2')
    cy.getByTestID('true-json-parsing-type')
      .contains('String')
      .click()
    cy.getByTestID('true-json-parsing-path')
      .clear()
      .type('$.t2')
    // add field
    cy.getByTestID('json-parsing-add-rule').click()
    cy.getByTestID('json-parsing-add-rule-0')
      .first()
      .click()
    // delete field
    cy.getByTestID('false-json-delete-label--button').should('be.visible')
    cy.getByTestID('false-json-delete-label--button')
      .first()
      .click()
    cy.getByTestID('false-json-delete-label--confirm-button').should(
      'be.visible'
    )
    cy.getByTestID('false-json-delete-label--confirm-button').click()
    // add field
    cy.getByTestID('false-json-parsing-name')
      .clear()
      .type('f2')
    cy.getByTestID('false-json-parsing-type')
      .first()
      .contains('String')
      .click()
    cy.getByTestID('false-json-parsing-path')
      .clear()
      .type('$.f2')
    cy.getByTestID('update-parsing-form--submit')
      .should('be.visible')
      .click()
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
    cy.getByTestID('update-broker-form--cancel')
      .should('be.visible')
      .click()
    // delete
    cy.getByTestID('context-delete-menu--button').should('be.visible')
    cy.getByTestID('context-delete-menu--button').click()
    cy.getByTestID('context-delete-menu--confirm-button').should('be.visible')
    cy.getByTestID('context-delete-menu--confirm-button').click()
    // empty list
    cy.wait('@DeleteSubscription')
    cy.wait('@GetSubscriptions')
    cy.getByTestID('subscriptions-empty-state').should('be.visible')
  })

  it('should create, update, stop, start and delete a String subscription', () => {
    cy.getByTestID('subscriptions--tab').click()
    cy.getByTestID('create-subscription-button--control-bar').should(
      'be.visible'
    )
    cy.getByTestID('create-subscription-button--control-bar')
      .first()
      .click()
    // broker form
    cy.getByTestID('create-broker-form-overlay').should('be.visible')
    cy.getByTestID('create-broker-form--name').type('My Subscription 3')
    cy.getByTestID('create-broker-form--description').type('My Description')
    cy.getByTestID('dropdown')
      .contains('MQTT')
      .click()
    cy.getByTestID('create-broker-form--host').type('localhost')
    cy.getByTestID('create-broker-form--port').type('1883')
    cy.getByTestID('create-broker-form--submit').click()
    // subscription form
    cy.getByTestID('create-subscription-form--overlay-form').should(
      'be.visible'
    )
    cy.getByTestID('create-subscription-form--topic').type('topic')
    cy.getByTestID('list-item')
      .contains('defbuck')
      .click()
    cy.getByTestID('create-subscription-form--submit').click()
    // parsing form
    cy.getByTestID('create-parsing-form-overlay').should('be.visible')
    // string
    cy.getByTestID('create-parsing-form-string--button').click()
    cy.getByTestID('timestamp-string-parsing').type('0123456789')
    cy.getByTestID('measurment-string-parsing-pattern').type('m=//m')
    cy.getByTestID('Tag-string-parsing-name').type('tag')
    cy.getByTestID('Tag-string-parsing-pattern').type('t=//t')
    // add field
    cy.getByTestID('string-parsing-add-rule').click()
    cy.getByTestID('string-parsing-add-rule-0')
      .first()
      .click()
    // delete field
    cy.getByTestID('Field-string-delete-label--button').should('be.visible')
    cy.getByTestID('Field-string-delete-label--button')
      .first()
      .click()
    cy.getByTestID('Field-string-delete-label--confirm-button').should(
      'be.visible'
    )
    cy.getByTestID('Field-string-delete-label--confirm-button').click()
    // add field
    cy.getByTestID('Field-string-parsing-name').type('field')
    cy.getByTestID('Field-string-parsing-pattern').type('f=//f')
    // submit
    cy.getByTestID('create-parsing-form--submit').click()
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
    cy.getByTestID('update-broker-form--name').should('be.visible')
    cy.getByTestID('update-broker-form--name')
      .clear()
      .type('My Edited Subscription')
    cy.getByTestID('update-broker-form--edit')
      .should('be.visible')
      .click()
    cy.getByTestID('update-broker-form--submit')
      .should('be.visible')
      .click()
    cy.getByTestID('update-subscription-form--topic').should('be.visible')
    cy.getByTestID('update-subscription-form--topic')
      .clear()
      .type('edit/topic')
    cy.getByTestID('update-subscription-form--submit')
      .should('be.visible')
      .click()
    cy.getByTestID('heading')
      .should('be.visible')
      .contains('Data Format')
    cy.getByTestID('measurment-string-parsing-pattern')
      .should('be.visible')
      .clear()
      .type('m1=//m1')
    cy.getByTestID('timestamp-string-parsing')
      .clear()
      .type('987654321')
    cy.getByTestID('Tag-string-parsing-name')
      .clear()
      .type('tag2')
    cy.getByTestID('Tag-string-parsing-pattern')
      .clear()
      .type('t2=//t')
    // add field
    cy.getByTestID('string-parsing-add-rule').click()
    cy.getByTestID('string-parsing-add-rule-0')
      .first()
      .click()
    // delete field
    cy.getByTestID('Field-string-delete-label--button').should('be.visible')
    cy.getByTestID('Field-string-delete-label--button')
      .first()
      .click()
    cy.getByTestID('Field-string-delete-label--confirm-button').should(
      'be.visible'
    )
    cy.getByTestID('Field-string-delete-label--confirm-button').click()
    // add field
    cy.getByTestID('Field-string-parsing-name')
      .clear()
      .type('field2')
    cy.getByTestID('Field-string-parsing-pattern')
      .clear()
      .type('f2=//f')
    cy.getByTestID('update-parsing-form--submit')
      .should('be.visible')
      .click()
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
    cy.getByTestID('update-broker-form--cancel')
      .should('be.visible')
      .click()
    // delete
    cy.getByTestID('context-delete-menu--button').should('be.visible')
    cy.getByTestID('context-delete-menu--button').click()
    cy.getByTestID('context-delete-menu--confirm-button').should('be.visible')
    cy.getByTestID('context-delete-menu--confirm-button').click()
    // empty list
    cy.wait('@DeleteSubscription')
    cy.wait('@GetSubscriptions')
    cy.getByTestID('subscriptions-empty-state').should('be.visible')
  })
})
