describe('multi-account multi-org global header', () => {
  const globalHeaderFeatureFlags = {
    quartzIdentity: true,
    multiOrg: true,
  }

  let myOrgId: string

  // Sync the user's current quartz org ID to the IDPE-generated ID.
  const syncQuartzToIDPE = () => {
    cy.intercept('GET', 'api/v2/quartz/identity', req => {
      req.continue(res => {
        res.body.org.id = myOrgId
      })
    }).as('getIdentity')

    cy.intercept('GET', '/api/v2/quartz/accounts/**/orgs', req => {
      req.continue(res => {
        res.body[0].id = myOrgId
      })
    }).as('getQuartzOrgs')

    cy.intercept('GET', 'api/v2/quartz/orgs/*', req => {
      req.continue(res => {
        res.body.id = myOrgId
      })
    }).as('getOrgDetails')
  }

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('sid')
  })

  before(() => {
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.request({
          method: 'GET',
          url: '/api/v2/orgs',
        }).then(res => {
          myOrgId = res.body.orgs[0].id
        })
      })
    )
  })

  describe('change accounts and orgs header', () => {
    // it('doesnt load the global header if no account or organization data is retrieved', () => {
    //  })
    // it('changes the active account', () => {})

    beforeEach(() => {
      syncQuartzToIDPE()
      cy.setFeatureFlags(globalHeaderFeatureFlags).then(() => {
        cy.wait(400)
      })
    })

    describe('org header', () => {
      it('navigates to the org settings page', () => {
        cy.log(myOrgId)
        cy.getByTestID('globalheader--org-dropdown')
          .should('be.visible')
          .click()
        cy.getByTestID('globalheader--org-dropdown-main').should('be.visible')
        cy.getByTestID('globalheader--org-dropdown-main-Settings')
          .should('be.visible')
          .click()

        cy.location('pathname').should('eq', `/orgs/${myOrgId}/about`)
        cy.getByTestID('org-profile--panel')
          .should('be.visible')
          .and('contain', 'Organization Profile')
      })

      it('navigates to the org members page', () => {
        cy.log(myOrgId)
        cy.getByTestID('globalheader--org-dropdown')
          .should('be.visible')
          .click()
        cy.getByTestID('globalheader--org-dropdown-main').should('be.visible')
        cy.getByTestID('globalheader--org-dropdown-main-Members')
          .should('be.visible')
          .click()

        cy.location('pathname').should('eq', `/orgs/${myOrgId}/users`)
        cy.getByTestID('tabs--container')
          .should('be.visible')
          .and('contain', 'Add a new user to your organization')
      })

      it('navigates to the org usage page', () => {
        cy.log(myOrgId)
        cy.getByTestID('globalheader--org-dropdown')
          .should('exist')
          .click()

        cy.getByTestID('globalheader--org-dropdown-main').should('be.visible')
        cy.log(myOrgId)
        cy.getByTestID('globalheader--org-dropdown-main-Usage')
          .should('be.visible')
          .click()
        cy.log(myOrgId)
        cy.location('pathname').should('eq', `/orgs/${myOrgId}/usage`)
        cy.getByTestID('tabs--container')
          .should('be.visible')
          .and('contain', 'Billing Stats')
      })

      // it('changes the active org', () => {

      // })
    })

    describe('account header', () => {
      it('navigates to the account settings page', () => {
        cy.log(myOrgId)
        syncQuartzToIDPE()

        cy.getByTestID('globalheader--account-dropdown')
          .should('exist')
          .click()

        cy.getByTestID('globalheader--account-dropdown-main').should(
          'be.visible'
        )

        cy.getByTestID('globalheader--account-dropdown-main-Settings')
          .should('be.visible')
          .click()
      })

      it('navigates to the account billing page', () => {
        cy.log(myOrgId)
        syncQuartzToIDPE()

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

      // it('changes the active account', () => {

      // })
    })
  })

  describe('user profile avatar', () => {
    before(() => {
      cy.setFeatureFlags(globalHeaderFeatureFlags).then(() => {
        cy.wait(400).then(() => {
          cy.visit('/')
        })
      })
    })

    it('navigates to the `user profile` page', () => {
      cy.getByTestID('global-header--user-avatar')
        .should('be.visible')
        .click({scrollBehavior: false})

      cy.getByTestID('global-header--user-popover-profile-button')
        .should('be.visible')
        .click({scrollBehavior: false})

      cy.getByTestID('user-profile--page').should('be.visible')

      cy.getByTestID('global-header--user-avatar')
        .should('be.visible')
        .click({scrollBehavior: false})
    })

    it('allows the user to log out', () => {
      cy.getByTestID('global-header--user-avatar')
        .should('be.visible')
        .click({scrollBehavior: false})

      cy.getByTestID('global-header--user-popover-logout-button')
        .should('be.visible')
        .click({
          scrollBehavior: false,
        })
      // Logout in remocal looks like a 404 because there is no quartz. This tests the logout URL.
      cy.location('pathname').should('eq', '/logout')
    })
  })
})
