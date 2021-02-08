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
    cy.get<string>('@defaultUser').then((defaultUser: string) => {
      cy.get('#username').type(defaultUser)
    })

    cy.get<string>('@defaultPassword').then((defaultPassword: string) => {
      cy.get('#password').type(defaultPassword)
    })

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
      cy.get<string>('@defaultPassword').then((defaultPassword: string) => {
        cy.get('#password').type(defaultPassword)
      })
      cy.get('#submit-login').click()

      cy.getByTestID('notification-error').should('exist')
    })

    it('if password is not present', () => {
      cy.get<string>('@defaultUser').then((defaultUser: string) => {
        cy.get('#username').type(defaultUser)
      })
      cy.get('#submit-login').click()

      cy.getByTestID('notification-error').should('exist')
    })

    it('if username is incorrect', () => {
      cy.getByInputName('username').type('not-a-user')
      cy.get<string>('@defaultPassword').then((defaultPassword: string) => {
        cy.getByInputName('password').type(defaultPassword)
      })
      cy.get('button[type=submit]').click()

      cy.getByTestID('notification-error').should('exist')
    })

    it('if password is incorrect', () => {
      cy.get<string>('@defaultUser').then((defaultUser: string) => {
        cy.getByInputName('username').type(defaultUser)
      })
      cy.getByInputName('password').type('not-a-password')
      cy.get('button[type=submit]').click()

      cy.getByTestID('notification-error').should('exist')
    })
  })
})
