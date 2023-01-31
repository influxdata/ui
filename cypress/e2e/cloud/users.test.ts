import {Organization} from '../../../src/types'

describe('Users Page', () => {
  beforeEach(() => {
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(({id}: Organization) => {
          cy.quartzProvision({
            hasUsers: true,
          }).then(() => {
            cy.visit(`/orgs/${id}/members`)
            cy.getByTestID('users-page--header').should('be.visible')
          })
        })
      })
    )
  })

  it('can CRUD Invites and Users', () => {
    const email = 'plerps@influxdata.com'
    cy.log('creating an invite')
    cy.getByTestID('email--input').type(email)
    cy.getByTestID('user-list-invite--button').click()

    cy.getByTestID('notification-success--dismiss').click()

    cy.getByTestID(`invite-list-item ${email}`).should('contain', email)
    cy.getByTestID(`invite-list-item ${email}`).within(() => {
      cy.contains('owner', {matchCase: false})
      cy.contains('expiration', {matchCase: false})
    })

    cy.getByTestIDSubStr('invite-list-item').should('have.length', 1)

    cy.log('resending an invite')
    cy.getByTestID(`invite-list-item ${email}`).within(() => {
      cy.getByTestID('invite-row-context').trigger('mouseover')
      // TODO figure out how to have cypress handle hover events
      // cy.getByTestID('resend-invite').should('be.visible')
      cy.getByTestID('resend-invite').click()
    })

    cy.getByTestID('notification-success--dismiss').click()

    cy.log('withdrawing an invite')
    cy.getByTestID(`invite-list-item ${email}`).within(() => {
      cy.getByTestID('invite-row-context').trigger('mouseover')
      // TODO figure out how to have cypress handle hover events
      // cy.getByTestID('withdraw-invite--button').should('be.visible')
      cy.getByTestID('withdraw-invite--button').click()
    })

    cy.getByTestID('withdraw-invite--confirm-button').should('be.visible')
    cy.getByTestID('withdraw-invite--confirm-button').click()

    cy.getByTestID('notification-success--dismiss').click()

    cy.getByTestIDSubStr('invite-list-item').should('not.exist')
    cy.getByTestIDSubStr('user-list-item').should('have.length', 2)

    cy.getByTestID(`user-list-item user@influxdata.com`).within(() => {
      // This won't be deemed visible due to Cypress's (lack of) hover handling.
      // Just check for existence. https://docs.cypress.io/api/commands/hover
      cy.getByTestID('delete-user--button').should('exist').click()
    })

    cy.getByTestID('remove-member-overlay--container').within(() => {
      cy.getByTestID('dropdown--button').should('be.visible').click()
      cy.getByTestID('dropdown-menu')
        .should('be.visible')
        .and('contain', 'josh@influxdata.com')
        .click()
      cy.getByTestID('remove-member-form--submit').should('be.visible').click()
    })

    cy.getByTestID('notification-success--dismiss').should('be.visible').click()

    cy.getByTestIDSubStr('user-list-item').should('have.length', 1)
  })
})
