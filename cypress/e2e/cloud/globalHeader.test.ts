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
    cy.fixture('multiOrgAccounts1.json').then(quartzAccounts => {
      cy.intercept('GET', 'api/v2/quartz/accounts', quartzAccounts).as(
        'getQuartzAccounts'
      )
    })

    cy.fixture('multiOrgIdentity').then(quartzIdentity => {
      quartzIdentity.org.id = idpeOrgID
      cy.intercept('GET', 'api/v2/quartz/identity', quartzIdentity).as(
        'getQuartzIdentity'
      )
    })

    cy.fixture('multiOrgOrgs1').then(quartzOrgs => {
      quartzOrgs[0].id = idpeOrgID

      cy.intercept('GET', 'api/v2/quartz/accounts/**/orgs', quartzOrgs).as(
        'getQuartzOrgs'
      )
    })

    cy.fixture('orgDetails').then(quartzOrgDetails => {
      quartzOrgDetails.id = idpeOrgID
      cy.intercept('GET', 'api/v2/quartz/orgs/*', quartzOrgDetails).as(
        'getQuartzOrgDetails'
      )
    })
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
          url: 'api/v2/orgs',
        }).then(res => {
          // Store the IDPE org ID so that it can be cloned when intercepting quartz.
          if (res.body.orgs) {
            idpeOrgID = res.body.orgs[0].id
          }
        })
      })
    )
  })

  beforeEach(() => {
    // Preserve one session throughout.
    Cypress.Cookies.preserveOnce('sid')
    cy.setFeatureFlags(globalHeaderFeatureFlags)
  })

  afterEach(() => {
    cy.wait(1200)
  })

  describe('global change-account and change-org header', () => {
    it('does not render when API requests to quartz fail', () => {
      mockQuartzOutage()
      interceptPageReload()
      cy.setFeatureFlags(globalHeaderFeatureFlags).then(() => {
        cy.visit('/')
        cy.wait('@getQuartzAccounts')
        cy.getByTestID('global-header--container').should('not.exist')
      })
    })

    describe('change org dropdown', () => {
      before(() => {
        makeQuartzUseIDPEOrgID()
        cy.setFeatureFlags(globalHeaderFeatureFlags)
        cy.visit('/')
      })

      it('navigates to the org settings page', () => {
        makeQuartzUseIDPEOrgID()
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
        makeQuartzUseIDPEOrgID()
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
        cy.getByTestID('globalheader--org-dropdown').should('exist').click()

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
        makeQuartzUseIDPEOrgID()
        cy.getByTestID('globalheader--org-dropdown').should('exist').click()

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

        // Absent real quartz, testing this redirect will not work, and Firefox doesn't play nicely
        // with being asked to intercept the route. So expect the org id as the button's id
        // which is where this component pulls the link from.
        cy.get('button#58fafbb4f68e05e5').should('contain', 'Test Org 5')
        cy.getByTestID('globalheader--org-dropdown').click()
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
        makeQuartzUseIDPEOrgID()
        cy.getByTestID('globalheader--account-dropdown').should('exist').click()

        cy.getByTestID('globalheader--account-dropdown-main').should(
          'be.visible'
        )

        cy.getByTestID('globalheader--account-dropdown-main-Settings')
          .should('be.visible')
          .click()

        cy.getByTestID('account-settings--header').should('be.visible')
      })

      it('navigates to the account billing page', () => {
        makeQuartzUseIDPEOrgID()
        cy.getByTestID('globalheader--account-dropdown').should('exist').click()

        cy.getByTestID('globalheader--account-dropdown-main').should(
          'be.visible'
        )

        cy.getByTestID('globalheader--account-dropdown-main-Billing')
          .should('be.visible')
          .click()

        cy.getByTestID('accounts-billing-tab')
          .should('be.visible')
          .and('contain', 'Billing')
      })

      it('can change change the active account', () => {
        makeQuartzUseIDPEOrgID()
        cy.getByTestID('globalheader--account-dropdown').should('exist').click()

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

        // See earlier comment re: no quartz, so testing based on ID, which generates the URL for
        // the redirect link in production.
        cy.get('button#415').should('contain', 'Veganomicon')
        cy.getByTestID('globalheader--account-dropdown').click()
      })
    })
  })

  describe('user profile avatar', {scrollBehavior: false}, () => {
    before(() => {
      makeQuartzUseIDPEOrgID()
      cy.setFeatureFlags(globalHeaderFeatureFlags)
      cy.visit('/')
    })

    it('navigates to the `user profile` page', () => {
      makeQuartzUseIDPEOrgID()
      cy.getByTestID('global-header--user-avatar').should('be.visible').click()

      cy.getByTestID('global-header--user-popover-profile-button')
        .should('be.visible')
        .click()

      cy.getByTestID('user-profile--page').should('be.visible')

      cy.getByTestID('global-header--user-avatar').should('be.visible').click()
    })

    it('allows the user to log out', () => {
      makeQuartzUseIDPEOrgID()
      cy.getByTestID('global-header--user-avatar').should('be.visible').click()

      // Logout can't be handled in the test, and redirects to a 404 that
      // Firefox doesn't recognize as a new page. Instead, just check if the
      // href of the logout button is correct.
      cy.getByTestID('global-header--user-popover-logout-button')
        .should('be.visible')
        .parent()
        .should('have.attr', 'href', '/logout')
    })
  })
})
