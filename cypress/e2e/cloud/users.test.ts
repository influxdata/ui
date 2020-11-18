import {Organization} from '../../../src/types'
import {users, invites} from '../../../src/unity/api'

describe('Users Page', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.window().then(w => {
          w.influx.set('unity', true)
        })

        cy.visit(`/orgs/${id}/unity-users`)
      })
    })

    cy.getByTestID('users-page--header').should('be.visible')
  })

  it('can CRUD Invites and Users', () => {
    const email = 'plerps@influxdata.com'
    cy.log('creating an invite')
    cy.getByTestID('email--input').type(email)
    cy.getByTestID('user-list-invite--button').click()

    cy.getByTestID('invite-sent-success--dismiss').click()

    cy.getByTestID(`invite-list-item ${email}`).should('contain', email)
    cy.getByTestID(`invite-list-item ${email}`).within(() => {
      cy.contains('owner', {matchCase: false})
      cy.contains('expiration', {matchCase: false})
    })

    cy.getByTestIDSubStr('invite-list-item').should(
      'have.length',
      invites.length + 1
    )

    cy.log('resending an invite')
    cy.getByTestID(`invite-list-item ${email}`).within(() => {
      cy.getByTestID('invite-row-context').trigger('mouseover')
      cy.getByTestID('resend-invite').should('be.visible')
      cy.getByTestID('resend-invite').click()
    })

    cy.getByTestID('invitation-sent').should('be.visible')
    cy.getByTestID('invitation-sent--dismiss').click()

    cy.log('withdrawing an invite')
    cy.getByTestID(`invite-list-item ${email}`).within(() => {
      cy.getByTestID('invite-row-context').trigger('mouseover')
      cy.getByTestID('withdraw-invite--button').should('be.visible')
      cy.getByTestID('withdraw-invite--button').click()
    })

    cy.getByTestID('withdraw-invite--confirm-button').should('be.visible')
    cy.getByTestID('withdraw-invite--confirm-button').click()

    cy.getByTestID('invitation-withdrawn').should('be.visible')
    cy.getByTestID('invitation-withdrawn--dismiss').click()

    cy.getByTestIDSubStr('invite-list-item').should(
      'have.length',
      invites.length
    )

    cy.getByTestID(`user-list-item iris@influxdata.com`).within(() => {
      cy.getByTestID('delete-user--button').trigger('mouseover')
      cy.getByTestID('delete-user--button').should('be.visible')
      cy.getByTestID('delete-user--button').click()
    })

    cy.getByTestID('delete-user--confirm-button').should('be.visible')
    cy.getByTestID('delete-user--confirm-button').click()

    cy.getByTestID('user-removed').should('be.visible')
    cy.getByTestID('user-removed--dismiss').click()

    cy.getByTestIDSubStr('user-list-item').should(
      'have.length',
      users.length - 1
    )
  })
})
