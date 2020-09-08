describe('The Login Page', () => {
  beforeEach(() => {
    cy.flush()

    cy.setupUser().then(({body}) => {
      cy.wrap(body.org.id).as('orgID')
    })

    cy.visit('/')
  })

  // NOTE: we aren't currently loading the login page
  // for dex
  it.skip('can login and logout', () => {
    cy.get('#username').type(Cypress.env('username'))
    cy.get('#password').type(Cypress.env('password'))
    cy.get('#submit-login').click()

    cy.getByTestID('tree-nav').should('exist')

    cy.getByTestID('logout--button').click()

    cy.getByTestID('signin-page--content').should('exist')

    // try to access a protected route
    cy.get<string>('@orgID').then(orgID => {
      cy.visit(`/orgs/${orgID}`)
    })

    // assert that user is routed to signin
    cy.getByTestID('signin-page--content').should('exist')
  })

  // NOTE: we aren't currently loading the login page
  // for dex
  describe.skip('login failure', () => {
    it('if username is not present', () => {
      cy.get('#password').type(Cypress.env('password'))
      cy.get('#submit-login').click()

      cy.getByTestID('notification-error').should('exist')
    })

    it('if password is not present', () => {
      cy.get('#username').type(Cypress.env('username'))
      cy.get('#submit-login').click()

      cy.getByTestID('notification-error').should('exist')
    })

    it('if username is incorrect', () => {
      cy.getByInputName('username').type('not-a-user')
      cy.getByInputName('password').type(Cypress.env('password'))
      cy.get('button[type=submit]').click()

      cy.getByTestID('notification-error').should('exist')
    })

    it('if password is incorrect', () => {
      cy.getByInputName('username').type(Cypress.env('username'))
      cy.getByInputName('password').type('not-a-password')
      cy.get('button[type=submit]').click()

      cy.getByTestID('notification-error').should('exist')
    })
  })
})
