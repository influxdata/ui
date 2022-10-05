import {Organization} from '../../../../src/types'

const resetInputs = () => {
  cy.getByTestID('notifyEmail--input').clear().should('have.value', '')
  cy.getByTestID('balanceThreshold--input').clear().should('have.value', '')
  cy.getByTestID('city--input').clear().should('have.value', '')
  cy.getByTestID('postalCode--input').clear().should('have.value', '')
  cy.getByTestID('street1--input').clear().should('have.value', '')
  cy.getByTestID('street2--input').clear().should('have.value', '')
}

describe('Checkout Page Works', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(() => {
          cy.getByTestID('home-page--header').should('be.visible')
          cy.quartzProvision({
            accountType: 'free',
          }).then(() => {
            cy.visit(`/checkout`)
            cy.getByTestID('checkout-page--header').should('be.visible')
          })
        })
      })
    )
  )

  it('should render the checkout page and allow for pointing and clicking', () => {
    cy.setFeatureFlagsNoNav({
      multiOrg: true,
    }).then(() => {
      const email = 'asalem@influxdata.com'
      const limit = 10
      const numberError = 'Please enter a value of 1 or greater'
      const genericError = 'This is a required field'

      cy.getByTestID('shouldNotify--checkbox--input').should('be.checked')

      resetInputs()

      // Click Upgrade
      cy.getByTestID('checkout-upgrade--button').click()

      // Check all errors are visible
      cy.getByTestID('balanceThreshold--input').scrollIntoView()
      cy.getByTestID('balanceThreshold--form-element-error').should(
        'be.visible'
      )
      cy.getByTestID('balanceThreshold--form-element-error').contains(
        genericError
      )
      cy.getByTestID('notifyEmail--form-element-error').should('be.visible')
      cy.getByTestID('notifyEmail--form-element-error').contains(genericError)

      // Check balance threshold specific error should exist
      cy.getByTestID('balanceThreshold--input').clear().type('0')
      cy.getByTestID('balanceThreshold--form-element-error').contains(
        numberError
      )

      cy.getByTestID('notifyEmail--input').clear().type(email)
      cy.getByTestID('balanceThreshold--input').clear().type(`${limit}`)

      // Check all errors are gone
      cy.getByTestID('balanceThreshold--form-element-error').should('not.exist')
      cy.getByTestID('notifyEmail--form-element-error').should('not.exist')

      // Uncheck Checkbox
      cy.getByTestID('shouldNotify--checkbox').click()
      cy.getByTestID('shouldNotify--checkbox--input').should('not.be.checked')

      // Email and limit should still be present after toggling the notifications checkbox
      cy.getByTestID('shouldNotify--checkbox').click()
      cy.getByTestID('shouldNotify--checkbox--input').should('be.checked')
      cy.getByTestID('notifyEmail--input').should('have.value', email)
      cy.getByTestID('balanceThreshold--input').should('have.value', limit)

      // should render US Billing Address
      const error = 'This is a required field'

      // Check defaults
      resetInputs()
      cy.getByTestID('country--dropdown')
        .get('.cf-dropdown--selected')
        .contains('United States')
      cy.getByTestID('usSubdivision--dropdown')
        .get('.cf-dropdown--selected')
        .contains('Alabama')

      cy.getByTestID('checkout-upgrade--button').click()

      cy.getByTestID('city--form-element-error').should('be.visible')
      cy.getByTestID('city--form-element-error').contains(error)
      cy.getByTestID('postalCode--form-element-error').should('be.visible')
      cy.getByTestID('postalCode--form-element-error').contains(error)

      cy.getByTestID('city--input').type('Blacksburg')
      cy.getByTestID('postalCode--input').type('24060')
      cy.getByTestID('street1--input').type('Street1 Address')
      cy.getByTestID('street2--input').type('Street2 Address')

      cy.getByTestID('city--form-element-error').should('not.exist')
      cy.getByTestID('postalCode--form-element-error').should('not.exist')

      const cases = [
        {country: 'Canada', state: 'Province'},
        {country: 'India', state: 'State / Province / Region'},
      ]
      cases.forEach(item => {
        const city = 'TestCity'
        const error = 'This is a required field'

        resetInputs()
        cy.getByTestID('country--dropdown')
          .click()
          .getByTestID('dropdown-item')
          .contains(item.country)
          .then(i => {
            i[0].click()
          })

        // Validate correct country is currently selected
        cy.getByTestID('country--dropdown')
          .get('.cf-dropdown--selected')
          .contains(item.country)

        // Check US State equivalent
        cy.getByTestID('intlSubdivision--form-element')
          .get('.cf-form--label-text')
          .contains(item.state)
        cy.getByTestID('intlSubdivision--input')
          .should('be.visible')
          .should('have.value', '')

        // Click Upgrade Button
        cy.getByTestID('checkout-upgrade--button').click()

        // Check required fields show error
        cy.getByTestID('city--form-element-error').should('be.visible')
        cy.getByTestID('city--form-element-error').contains(error)

        cy.getByTestID('city--input').type(city).should('have.value', city)

        // Click Upgrade Button
        cy.getByTestID('checkout-upgrade--button').click()

        // Check no errors are visible for billing address form
        cy.getByTestID('city--form-element-error').should('not.exist')
      })

      // Click Cancel Button
      cy.getByTestID('checkout-cancel--button').click()

      cy.get('@org').then((org: Organization) => {
        cy.location().should(loc => {
          expect(loc.pathname).to.include(`/orgs/${org.id}`)
        })
      })
    })
  })
})
