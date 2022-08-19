import {Organization} from '../../../src/types'

describe('navigation', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.visit('/')
  })

  it('can navigate to each page from left nav', () => {
    // Load Data Page
    cy.getByTestID('nav-item-load-data').click({force: true})
    cy.getByTestID('tabs').within(() => {
      // buckets tab
      cy.get('[id="buckets"]').click()
      cy.url().should('contain', 'buckets')
    })
    cy.getByTestID('load-data--header').should('exist')

    // Data Explorer Page
    cy.clickNavBarItem('nav-item-data-explorer')
    cy.getByTestID('data-explorer--header').should('exist')

    // Dashboard Index Page
    cy.clickNavBarItem('nav-item-dashboards')
    cy.getByTestID('empty-dashboards-list').should('exist')

    // Tasks Index Page
    cy.clickNavBarItem('nav-item-tasks')
    cy.getByTestID('tasks-page--header').should('exist')

    // Alerts Page
    cy.clickNavBarItem('nav-item-alerting')
    cy.getByTestID('alerts-page--header').should('exist')

    // Settings Page
    cy.clickNavBarItem('nav-item-settings')
    cy.getByTestID('settings-page--header').should('exist')

    // Home Page
    cy.clickNavBarItem('tree-nav--header')
    cy.getByTestID('home-page--header').should('exist')

    // 404
    cy.visit('/not-a-route')
    cy.getByTestID('not-found').should('exist')
    cy.visit('/')

    cy.getByTestID('user-nav').should('exist')
    cy.get<Organization>('@org').then(({id}: Organization) => {
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

    // User Nav -- Settings
    cy.getByTestID('user-nav').click()
    cy.getByTestID('user-nav-item-about').click()
    cy.getByTestID('about-page--header').should('exist')
    const url = Cypress.env('dexUrl') === 'OSS' ? 'about' : 'org-settings'
    cy.url().should('contain', url)

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
    cy.clickNavBarItem('nav-item-load-data')

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
    cy.clickNavBarItem('nav-item-settings')
    exploreTabs(['templates', 'labels', 'variables'])
  })

  it('can navigate in tabs of collapsed alerts page', () => {
    cy.clickNavBarItem('nav-item-alerting')
    ;['checks', 'endpoints', 'rules'].forEach(tab => {
      cy.getByTestID(`alerting-tab--${tab}`).click()
      cy.getByTestID(`alerting-tab--${tab}--input`).should('to.be', 'checked')
    })
  })

  it('can navigate in tabs from maximized left tree nav', () => {
    // TODO: check if nav is already maximized
    cy.get('.cf-tree-nav--toggle').click({force: true})
    ;[
      'sources',
      'buckets',
      'telegrafs',
      'tokens',
      'history',
      'variables',
      'templates',
      'labels',
    ].forEach(navItem => {
      if (navItem === 'history') {
        cy.clickNavBarItem('nav-item-alerting')
      } else if (
        navItem === 'variables' ||
        navItem === 'templates' ||
        navItem === 'labels'
      ) {
        cy.clickNavBarItem('nav-item-settings')
      } else {
        cy.clickNavBarItem('nav-item-load-data')
      }

      cy.getByTestID(`nav-subitem-${navItem}`)
        .last()
        .click()
      cy.url().should('contain', navItem)
    })

    cy.get('.cf-tree-nav--toggle').click()
  })
})
