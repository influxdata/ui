import {Organization} from '../../../src/types'

// There are many different versions of date picker in UI.
// This file covers the test for src/shared/components/dateRangePicker/NewDatePicker.tsx

describe('Date Picker', () => {
  before(() =>
    cy.flush().then(() =>
      cy.signin().then(() =>
        cy.get('@org').then(({orgID}: Organization) => {
          // TODO(chunchun): write data?
        })
      )
    )
  )

  beforeEach(() => {
    cy.scriptsLoginWithFlags({
      schemaComposition: true,
    }).then(() => {
      cy.clearSqlScriptSession()
      cy.getByTestID('editor-sync--toggle').should('be.visible')
      // TODO(chunchun): assert toggle is active
    })
  })

  it.only('should be able to select a duration', () => {
    cy.getByTestID('date-picker--menu').should('not.exist')
    cy.getByTestID('timerange-dropdown--button')
      .should('be.visible')
      .click()

    cy.log('select a duration')
    cy.getByTestID('dropdown-item-past15m').click()
    cy.getByTestID('date-picker--menu').should('not.exist')
    
    cy.log('dropdown button should display the selected duation')
    cy.getByTestID('timerange-dropdown--button')
      .should('be.visible')
      .contains('Past 15m')
      .should('have.length', 1)
      .click()

    cy.log('input field "From" should show the corresponding duration')
    cy.getByTestID('date-picker--input--from')
      .should('be.visible')
      .should('have.value', '-15m')
    
    cy.log('input field "To" should show "now()"')
    cy.getByTestID('date-picker--input--to')
      .should('be.visible')
      .should('have.value', 'now()')
    
    cy.log('SQL composition should add the right expression for time')
  })

  it('shoule be able to set a duration', () => {
    cy.log('error on empty start date')

    cy.log('error on duration expression')

    cy.log('should error when invalud durations are input')
  })

  it('should be able to select or set a custom time', () => {
    cy.log('should be able to select start times and stop times')

    cy.log('should not submitting when stop times are before start times')

    cy.log('should error when invalid times are input')

    cy.log(
      'dropdown button display time should match with the input custome time regardless of timezone'
    )

    cy.log(
      'flux query variables should set to standard UTC time to the backend regardless of timezone'
    )

    cy.log(
      'SQL composition should use standard UTC timestamp regardless of timezone'
    )
  })
})
