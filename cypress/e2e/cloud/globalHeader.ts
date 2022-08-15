describe('multi-account multi-org global header', () => {
  const globalHeaderFeatureFlags = {
    quartzIdentity: true,
    multiOrg: true,
  }

  beforeEach(() => {
    // Maintain the same session for all tests so that further logins aren't required.
    Cypress.Cookies.preserveOnce('sid')
  })

  before(() => {
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(() => {
          cy.getByTestID('home-page--header').should('be.visible')
          cy.setFeatureFlags(globalHeaderFeatureFlags).then(() => {
            // cy.wait is necessary to ensure sufficient time for the feature flag override.
            // We cannot cy.wait an intercepted route because this isn't a network request.
            cy.wait(400).then(() => {
              cy.visit('/')
            })
          })
        })
      })
    )
  })

  describe('user profile avatar', () => {
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
