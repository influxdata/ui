import {Organization} from '../../../src/types'

describe('Billing Page Free Users', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(({id}: Organization) => {
          cy.setFeatureFlags({
            uiUnificationFlag: true,
          }).then(() => {
            cy.quartzProvision({
              accountType: 'free',
            }).then(() => {
              cy.visit(`/orgs/${id}/billing`)
              cy.getByTestID('billing-page--header').should('be.visible')
            })
          })
        })
      })
    )
  )

  it('should display the free billing page for free users', () => {
    cy.getByTestID('cloud-upgrade--button').should('be.visible')
    cy.getByTestID('title-header--name')
      .should('not.have.value', 'blockedNotificationRules')
      .and('not.have.value', 'blockedNotificationEndpoints')
      .and('have.length', 9)

    const categoryHeaders = [
      'Max Dashboards',
      'Max Tasks',
      'Max Buckets',
      'Max Retention Seconds',
      'Max Checks',
      'Max Notifications',
      'Reads',
      'Writes',
      'Series Cardinality',
    ]

    cy.getByTestID('title-header--name').each((child, index) => {
      expect(child.text().trim()).to.equal(categoryHeaders[index])
    })

    cy.getByTestID('payg-grid--container').scrollIntoView()
    cy.getByTestID('payg-button--upgrade')
      .should('be.visible')
      .click()

    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/checkout')
    })
  })
})

