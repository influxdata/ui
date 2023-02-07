import {Organization} from '../../../src/types'

describe('Data Explorer Time Range', () => {
  beforeEach(() => {
    cy.flush().then(() =>
      cy.signin().then(() =>
        cy
          .setFeatureFlags({
            showOldDataExplorerInNewIOx: true,
          })
          .then(() =>
            cy.get('@org').then(({id}: Organization) => {
              cy.fixture('routes').then(({orgs}) => {
                cy.visit(`${orgs}/${id}/data-explorer`)
                cy.getByTestID('tree-nav').should('be.visible')
              })
            })
          )
      )
    )
  })

  describe('select time range to query', () => {
    it('can set a custom time range and restricts start & stop selections relative to start & stop dates', () => {
      // find initial value
      cy.getByTestID('timerange-dropdown--label')
        .should('be.visible')
        .contains('Past 1h')
        .should('have.length', 1)
      cy.getByTestID('timerange-popover--dialog').should('not.exist')
      cy.getByTestID('timerange-dropdown').click()

      cy.getByTestID('dropdown-item-past15m').click()
      cy.getByTestID('timerange-dropdown--label')
        .should('be.visible')
        .contains('Past 15m')
        .should('have.length', 1)

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

      cy.getByTestID('timerange-dropdown').click()
      cy.getByTestID('dropdown-item-customtimerange').click()
    })

    describe('should allow for custom time range selection', () => {
      beforeEach(() => {
        cy.getByTestID('timerange-dropdown').click()
        cy.getByTestID('dropdown-item-customtimerange').click()
        cy.getByTestID('timerange-popover--dialog').should('have.length', 1)
      })

      it('should error when submitting stop dates that are before start dates and should error when invalid dates are input', () => {
        cy.get('input[title="Start"]')
          .should('have.length', 1)
          .clear()
          .type('2019-10-31')

        cy.get('input[title="Stop"]')
          .should('have.length', 1)
          .clear()
          .type('2019-10-29')

        // button should be disabled
        cy.getByTestID('daterange--apply-btn').should('be.disabled')

        // default inputs should be valid
        cy.getByTestID('input-error').should('not.exist')

        // type incomplete input
        cy.get('input[title="Start"]').clear().type('2019-10')

        // invalid date errors
        cy.getByTestID('form--element-error').should('exist')

        // modifies the input to be valid
        cy.get('input[title="Start"]').type('-01')

        // warnings should not appear
        cy.getByTestID('input-error').should('not.exist')

        // type invalid stop date
        cy.get('input[title="Stop"]').clear().type('2019-10-')

        // invalid date errors
        cy.getByTestID('form--element-error').should('exist')

        // button should be disabled
        cy.getByTestID('daterange--apply-btn').should('be.disabled')

        // Validate that ISO String formatted texts are valid
        cy.get('input[title="Stop"]').clear().type('2019-10-29T08:00:00.000Z')

        // button should not be disabled
        cy.getByTestID('daterange--apply-btn').should('not.be.disabled')
      })
    })
  })
})
