import {makeQuartzUseIDPEOrgID} from 'cypress/support/Utils'
import {Organization} from 'src/client'

describe('global header', () => {
  let idpeOrgID: string
  let idpeOrg: Organization

  const orgIsIOx = () => idpeOrg.defaultStorageType === 'iox'

  before(() => {
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.request({
          method: 'GET',
          url: 'api/v2/orgs',
        }).then(res => {
          makeQuartzUseIDPEOrgID(idpeOrgID)
          // Store the IDPE org ID so that it can be cloned when intercepting quartz.
          if (res.body.orgs) {
            idpeOrgID = res.body.orgs[0].id
            idpeOrg = res.body.orgs[0]
          }
        })
      })
    )
  })

  beforeEach(() => {
    // Preserve one session throughout.
    makeQuartzUseIDPEOrgID(idpeOrgID)
    Cypress.Cookies.preserveOnce('sid')
  })

  afterEach(() => {
    cy.wait(1200)
  })

  describe('change-account and change-org dropdowns', () => {
    describe('change org dropdown', () => {
      before(() => {
        makeQuartzUseIDPEOrgID(idpeOrgID)
        cy.visit('/')
      })

      it('navigates to the org settings page', () => {
        makeQuartzUseIDPEOrgID(idpeOrgID)
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
        makeQuartzUseIDPEOrgID(idpeOrgID)
        cy.getByTestID('globalheader--org-dropdown')
          .should('be.visible')
          .click()
        cy.getByTestID('globalheader--org-dropdown-main').should('be.visible')
        cy.getByTestID('globalheader--org-dropdown-main-Members')
          .should('be.visible')
          .click()

        cy.location('pathname').should('eq', `/orgs/${idpeOrgID}/members`)
        cy.getByTestID('user-list-invite--form-heading')
          .should('be.visible')
          .and('contain', 'Add members to')
      })

      it('navigates to the org usage page', () => {
        makeQuartzUseIDPEOrgID(idpeOrgID)

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
        makeQuartzUseIDPEOrgID(idpeOrgID)
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
        makeQuartzUseIDPEOrgID(idpeOrgID)
      })

      before(() => {
        makeQuartzUseIDPEOrgID(idpeOrgID)
        cy.visit('/')
      })

      it('navigates to the account settings page', () => {
        makeQuartzUseIDPEOrgID(idpeOrgID)
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
        makeQuartzUseIDPEOrgID(idpeOrgID)
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
        makeQuartzUseIDPEOrgID(idpeOrgID)
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

  describe('cardinality alerts', () => {
    const setupCardinalityTest = () => {
      cy.intercept('GET', 'api/v2private/orgs/**/limits/status', req => {
        req.continue(res => {
          res.body.cardinality.status = 'exceeded'
        })
      })
      makeQuartzUseIDPEOrgID(idpeOrgID, 'pay_as_you_go')
      // Alert will appear in global header on any page (like data explorer)
      // that has <LimitChecker />, which displays cardinality alerts.
      cy.visit(`/orgs/${idpeOrgID}/data-explorer`)
      cy.switchToDataExplorer('old')
    }

    it('shows a cardinality limit alert for TSM orgs if cardinality limits are exceeded', () => {
      cy.skipOn(orgIsIOx())
      setupCardinalityTest()

      cy.getByTestID('rate-alert--banner')
        .should('be.visible')
        .within(() => {
          cy.contains('series cardinality').should('be.visible')
          cy.contains('your data stopped writing.').should('be.visible')
        })
    })

    it('never shows a cardinality limit alert for IOx orgs', () => {
      cy.skipOn(!orgIsIOx())
      setupCardinalityTest()

      cy.getByTestID('rate-alert--banner').should('not.exist')
      cy.contains('series cardinality').should('not.exist')
      cy.contains('your data stopped writing.').should('not.exist')
    })
  })

  describe('user profile avatar', () => {
    before(() => {
      makeQuartzUseIDPEOrgID(idpeOrgID)
      cy.visit('/')
    })

    it('navigates to the `user profile` page', () => {
      makeQuartzUseIDPEOrgID(idpeOrgID)
      cy.getByTestID('global-header--user-avatar').should('be.visible').click()

      cy.getByTestID('global-header--user-popover-profile-button')
        .should('be.visible')
        .click()

      cy.getByTestID('user-profile--page').should('be.visible')

      cy.getByTestID('global-header--user-avatar').should('be.visible').click()
    })

    it('allows the user to log out', () => {
      makeQuartzUseIDPEOrgID(idpeOrgID)
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
