import {Organization} from '../../../src/types'

describe('Usage Page', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.setFeatureFlags({unityUsage: true}).then(() => {
          cy.visit(`/orgs/${id}/usage`)
          cy.getByTestID('usage-page--header').should('be.visible')
        })
      })
    })
  })

  it.skip('should display the usage page common features', () => {
    // Display the upgrade button when the user is a free user
    cy.get('.cf-page-header--fixed')
      .children()
      .should('have.length', 2)
    cy.getByTestID('cloud-upgrade--button').should('be.visible')

    cy.getByTestID('billing-stats--graphs').within(() => {
      cy.getByTestID('graph-type--panel').should('have.length', 4)
    })

    cy.getByTestID('usage-header--timerange').contains('Usage Past 24h')
    cy.getByTestID('rate-limits-header--timerange')
      .scrollIntoView()
      .contains('Rate Limits Past 24h')

    // Checks the daterange picker
    cy.getByTestID('usage-timerange--selected').within(() => {
      cy.contains('Past 24h')
    })

    cy.getByTestID('usage-timerange--dropdown').scrollIntoView()
    cy.getByTestID('usage-timerange--dropdown').click()

    // TODO(ariel): something gets busted trying to select the past 7d
    cy.getByTestID('dropdown-item-past7d').click()

    cy.getByTestID('usage-timerange--selected').within(() => {
      cy.contains('Past 7d')
    })

    cy.getByTestID('usage-header--timerange').contains('Usage Past 7d')
    cy.getByTestID('rate-limits-header--timerange')
      .scrollIntoView()
      .contains('Rate Limits Past 7d')

    cy.getByTestID('usage-timerange--selected').within(() => {
      cy.contains('Past 7d')
    })

    cy.getByTestID('usage-timerange--dropdown').click()

    cy.getByTestID('dropdown-item-past30d').click()

    cy.getByTestID('usage-timerange--selected').within(() => {
      cy.contains('Past 30d')
    })

    cy.getByTestID('usage-header--timerange').contains('Usage Past 30d')
    cy.getByTestID('rate-limits-header--timerange')
      .scrollIntoView()
      .contains('Rate Limits Past 30d')

    // This is based on stubbed out data and should be replaced when the API is hooked up
    cy.getByTestID('usage-page--dropdown')
      .contains('Data In')
      .click()
    cy.getByTestID('dropdown-item')
      .should('have.length', 4)
      .last()
      .contains('Data Out')
      .click({force: true})

    cy.getByTestID('usage-page--dropdown').contains('Data Out')
  })
})

describe('Usage Page With Data', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.setFeatureFlags({unityUsage: true}).then(() => {
          cy.quartzProvision({
            hasData: true,
            accountType: 'pay_as_you_go',
          }).then(() => {
            cy.wait(1000)
            cy.visit(`/orgs/${id}/usage`)
            cy.getByTestID('usage-page--header').should('be.visible')
          })
        })
      })
    })
  })

  it.only('should display the usage page with data for a PAYG user', () => {
    // TODO(ariel): fix the provisioning
    cy.get('.cf-page-header--fixed')
      .children()
      .should('have.length', 1)
  })
})
