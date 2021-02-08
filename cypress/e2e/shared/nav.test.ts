import {Organization} from '../../src/types'

describe('navigation', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => cy.visit('/'))
  })

  it('can navigate to each page from left nav', () => {
    // Load Data Page
    cy.getByTestID('nav-item-load-data').click()
    cy.getByTestID('load-data--header').should('exist')

    // Data Explorer Page
    cy.getByTestID('nav-item-data-explorer').click()
    cy.getByTestID('data-explorer--header').should('exist')

    // Dashboard Index Page
    cy.getByTestID('nav-item-dashboards').click()
    cy.getByTestID('empty-dashboards-list').should('exist')

    // Tasks Index Page
    cy.getByTestID('nav-item-tasks').click()
    cy.getByTestID('tasks-page--header').should('exist')

    // Alerts Page
    cy.getByTestID('nav-item-alerting').click()
    cy.getByTestID('alerts-page--header').should('exist')

    // Settings Page
    cy.getByTestID('nav-item-settings').click()
    cy.getByTestID('settings-page--header').should('exist')

    // Home Page
    cy.getByTestID('tree-nav--header').click()
    cy.getByTestID('home-page--header').should('exist')

    // 404
    cy.visit('/not-a-route')
    cy.getByTestID('not-found').should('exist')
    cy.visit('/')

    cy.getByTestID('user-nav').should('exist')
    cy.get('@org').then(({id}: Organization) => {
      cy.visit(`/orgs/${id}/not-a-route`)
      cy.getByTestID('not-found').should('exist')
    })

    /** \

     OSS Only Feature
     // User Nav -- Members
     cy.getByTestID('user-nav').click()
     cy.getByTestID('user-nav-item-members').click()
     cy.getByTestID('member-page--header').should('exist')
     cy.url().should('contain', 'members')

     \**/

    // User Nav -- About
    cy.getByTestID('user-nav').click()
    cy.getByTestID('user-nav-item-about').click()
    cy.getByTestID('member-page--header').should('exist')
    cy.url().should('contain', 'about')

    /** \

     OSS Only Feature
     // User Nav -- Switch Orgs
     cy.getByTestID('user-nav').click()
     cy.getByTestID('user-nav-item-switch-orgs').click()
     cy.getByTestID('switch-overlay--header').should('exist')
     cy.get('.cf-overlay--dismiss').click()

     \**/

    /** \

     OSS Only Feature
     // User Nav -- Create Orgs
     cy.getByTestID('user-nav').click()
     cy.getByTestID('user-nav-item-create-orgs').click()
     cy.getByTestID('create-org-overlay--header').should('exist')
     cy.get('.cf-overlay--dismiss').click()

     \**/

    /** \

     OSS Only Feature
     // User Nav -- Log Out
     cy.getByTestID('user-nav').click()
     cy.getByTestID('user-nav-item-logout').click()
     cy.getByTestID('signin-page').should('exist')

     \**/
  })

  it('can navigate in tabs of data page', () => {
    cy.getByTestID('nav-item-load-data').click()

    cy.getByTestID('tabs').within(() => {
      // buckets tab
      cy.get('[id="buckets"]').click()
      cy.url().should('contain', 'buckets')
    })

    cy.getByTestID('tabs').within(() => {
      // telegraf tab
      cy.get('[id="telegrafs"]').click()
      cy.url().should('contain', 'telegraf')
    })

    cy.getByTestID('tabs').within(() => {
      // tokens tab
      cy.get('[id="tokens"]').click()
      cy.url().should('contain', 'tokens')
    })

    cy.getByTestID('tabs').within(() => {
      // sources tab
      cy.get('[id="sources"]').click()
      cy.url().should('contain', 'sources')
    })
  })

  const exploreTabs = (tabs: string[]) => {
    tabs.forEach(tab => {
      cy.getByTestID(`${tab}--tab`).click()
      cy.url().should('contain', tab)
    })
  }

  it('can navigate in tabs of settings page', () => {
    cy.getByTestID('nav-item-settings').click()
    exploreTabs(['templates', 'labels', 'variables'])
  })

  it('can navigate in tabs of collapsed alerts page', () => {
    cy.getByTestID('nav-item-alerting').click()
    ;['checks', 'endpoints', 'rules'].forEach(tab => {
      cy.getByTestID(`alerting-tab--${tab}`).click()
      cy.getByTestID(`alerting-tab--${tab}--input`).should('to.be', 'checked')
    })
  })

  it('can navigate in tabs from maximized left tree nav', () => {
    // TODO: check if nav is already maximized
    cy.get('.cf-tree-nav--toggle').click()
    ;[
      'sources',
      'buckets',
      'telegrafs',
      'tokens',
      'history',
      'variables',
      'templates',
      'labels',
    ].forEach(x => {
      cy.getByTestID(`nav-subitem-${x}`)
        .last()
        .click()
      cy.url().should('contain', x)
    })

    cy.get('.cf-tree-nav--toggle').click()
  })
})
