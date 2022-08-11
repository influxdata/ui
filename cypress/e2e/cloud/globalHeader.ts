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
            // cy.wait(400) is necessary to ensure sufficient time for the feature flag override.
            // The feature flag reset happens in redux, (it's not a network request), so we can't cy.wait an intercepted route.
            cy.wait(400).then(() => {
              cy.visit('/')
            })
          })
        })
      })
    )
  })

  describe('user profile avatar', () => {
    it('displays the `user profile` avatar', () => {
      cy.getByTestID('global-header--user-avatar').should('be.visible')
    })

    it('displays the popover links', () => {
      cy.getByTestID('global-header--user-avatar').click()
      cy.getByTestID('global-header--user-popover-profile-button').should(
        'be.visible'
      )

      cy.getByTestID('global-header--user-popover-logout-button').should(
        'be.visible'
      )
      cy.getByTestID('global-header--user-avatar').click()
    })

    it('navigates to the `user profile` page', () => {
      cy.getByTestID('global-header--user-avatar').click()
      cy.getByTestID('global-header--user-popover-profile-button').click()
      cy.getByTestID('user-profile--page').should('be.visible')
    })

    it('allows the user to log out', () => {
      cy.getByTestID('global-header--user-avatar').click()
      cy.getByTestID('global-header--user-popover-logout-button').click()
      // Logout in remocal looks like a 404 because there is no quartz. This tests the logout URL.
      cy.location('pathname').should('eq', '/logout')
    })
  })
})
