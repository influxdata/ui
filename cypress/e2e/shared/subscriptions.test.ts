import {Organization} from '../../../src/types'

describe('Subscriptions', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.get<Organization>('@org').then(({id}: Organization) =>
      cy.fixture('routes').then(({orgs}) => {
        cy.visit(`${orgs}/${id}`)
      })
    )
  })

  it('Navigate to empty subscriptions page via sources tab', () => {
    cy.setFeatureFlags({
      subscriptionsResourceType: true,
    })
    cy.quartzProvision({
      accountType: 'pay_as_you_go',
    })
    cy.get('.cf-tree-nav--toggle').click({force: true})
    cy.getByTestID('nav-item-load-data').should('be.visible')
    cy.getByTestID('nav-item-load-data').click()
    cy.getByTestID('subscriptions--tab').should('be.visible')

    cy.getByTestID('load-data-item mqtt')
      .scrollIntoView()
      .should('be.visible')
    cy.getByTestID('load-data-item mqtt').click()

    cy.getByTestID('subscriptions-empty-state').should('exist')
  })
  it('Navigate to subscriptions page via load data dropdown', () => {
    cy.setFeatureFlags({
      subscriptionsResourceType: true,
    })
    cy.quartzProvision({
      accountType: 'pay_as_you_go',
    })
    cy.get('.cf-tree-nav--toggle').click({force: true})
    cy.getByTestID('nav-item-load-data').should('be.visible')
    cy.getByTestID('nav-item-load-data').click()
    cy.getByTestID('nav-subitem--subscriptions').should('be.visible')
    cy.getByTestID('nav-subitem--subscriptions').click({force: true})

    cy.getByTestID('subscriptions-empty-state').should('exist')
  })
  it('Create a subscription from the index page from load data nav', () => {
    cy.setFeatureFlags({
      subscriptionsResourceType: true,
    })
    cy.quartzProvision({
      accountType: 'pay_as_you_go',
    })
    cy.get('.cf-tree-nav--toggle').click({force: true})
    cy.getByTestID('nav-item-load-data').should('be.visible')
    cy.getByTestID('nav-item-load-data').click()
    cy.getByTestID('subscriptions--tab').should('be.visible')
    cy.getByTestID('subscriptions--tab').click()

    cy.getByTestID('create-subscription-button').should('be.visible')
    cy.getByTestID('create-subscription-button').click()

    cy.getByTestID('create-broker-form').should('be.visible')

    cy.getByTestID('create-broker-form--name').type('My Subscription')
    cy.getByTestID('create-broker-form--description').type('My Description')
    cy.getByTestID('create-broker-form--protocol').type('mqtt')
    cy.getByTestID('create-broker-form--host').type('localhost')
    cy.getByTestID('create-broker-form--port').type('1883')

    cy.getByTestID('create-broker-form--dropdown-button')
      .click()
      .then(() => {
        cy.getByTestID('create-broker-form-1').click()
      })

    cy.getByTestID('create-subscription-form').should('be.visible')

    cy.getByTestID('create-subscription-form--topic').type('topic')
    cy.getByTestID('list-item').click()

    cy.getByTestID('create-parsing-form').should('be.visible')

    cy.getByTestID('create-parsing-form-line-protocol--button').click()
    cy.getByTestID('create-parsing-form--submit').click()

    cy.getByTestID('subscriptions-list').should('exist')
    cy.getByTestID('subscription-card').should('exist')
    cy.getByTestID('resource-card').contains('My Subscription')
  })
})
