import {Organization} from '../../../src/types'

// webpack bundling error if try importing --> due to imports in the constants file
const IOX_SWITCHOVER_CREATION_DATE = '2023-01-31T00:00:00Z'

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
    describe('has specific navigation options', () => {
      beforeEach(() => {
        cy.signinWithoutUserReprovision()
      })

      it('depreciated features do not exist', () => {
        cy.getByTestID('nav-item-flows').should('not.exist')
        cy.getByTestID('nav-item-alerting').should('not.exist')
        cy.getByTestID('nav-item-dashboards').should('not.exist')
        cy.getByTestID('nav-item-tasks').should('not.exist')
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

    // TODO: add any more marty-specific features
  })

  describe('iox users prior to the Marty-release date', () => {
    const beforeCutoff = new Date(
      new Date(IOX_SWITCHOVER_CREATION_DATE) - 10000
    ).toISOString()
    beforeEach(() => {
      cy.intercept('GET', '/api/v2/orgs', req => {
        req.continue(res => {
          const orgs = res.body.orgs.map(org => ({
            ...org,
            createdAt: beforeCutoff,
          }))
          res.body.orgs = orgs
        })
      })
      cy.signinWithoutUserReprovision()
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
