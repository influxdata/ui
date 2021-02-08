import {Organization} from '../../../src/types'

describe('Usage Page', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.window().then(w => {
          w.influx.set('unity-usage', true)
        })

        cy.visit(`/orgs/${id}/unity-usage`)
      })
    })

    cy.getByTestID('usage-page--header').should('be.visible')
  })

  it('should display the usage page', () => {
    cy.getByTestID('cloud-upgrade--button').should('be.visible')

    // Billing Stat Single Stats based on pricing version 4
    cy.getByTestID('billing-stats--graphs').within(() => {
      cy.getByTestID('graph-type--panel').should('have.length', 4)
    })

    cy.getByTestID('usage-header--timerange').contains('Usage Past 1h')
    cy.getByTestID('rate-limits-header--timerange').contains(
      'Rate Limits Past 1h'
    )

    // Checks the daterange picker
    // TODO(ariel): get more data in to see if things change in the results
    cy.get('.cf-dropdown--selected')
      .contains('Past 1')
      .should('have.length', 1)
    cy.getByTestID('timerange-popover--dialog').should('not.exist')
    cy.getByTestID('timerange-dropdown').click()

    cy.getByTestID('dropdown-item-past15m').click()
    cy.get('.cf-dropdown--selected')
      .contains('Past 15m')
      .should('have.length', 1)

    cy.getByTestID('usage-header--timerange').contains('Usage Past 15m')
    cy.getByTestID('rate-limits-header--timerange').contains(
      'Rate Limits Past 15m'
    )

    cy.getByTestID('timerange-dropdown').click()

    cy.getByTestID('timerange-popover--dialog').should('not.exist')

    cy.getByTestID('dropdown-item-customtimerange').click()
    cy.getByTestID('timerange-popover--dialog').should('have.length', 1)

    cy.getByTestID('timerange--input')
      .first()
      .clear()
      .type('2019-10-29 08:00:00.000')

    // Set the stop date to Oct 29, 2019
    cy.getByTestID('timerange--input')
      .last()
      .clear()
      .type('2019-10-29 09:00:00.000')

    // click button and see if time range has been selected
    cy.getByTestID('daterange--apply-btn').click()

    cy.getByTestID('usage-header--timerange').contains(
      'Usage from 2019-10-29T15:00:00.000Z to 2019-10-29T16:00:00.000Z'
    )
    cy.getByTestID('rate-limits-header--timerange').contains(
      'Rate Limits from 2019-10-29T15:00:00.000Z to 2019-10-29T16:00:00.000Z'
    )

    // This is based on stubbed out data
    cy.getByTestID('usage-page--dropdown')
      .contains('Data In (MB)')
      .click()
    cy.getByTestID('dropdown-item')
      .should('have.length', 4)
      .last()
      .contains('Data Out (GB)')
      .click()

    cy.getByTestID('usage-page--dropdown').contains('Data Out (GB)')
  })
})
