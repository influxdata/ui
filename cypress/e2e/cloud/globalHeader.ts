describe('change-account change-org global header', () => {
  const globalHeaderFeatureFlags = {
    quartzIdentity: true,
    multiOrg: true,
  }

  let idpeOrgID: string

  const interceptPageReload = () => {
    cy.intercept('GET', 'api/v2/orgs').as('getOrgs')
    cy.intercept('GET', 'api/v2/flags').as('getFlags')
    cy.intercept('GET', 'api/v2/quartz/accounts/**/orgs').as('getQuartzOrgs')
  }

  const makeQuartzUseIDPEOrgID = () => {
    cy.intercept('GET', 'api/v2/quartz/identity', req => {
      req.continue(res => {
        res.body.org.id = idpeOrgID
      })
    }).as('getQuartzIdentity')

    cy.intercept('GET', '/api/v2/quartz/accounts/**/orgs', req => {
      req.continue(res => {
        res.body[0].id = idpeOrgID
      })
    }).as('getQuartzOrgs')

    cy.intercept('GET', 'api/v2/quartz/orgs/*', req => {
      req.continue(res => {
        res.body.id = idpeOrgID
      })
    }).as('getQuartzOrgDetails')
  }

  const mockQuartzOutage = () => {
    const quartzFailure = {
      statusCode: 503,
      body: 'Service Unavailable',
    }

    cy.intercept('GET', 'api/v2/quartz/identity', quartzFailure).as(
      'getQuartzIdentity'
    )
    cy.intercept('GET', 'api/v2/quartz/accounts', quartzFailure).as(
      'getQuartzAccounts'
    )
  }

  before(() => {
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.request({
          method: 'GET',
          url: '/api/v2/orgs',
        }).then(res => {
          // Store the IDPE org ID so that it can be cloned when intercepting quartz.
          idpeOrgID = res.body.orgs[0].id
        })
      })
    )
  })

  beforeEach(() => {
    // Preserve one session throughout.
    Cypress.Cookies.preserveOnce('sid')
    cy.setFeatureFlags(globalHeaderFeatureFlags)
  })

  describe('global change-account and change-org header', () => {
    it('does not render when API requests to quartz fail', () => {
      mockQuartzOutage()
      interceptPageReload()
      // cy.setFeatureFlags(globalHeaderFeatureFlags).then(() => {
      cy.visit('/')
      cy.wait(['@getQuartzIdentity', '@getQuartzAccounts'])
      cy.getByTestID('global-header--container').should('not.exist')
      // })
    })

    describe('change org dropdown', () => {
      before(() => {
        cy.request({
          method: 'GET',
          url: '/api/v2/orgs',
        }).then(res => {
          // Retrieve the user's org ID from IDPE.
          idpeOrgID = res.body.orgs[0].id

          cy.setFeatureFlags(globalHeaderFeatureFlags)
          cy.visit('/')
        })
      })

      beforeEach(() => {
        // For each test, replace the org id served by quartz-mock with the IDPE org id.
        // This ensures that routes based on the current org id are compatible with quartz-mock.
        makeQuartzUseIDPEOrgID()
        // A short wait is needed to ensure we've completed trailing API calls. Can't consistently cy.wait one route,
        // as the problem call varies. This adds < 1s to a 35+ second run, which seems acceptable to combat flake.
        cy.wait(500)
      })

      it('navigates to the org settings page', () => {
        cy.getByTestID('globalheader--org-dropdown')
          .should('be.visible')
          .click()
        cy.getByTestID('globalheader--org-dropdown-main').should('be.visible')
        cy.getByTestID('globalheader--org-dropdown-main-Settings')
          .should('be.visible')
          .click()

        cy.location('pathname').should('eq', `/orgs/${idpeOrgID}/org-settings`)
        cy.getByTestID('org-profile--panel')
          .should('be.visible')
          .and('contain', 'Organization Profile')
      })

      it('navigates to the org members page', () => {
        cy.getByTestID('globalheader--org-dropdown')
          .should('be.visible')
          .click()
        cy.getByTestID('globalheader--org-dropdown-main').should('be.visible')
        cy.getByTestID('globalheader--org-dropdown-main-Members')
          .should('be.visible')
          .click()

        cy.location('pathname').should('eq', `/orgs/${idpeOrgID}/members`)
        cy.getByTestID('tabs--container')
          .should('be.visible')
          .and('contain', 'Add a new user to your organization')
      })

      it('navigates to the org usage page', () => {
        cy.getByTestID('globalheader--org-dropdown')
          .should('exist')
          .click()

        cy.getByTestID('globalheader--org-dropdown-main').should('be.visible')
        cy.getByTestID('globalheader--org-dropdown-main-Usage')
          .should('be.visible')
          .click()
        cy.location('pathname').should('eq', `/orgs/${idpeOrgID}/usage`)
        cy.getByTestID('tabs--container')
          .should('be.visible')
          .and('contain', 'Billing Stats')
      })

      it('can change change the active org', () => {
        cy.intercept('GET', 'auth/orgs/58fafbb4f68e05e5', {
          statusCode: 200,
          body: 'Reaching this page serves an org change in prod.',
        }).as('getNewOrg')

        cy.getByTestID('globalheader--org-dropdown')
          .should('exist')
          .click()

        cy.getByTestID('globalheader--org-dropdown-main').should('be.visible')
        cy.getByTestID('dropdown-item')
          .contains('Switch Organization')
          .should('be.visible')
          .click()

        cy.getByTestID('globalheader--org-dropdown-typeahead')
          .should('be.visible')
          .type('g 5')

        cy.getByTestID('globalheader--org-dropdown-main--contents')
          .contains('Org 5')
          .should('be.visible')
          .click()

        cy.contains('Reaching this page serves an org change in prod.').should(
          'be.visible'
        )
      })
    })

    describe('change account dropdown', () => {
      beforeEach(() => {
        makeQuartzUseIDPEOrgID()
        cy.setFeatureFlags(globalHeaderFeatureFlags)
      })

      before(() => {
        cy.visit('/')
      })

      it('navigates to the account settings page', () => {
        cy.getByTestID('globalheader--account-dropdown')
          .should('exist')
          .click()

        cy.getByTestID('globalheader--account-dropdown-main').should(
          'be.visible'
        )

        cy.getByTestID('globalheader--account-dropdown-main-Settings')
          .should('be.visible')
          .click()

        cy.getByTestID('account-settings--header').should('be.visible')
      })

      it('navigates to the account billing page', () => {
        cy.getByTestID('globalheader--account-dropdown')
          .should('exist')
          .click()

        cy.getByTestID('globalheader--account-dropdown-main').should(
          'be.visible'
        )

        cy.getByTestID('globalheader--account-dropdown-main-Billing')
          .should('be.visible')
          .click()
      })

      it('can change change the active account', () => {
        cy.intercept('GET', 'auth/accounts/415', {
          statusCode: 200,
          body: 'Reaching this page serves an account change in prod.',
        }).as('getNewAccount')

        cy.getByTestID('globalheader--account-dropdown')
          .should('exist')
          .click()

        cy.getByTestID('globalheader--account-dropdown-main').should(
          'be.visible'
        )
        cy.getByTestID('dropdown-item')
          .contains('Switch Account')
          .should('be.visible')
          .click()

        cy.getByTestID('globalheader--account-dropdown-typeahead')
          .should('be.visible')
          .type('gan')

        cy.getByTestID('globalheader--account-dropdown-main--contents')
          .contains('Veganomicon')
          .should('be.visible')
          .click()

        cy.contains(
          'Reaching this page serves an account change in prod.'
        ).should('be.visible')
      })
    })
  })

  describe('user profile avatar', {scrollBehavior: false}, () => {
    before(() => {
      cy.flush().then(() =>
        cy.signin().then(() => {
          cy.request({
            method: 'GET',
            url: '/api/v2/orgs',
          }).then(res => {
            // Store the IDPE org ID so that it can be cloned when intercepting quartz.
            idpeOrgID = res.body.orgs[0].id
          })
        })
      )

      interceptPageReload()
      makeQuartzUseIDPEOrgID()
      // A reset is required here because the prior test ends on a mocked-up page served by cy.intercept,
      // which stands in for the 'change account' page actually served by quartz in prod.
      cy.visit('/').then(() => {
        cy.wait(['@getOrgs', '@getFlags'])
        cy.setFeatureFlags(globalHeaderFeatureFlags).then(() => {
          cy.wait('@getQuartzOrgs')
          cy.visit('/')
        })
      })
    })

    it('navigates to the `user profile` page', () => {
      cy.getByTestID('global-header--user-avatar')
        .should('be.visible')
        .click()

      cy.getByTestID('global-header--user-popover-profile-button')
        .should('be.visible')
        .click()

      cy.getByTestID('user-profile--page').should('be.visible')

      cy.getByTestID('global-header--user-avatar')
        .should('be.visible')
        .click()
    })

    it('allows the user to log out', () => {
      cy.getByTestID('global-header--user-avatar')
        .should('be.visible')
        .click()

      cy.getByTestID('global-header--user-popover-logout-button')
        .should('be.visible')
        .click()
      // Logout in remocal looks like a 404 because there is no quartz. This tests the logout URL.
      cy.location('pathname').should('eq', '/logout')
    })
  })
})
