import {Organization} from '../../../src/types'

describe('About Page for free users with only 1 user', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.setFeatureFlags({unityUsers: true, selfDeletion: true}).then(() => {
          cy.quartzProvision({
            accountType: 'free',
            hasUsers: false,
          }).then(() => {
            cy.visit(`/orgs/${id}/about`)
            cy.getByTestID('about-page--header').should('be.visible')
          })
        })
      })
    })
  })

  it('should allow the delete account functionality', () => {
    cy.intercept('DELETE', '/api/v2/quartz/account', {
      status: 204,
      data: 'ok',
    }).as('deleteAccount')
    cy.getByTestID('delete-org--button')
      .should('exist')
      .click()
    cy.getByTestID('Warning').should('not.exist')
    cy.getByTestID('delete-org--overlay').should('exist')

    cy.getByTestID('delete-org--button').should('be.disabled')

    cy.getByTestID('agree-terms--input').click()
    cy.getByTestID('agree-terms--checkbox').should('be.checked')
    cy.getByTestID('delete-org--button')
      .should('not.be.disabled')
      .click()

    cy.wait('@deleteAccount')
  })
})

describe('About Page for free users with multiple users', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.setFeatureFlags({unityUsers: true, selfDeletion: true}).then(() => {
          cy.quartzProvision({
            accountType: 'free',
            hasUsers: true,
          }).then(() => {
            cy.visit(`/orgs/${id}/about`)
            cy.getByTestID('about-page--header').should('be.visible')
          })
        })
      })
    })
  })

  it('should display the warning and allow users to navigate to the users page when trying to delete when the user has multiple users', () => {
    cy.getByTestID('delete-org--button')
      .should('exist')
      .click()
    cy.getByTestID('Warning')
      .should('exist')
      .within(() => {
        cy.getByTestID('go-to-users--link').click()
      })

    cy.location().should(loc => {
      expect(loc.pathname).to.include(`/users`)
    })
  })
})

describe('About Page for PAYG users', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.setFeatureFlags({unityUsers: true, selfDeletion: true}).then(() => {
          cy.quartzProvision({
            accountType: 'pay_as_you_go',
          }).then(() => {
            cy.visit(`/orgs/${id}/about`)
            cy.getByTestID('about-page--header').should('be.visible')
          })
        })
      })
    })
  })

  it('should not display the delete button', () => {
    cy.getByTestID('delete-org--button').should('not.exist')
  })
})