describe('Billing Page PAYG Users', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(({id}: Organization) => {
          cy.setFeatureFlags({
            uiUnificationFlag: true,
          }).then(() => {
            cy.quartzProvision({
              accountType: 'pay_as_you_go',
            }).then(() => {
              cy.visit(`/orgs/${id}/billing`)
              cy.getByTestID('billing-page--header').should('be.visible')

              // note:  when the 'multiAccount' feature flag is on/removed (so always on)
              // remove the above line, replace with:

              // cy.getByTestID('accounts-billing-tab').should('be.visible')
              //
              // cy.getByTestID('accounts-billing-tab').should(
              //     'have.class',
              //     'cf-tabs--tab__active'
              // )
            })
          })
        })
      })
    )
  )

  it('should display the free billing page for free users', () => {
    // The implication here is that there is no Upgrade Now button
    cy.get('.cf-page-header--fixed')
      .children()
      .should('have.length', 1)

    // PAYG section
    cy.getByTestID('payg-plan--header').contains('Pay As You Go')
    cy.getByTestID('payg-plan--region-header').contains('Region')
    cy.getByTestID('payg-plan--region-body').contains('aws')

    cy.getByTestID('payg-plan--balance-header').contains('Account Balance')
    cy.getByTestID('payg-plan--balance-body').contains('10.00')

    cy.getByTestID('payg-plan--updated-header').contains('Last Update')
    cy.getByTestID('payg-plan--updated-body').contains(
      `${new Date().toLocaleString('default', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })}`
    )

    // Invoices Section
    cy.getByTestID('past-invoices--header').contains('Past Invoices')
    cy.getByTestID('invoice-history--row').should('have.length', 2)

    cy.getByTestID('invoice-history--name')
      .last()
      .contains('December 2020 Invoice')
    cy.getByTestID('invoice-history--amount')
      .last()
      .contains('$100.00')
    cy.getByTestID('invoice-history--status')
      .last()
      .contains('unpaid')

    // Sort by date
    cy.getByTestID('invoice-date--sorter')
      .contains('Invoice Date')
      .click()

    // Should now be the first item
    cy.getByTestID('invoice-history--name')
      .first()
      .contains('December 2020 Invoice')

    // Sort by amount
    cy.getByTestID('invoice-amount--sorter')
      .contains('Amount')
      .click()

    cy.getByTestID('invoice-history--amount')
      .first()
      .contains('$10.00')

    cy.getByTestID('invoice-status--sorter')
      .contains('Status')
      .click()

    cy.getByTestID('invoice-history--status')
      .first()
      .contains('paid')

    // Payment Method Section
    cy.getByTestID('payment-method--header').contains('Payment Method')
    cy.getByTestID('payment-display').contains(
      'Your current payment card is visa 4242 4242 4242 4242 — Expiring 04/24'
    )
    cy.getByTestID('edit-payment--button').click()
    // TODO: render the zuora form somehow
    cy.getByTestID('payment-form').should('exist')

    cy.getByTestID('cancel-change--button').click()
    cy.getByTestID('payment-form').should('not.exist')

    // Contact Information Section
    cy.getByTestID('billing-contact--header').contains('Contact Information')
    cy.getByTestID('form-label--First Name').contains('First Name')
    cy.getByTestID('contact-info--Test').contains('Test')
    cy.getByTestID('form-label--Last Name').contains('Last Name')
    cy.getByTestID('contact-info--PAYG').contains('PAYG')
    cy.getByTestID('form-label--Company Name').contains('Company Name')
    cy.getByTestID('contact-info--InfluxData').contains('InfluxData')
    cy.getByTestID('form-label--Country').contains('Country')
    cy.getByTestID('contact-info--USA').contains('USA')
    cy.getByTestID('form-label--Physical Address').contains('Physical Address')
    cy.getByTestID('contact-info--123 Main St, Apt 2').contains(
      '123 Main St, Apt 2'
    )
    cy.getByTestID('form-label--City').contains('City')
    cy.getByTestID('contact-info--Los Angeles').contains('Los Angeles')
    cy.getByTestID('form-label--State (Subdivision)').contains(
      'State (Subdivision)'
    )
    cy.getByTestID('contact-info--California').contains('California')
    cy.getByTestID('form-label--Postal Code').contains('Postal Code')
    cy.getByTestID('contact-info--90001').contains('90001')

    // Click the edit information button
    cy.getByTestID('edit-contact--button')
      .contains('Edit Information')
      .click()
    cy.getByTestID('form-input--firstname')
      .clear()
      .type('Salt')
    cy.getByTestID('form-input--lastname')
      .clear()
      .type('Bae')
    cy.getByTestID('save-contact--button').click()

    // Validate that the first and last name are updated
    cy.getByTestID('contact-info--Salt')
      .contains('Salt')
      .and('not.be', 'Test')
    cy.getByTestID('contact-info--Bae')
      .contains('Bae')
      .and('not.be', 'PAYG')

    // Notification Settings Section
    cy.getByTestID('notification-settings--header').contains(
      'Notification Settings'
    )
    cy.getByTestID('billing-settings--text').contains('test@influxdata.com')
    cy.getByTestID('billing-settings--text').contains('$11')
    cy.getByTestID('notification-settings--button').click()

    // Toggle the settings off
    cy.getByTestID('should-notify--toggle').click()
    cy.getByTestID('save-settings--button').click()
    cy.getByTestID('billing-settings--text').contains(
      'Usage Notifications disabled'
    )

    // Notification Settings Section
    cy.getByTestID('cancel-service--header').contains('Cancel Service')
    cy.getByTestID('cancel-service--button').click()
    cy.getByTestID('cancel-overlay--alert').contains(
      'This action cannot be undone'
    )
    // check that the button is disabled
    cy.getByTestID('cancel-service-confirmation--button').should('be.disabled')
    cy.getByTestID('agree-terms--checkbox').should('not.be.checked')

    cy.getByTestID('agree-terms--input').click()
    cy.getByTestID('agree-terms--checkbox').should('be.checked')
    cy.getByTestID('cancel-service-confirmation--button')
      .should('not.be.disabled')
      .click()

    // TLDR; we double confirm here, this is by design. The overlay changes to reflect a new state so this isn't an error in the test
    cy.getByTestID('cancel-service-confirmation--button').click()
  })
})
