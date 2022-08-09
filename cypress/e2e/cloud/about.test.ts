import {Organization} from '../../../src/types'

// resolve flakey behavior for the feature flag setting
describe.skip('About Page for free users with only 1 user', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(({id}: Organization) => {
          cy.quartzProvision({
            accountType: 'free',
            hasUsers: false,
          }).then(() => {
            cy.visit(`/orgs/${id}/about`)
            cy.getByTestID('about-page--header').should('be.visible')
          })
        })
      })
    )
  )

  it('should allow the delete account functionality', () => {
    cy.getByTestID('delete-org--button')
      .should('exist')
      .click()

    cy.getByTestID('notification-warning').should('not.exist')

    cy.location()
      .should(loc => {
        expect(loc.pathname).to.include(`/about/delete`)
      })
      .then(() => {
        cy.getByTestID('delete-org--overlay').should('exist')

        cy.getByTestID('delete-organization--button').should('be.disabled')

        cy.getByTestID('agree-terms--input').click()
        cy.getByTestID('agree-terms--checkbox').should('be.checked')
        cy.getByTestID('delete-organization--button')
          .should('not.be.disabled')
          .click()

        cy.location().should(loc => {
          expect(loc.href).to.eq(`https://www.influxdata.com/free_cancel/`)
        })
      })
  })
})

describe('About Page for free users with multiple users', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(({id}: Organization) => {
          cy.quartzProvision({
            accountType: 'free',
            hasUsers: true,
          }).then(() => {
            cy.visit(`/orgs/${id}/about`)
            cy.getByTestID('about-page--header').should('be.visible')
          })
        })
      })
    )
  )
  it('should display the warning and allow users to navigate to the users page when trying to delete when the user has multiple users', () => {
    cy.getByTestID('delete-org--button')
      .should('exist')
      .click()

    cy.getByTestID('notification-warning')
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
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(({id}: Organization) => {
          cy.quartzProvision({
            accountType: 'pay_as_you_go',
          }).then(() => {
            cy.visit(`/orgs/${id}/about`)
            cy.getByTestID('about-page--header').should('be.visible')
          })
        })
      })
    )
  )

  it('should not display the delete button', () => {
    cy.getByTestID('delete-org--button').should('not.exist')
  })
})
