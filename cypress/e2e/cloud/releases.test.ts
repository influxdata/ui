import {Organization} from '../../../src/types'

describe('IOX tests should be running', () => {
  beforeEach(() => {
    cy.flush().then(() => cy.signin())
  })

  it('cypress iox bool matches the storage provisioned', () => {
    const isIOxOrg = Boolean(Cypress.env('useIox'))
    cy.isIoxOrg().then(isIox => {
      expect(isIox).to.equal(isIOxOrg)
    })
  })
})

describe('Deprecations per cloud release', () => {
  before(() => {
    cy.flush().then(() =>
      cy.signin().then(() =>
        cy.isIoxOrg().then(isIox => {
          cy.skipOn(!isIox)
          cy.visit('/')
          cy.getByTestID('home-page--header').should('be.visible')
        })
      )
    )
  })

  describe('Marty-release', () => {
    beforeEach(() => {
      cy.signinWithoutUserReprovision()
    })

    describe('has specific navigation options', () => {
      describe('depreciated features do not exist', () => {
        ;[
          {
            route: orgID => `orgs/${orgID}/notebooks`,
            navId: 'nav-item-flows',
            name: 'notebooks',
          },
          {
            route: orgID => `orgs/${orgID}/alerting`,
            navId: 'nav-item-alerting',
            name: 'alerts',
          },
          {
            route: orgID => `orgs/${orgID}/dashboards-list`,
            navId: 'nav-item-dashboards',
            name: 'dashboards',
          },
          {
            route: orgID => `orgs/${orgID}/tasks`,
            navId: 'nav-item-tasks',
            name: 'tasks',
          },
        ].forEach(({route, navId, name}) => {
          it(`does not permit access to ${name}`, () => {
            cy.getByTestID(navId).should('not.exist')
            cy.get<Organization>('@org').then(({id: orgID}: Organization) => {
              cy.visit(route(orgID))
              cy.getByTestID('tree-nav').should('be.visible')
              cy.contains('404: Page Not Found')
            })
          })
        })
      })

      describe('supported features are still navigable', () => {
        ;[
          {navId: 'nav-item-data-explorer', title: 'Data Explorer'},
          {navId: 'nav-item-load-data', title: 'Load Data'},
          {navId: 'nav-item-settings', title: 'Settings'},
        ].forEach(({navId, title}) => {
          it(`for ${title} page`, () => {
            cy.getByTestID(navId).should('be.visible').click({force: true})
            cy.getByTestID('page-title').contains(title)
          })
        })
      })

      describe('nav subItems are navigable based upon selective support', () => {
        ;[
          {
            navId: 'nav-item-load-data',
            navSubId: 'nav-subitem-sources',
            tabId: 'sources--tab',
            supported: true,
          },
          {
            navId: 'nav-item-load-data',
            navSubId: 'nav-subitem-buckets',
            tabId: 'buckets--tab',
            supported: true,
          },
          {
            navId: 'nav-item-load-data',
            navSubId: 'nav-subitem-telegrafs',
            tabId: 'telegrafs--tab',
            supported: true,
          },
          {
            navId: 'nav-item-load-data',
            navSubId: 'nav-subitem-tokens',
            tabId: 'tokens--tab',
            supported: true,
          },
          {
            navId: 'nav-item-load-data',
            navSubId: 'nav-subitem-subscriptions',
            tabId: 'subscriptions--tab',
            supported: false,
          },
          {
            navId: 'nav-item-settings',
            navSubId: 'nav-subitem-labels',
            tabId: 'labels--tab',
            supported: true,
          },
          {
            navId: 'nav-item-settings',
            navSubId: 'nav-subitem-secrets',
            tabId: 'secrets--tab',
            supported: true,
          },
          {
            navId: 'nav-item-settings',
            navSubId: 'nav-subitem-templates',
            tabId: 'templates--tab',
            supported: false,
          },
        ].forEach(({navId, navSubId, tabId, supported}) => {
          it(`${navSubId} is ${
            supported ? 'supported' : 'not supported'
          }`, () => {
            cy.getByTestID(navId).should('be.visible').click({force: true})
            cy.getByTestID(navSubId).should(supported ? 'exist' : 'not.exist')
            cy.getByTestID(tabId).should(supported ? 'be.visible' : 'not.exist')
          })
        })
      })
    })
  })

  describe('iox users prior to the Marty-release date', () => {
    beforeEach(() => {
      cy.mockIsCloud2Org().then(() => cy.signinWithoutUserReprovision())
    })

    it('have everything exist except notebooks', () => {
      cy.getByTestID('nav-item-flows').should('not.exist')

      cy.getByTestID('nav-item-dashboards').should('exist').click({force: true})
      cy.getByTestID('page-title').contains('Dashboards')

      cy.getByTestID('nav-item-tasks').should('exist').click({force: true})
      cy.getByTestID('page-title').contains('Tasks')

      cy.getByTestID('nav-item-alerting').should('exist').click({force: true})
      cy.getByTestID('page-title').contains('Alerts')
    })

    it('if pre-existing notebooks --> then notebooks access does exist', () => {
      cy.get('@org').then(({id}: Organization) =>
        cy.createNotebook(id).then(() => cy.reload())
      )
      cy.getByTestID('nav-item-flows').should('exist').click({force: true})
      cy.getByTestID('page-title').contains('Notebooks')
    })
  })
})
