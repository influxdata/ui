import {Organization} from '../../../src/types'

describe('Subscriptions', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(({id}: Organization) => {
          cy.fixture('routes').then(({orgs}) => {
            cy.setFeatureFlags({
              subscriptionsResourceType: true,
            }).then(() => {
              cy.quartzProvision({
                accountType: 'pay_as_you_go',
              }).then(() => {
                cy.visit(`${orgs}/${id}`)
              })
            })
          })
        })
      })
    )
  )

  //  it('Navigate to empty subscriptions page via sources tab', () => {
    // cy.getByTestID('tree-nav-toggle').should('be.visible')
    // cy.getByTestID('tree-nav-toggle').click()
  //   cy.getByTestID('nav-item-load-data').should('be.visible')
  //   cy.getByTestID('nav-item-load-data').click()
  //   cy.getByTestID('subscriptions--tab').should('be.visible')

  //   cy.getByTestID('load-data-item mqtt')
  //     .scrollIntoView()
  //     .should('be.visible')
  //   cy.getByTestID('load-data-item mqtt').click()

  //   cy.getByTestID('subscriptions-empty-state').should('exist')
  // })
  // it('Navigate to empty subscriptions page via load data dropdown', () => {
  //   cy.getByTestID('tree-nav-toggle').should('be.visible')
  //   cy.getByTestID('tree-nav-toggle').click()
  //   cy.getByTestID('nav-item-load-data').should('be.visible')
  //   cy.getByTestID('nav-item-load-data').click()
  //   cy.getByTestID('nav-subitem-subscriptions').should('be.visible')
  //   cy.getByTestID('nav-subitem-subscriptions').click()

  //   cy.getByTestID('subscriptions-empty-state').should('exist')
  // })
  // it('Create a LP subscription from the index page from load data nav', () => {
  //   cy.getByTestID('tree-nav-toggle').should('be.visible')
  //   cy.getByTestID('tree-nav-toggle').click()
  //   cy.getByTestID('nav-item-load-data').should('be.visible')
  //   cy.getByTestID('nav-item-load-data').click()
  //   cy.getByTestID('subscriptions--tab').should('be.visible')
  //   cy.getByTestID('subscriptions--tab').click()

  //   cy.getByTestID('create-subscription-button--empty').should('be.visible')
  //   cy.getByTestID('create-subscription-button--empty')
  //     .first()
  //     .click()

  //   // broker form
  //   cy.getByTestID('create-broker-form-overlay').should('be.visible')

  //   // back to create landing
  //   cy.getByTestID('create-broker-form--cancel').should('be.visible')
  //   cy.getByTestID('create-broker-form--cancel').click()

  //   // return to broker form
  //   cy.getByTestID('create-subscription-button--control-bar').should('be.visible')
  //   cy.getByTestID('create-subscription-button--control-bar')
  //     .first()
  //     .click()
  //   cy.getByTestID('create-broker-form-overlay').should('be.visible')

  //   // fill in broker form
  //   cy.getByTestID('create-broker-form--name').type('My Subscription')
  //   cy.getByTestID('create-broker-form--description').type('My Description')
  //   cy.getByTestID('dropdown')
  //     .contains('MQTT')
  //     .click()
  //   cy.getByTestID('create-broker-form--host').type('localhost')
  //   cy.getByTestID('create-broker-form--port').type('1883')
  //   cy.getByTestID('create-broker-form--submit').click()

  //   // subscription form
  //   cy.getByTestID('create-subscription-form--overlay-form').should(
  //     'be.visible'
  //   )

  //   // back to broker form
  //   cy.getByTestID('create-subscription-form--back').should('be.visible')
  //   cy.getByTestID('create-subscription-form--back').click()
  //   cy.getByTestID('create-broker-form-overlay').should('be.visible')

  //   // return to subscription
  //   cy.getByTestID('create-broker-form--submit').should('be.visible')
  //   cy.getByTestID('create-broker-form--submit').click()
  //   cy.getByTestID('create-subscription-form--overlay-form').should(
  //     'be.visible'
  //   )

  //   // fill in subscription form
  //   cy.getByTestID('create-subscription-form--topic').type('topic')
  //   cy.getByTestID('list-item')
  //     .contains('defbuck')
  //     .click()
  //   cy.getByTestID('create-subscription-form--submit').click()

  //   // parsing form
  //   cy.getByTestID('create-parsing-form-overlay').should('be.visible')

  //   // back to subscription
  //   cy.getByTestID('create-parsing-form--back').should('be.visible')
  //   cy.getByTestID('create-parsing-form--back').click()
  //   cy.getByTestID('create-subscription-form--overlay-form').should(
  //     'be.visible'
  //   )

  //   // return to parsing
  //   cy.getByTestID('create-subscription-form--submit').click()

  //   // line protocol
  //   cy.getByTestID('create-parsing-form-line-protocol--button').click()
  //   cy.getByTestID('create-parsing-form--submit').click()

  // cy.getByTestID('spinner-container').should('be.visible')

  //   cy.get('.cf-resource-card').should('be.visible')
  //   cy.get('.cf-resource-card').should('have.length', 4)
  //   cy.get('.cf-resource-card').contains('My Subscription')
  // })
  it('Create a JSON subscription from the index page from load data nav', () => {
    cy.getByTestID('tree-nav-toggle').should('be.visible')
    cy.getByTestID('tree-nav-toggle').click()
    cy.getByTestID('nav-item-load-data').should('be.visible')
    cy.getByTestID('nav-item-load-data').click()
    cy.getByTestID('subscriptions--tab').should('be.visible')
    cy.getByTestID('subscriptions--tab').click()

    cy.getByTestID('create-subscription-button--control-bar').should('be.visible')
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
    cy.getByTestID('timestamp-json-parsing').type('0123456789')
    cy.getByTestID('measurement-json-parsing-name').type('measurement')
    cy.getByTestID('measurement-json-parsing-type')
      .contains('String')
      .click()
    cy.getByTestID('measurement-json-parsing-path').type('$.m')
    cy.getByTestID('false-json-parsing-name').type('field')
    cy.getByTestID('false-json-parsing-type')
      .first()
      .contains('String')
      .click()
    cy.getByTestID('false-json-parsing-path').type('$.f')
    cy.getByTestID('true-json-parsing-name').type('tag')
    cy.getByTestID('true-json-parsing-type')
      .contains('String')
      .click()
    cy.getByTestID('true-json-parsing-path').type('$.t')
    cy.getByTestID('json-parsing-add-rule')
      .contains('Add Rule')
      .click()
    cy.getByTestID('field-json-delete-label').should('be.visible')
    cy.getByTestID('field-json-delete-label').click()
    cy.getByTestID('create-parsing-form--submit').click()

    cy.getByTestID('spinner-container').should('be.visible')

    cy.getByTestID('subscription-card').should('be.visible')
    cy.getByTestID('subscription-card').contains('My Subscription 2')
  })
  // it('Create a String subscription from the index page from load data nav', () => {
  //   cy.getByTestID('tree-nav-toggle').should('be.visible')
  //   cy.getByTestID('tree-nav-toggle').click()
  //   cy.getByTestID('nav-item-load-data').should('be.visible')
  //   cy.getByTestID('nav-item-load-data').click()
  //   cy.getByTestID('subscriptions--tab').should('be.visible')
  //   cy.getByTestID('subscriptions--tab').click()

  //   cy.getByTestID('create-subscription-button--control-bar').should('be.visible')
  //   cy.getByTestID('create-subscription-button--control-bar')
  //     .first()
  //     .click()

  //   // broker form
  //   cy.getByTestID('create-broker-form-overlay').should('be.visible')
  //   cy.getByTestID('create-broker-form--name').type('My Subscription 3')
  //   cy.getByTestID('create-broker-form--description').type('My Description')
  //   cy.getByTestID('dropdown')
  //     .contains('MQTT')
  //     .click()
  //   cy.getByTestID('create-broker-form--host').type('localhost')
  //   cy.getByTestID('create-broker-form--port').type('1883')
  //   cy.getByTestID('create-broker-form--submit').click()

  //   // subscription form
  //   cy.getByTestID('create-subscription-form--overlay-form').should(
  //     'be.visible'
  //   )
  //   cy.getByTestID('create-subscription-form--topic').type('topic')
  //   cy.getByTestID('list-item')
  //     .contains('defbuck')
  //     .click()
  //   cy.getByTestID('create-subscription-form--submit').click()

  //   // parsing form
  //   cy.getByTestID('create-parsing-form-overlay').should('be.visible')

  //   // string
  //   cy.getByTestID('create-parsing-form-string--button').click()
  //   cy.getByTestID('timestamp-string-parsing').type('0123456789')
  //   cy.getByTestID('measurment-string-parsing-pattern').type('m=//m')
  //   cy.getByTestID('Field-string-parsing-name').type('field')
  //   cy.getByTestID('Field-string-parsing-pattern').type('f=//f')
  //   cy.getByTestID('Tag-string-parsing-name').type('tag')
  //   cy.getByTestID('Tag-string-parsing-pattern').type('t=//t')

  //   cy.getByTestID('string-parsing-add-rule')
  //     .contains('tag')
  //     .click()
  //   cy.getByTestID('Field-string-delete-label').should('be.visible')
  //   cy.getByTestID('Field-string-delete-label').click()
  //   cy.getByTestID('create-parsing-form--submit').click()

  //   cy.getByTestID('spinner-container').should('be.visible')

  //   cy.getByTestID('subscription-card').should('be.visible')
  //   cy.getByTestID('subscription-card').contains('My Subscription 3')
  // })
  // it('Submit button should be disabled if free account', () => {
  //   cy.quartzProvision({
  //     accountType: 'free',
  //   })
  //     cy.get('.cf-tree-nav--toggle').click({force: true})
  //   cy.getByTestID('nav-item-load-data').should('be.visible')
  //   cy.getByTestID('nav-item-load-data').click()
  //   cy.getByTestID('subscriptions--tab').should('be.visible')
  //   cy.getByTestID('subscriptions--tab').click()

  //   cy.getByTestID('create-subscription-button--control-bar').should('be.visible')
  //   cy.getByTestID('create-subscription-button--control-bar')
  //     .first()
  //     .click()

  //   // broker form
  //   cy.getByTestID('create-broker-form-overlay').should('be.visible')
  //   cy.getByTestID('create-broker-form--name').type('My Test Subscription')
  //   cy.getByTestID('create-broker-form--description').type('My Description')
  //   cy.getByTestID('dropdown')
  //     .contains('MQTT')
  //     .click()
  //   cy.getByTestID('create-broker-form--host').type('localhost')
  //   cy.getByTestID('create-broker-form--port').type('1883')
  //   cy.getByTestID('create-broker-form--submit').click()

  //   // subscription form
  //   cy.getByTestID('create-subscription-form--overlay-form').should(
  //     'be.visible'
  //   )
  //   cy.getByTestID('create-subscription-form--topic').type('topic')
  //   cy.getByTestID('list-item')
  //     .contains('defbuck')
  //     .click()
  //   cy.getByTestID('create-subscription-form--submit').click()

  //   // parsing form
  //   cy.getByTestID('create-parsing-form-overlay').should('be.visible')
  // //  line protocol
  //  cy.getByTestID('create-parsing-form-line-protocol--button').click()
  //  cy.getByTestID('cloud-upgrade--button').should('be.visible')
  // })
  //   it('Subscriptions options shouldn\'t exist if flag isn\'t enabled', () => {
  //   cy.setFeatureFlags({
  //     subscriptionsResourceType: false,
  //   })
  // cy.getByTestID('tree-nav-toggle').should('be.visible')
  // cy.getByTestID('tree-nav-toggle').click()
  //   cy.getByTestID('nav-item-load-data').should('be.visible')
  //   cy.getByTestID('nav-item-load-data').click()
  //   cy.getByTestID('subscriptions--tab').should('not.exist')
  //   cy.getByTestID('load-data-item mqtt').should('not.exist')
  //   cy.getByTestID('nav-subitem-subscriptions').should('not.exist')
  // })
})
