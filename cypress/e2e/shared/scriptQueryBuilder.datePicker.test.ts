// There are many different versions of date picker in UI.
// This file covers the test for src/shared/components/dateRangePicker/NewDatePicker.tsx

describe('Date Picker', () => {
  before(() =>
    cy.flush().then(() =>
      cy.signin().then(() => {
        // TODO(chunchun): write data?
      })
    )
  )

  beforeEach(() => {
    cy.scriptsLoginWithFlags({
      schemaComposition: true,
    }).then(() => {
      cy.clearSqlScriptSession()
      cy.getByTestID('editor-sync--toggle').should('be.enabled')
      // TODO(chunchun): assert toggle is active
    })
  })

  it('can select a duration', () => {
    cy.getByTestID('date-picker--menu').should('not.exist')
    cy.getByTestID('timerange-dropdown--button').should('be.visible').click()

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

  it('can set a duration', () => {
    const validDuration = '-1h'
    cy.getByTestID('timerange-dropdown--button').should('be.visible').click()

    cy.log('error on empty start date')
    cy.getByTestID('date-picker--input--from').clear()
    cy.getByTestID('date-picker--input--from--error').should('exist')

    cy.log('should error when invalid durations are input')
    cy.getByTestID('date-picker--input--from').type('invalid')
    cy.getByTestID('date-picker--input--from--error').should('exist')

    cy.log('valid duration removes the error')
    cy.getByTestID('date-picker--input--from').clear().type(validDuration)
    cy.getByTestID('date-picker--input--from--error').should('not.exist')
    cy.getByTestID('daterange--apply-btn').should('be.enabled').click()

    cy.getByTestID('timerange-dropdown--button')
      .should('be.visible')
      .contains(validDuration)
  })

  it.only('can set a custom time', () => {
    const startTime = '2023-02-08 00:00'
    const sqlTimestampRegex = "time >= timestamp '2023-02-08T00:00:00.000Z'"

    cy.getByTestID('timerange-dropdown--button').should('be.visible').click()

    cy.log('check calendar is available')
    cy.getByTestID('date-picker--calendar-icon').should('be.visible').click()
    cy.getByTestID('date-picker__select-date-picker').should('be.visible')
    cy.getByTestID('date-picker--calendar-icon').should('be.visible').click()
    cy.getByTestID('date-picker__select-date-picker').should('not.exist')

    cy.log('input form should error for incomplete start times')
    cy.getByTestID('date-picker--input--from').clear().type('2023-10')
    cy.getByTestID('date-picker--input--from--error').should('exist')

    cy.log('button should be disabled')
    cy.getByTestID('daterange--apply-btn').should('be.disabled')

    cy.log('valid input removes the error')
    cy.getByTestID('date-picker--input--from').clear().type(startTime)
    cy.getByTestID('date-picker--input--from--error').should('not.exist')

    cy.log(
      'dropdown button should display the custome time regardless of timezone'
    )
    // Local time
    cy.getByTestID('timezone-dropdown').should('be.visible').click()
    cy.getByTestID('dropdown-item')
      .should('be.visible')
      .contains('Local')
      .click()
    cy.getByTestID('daterange--apply-btn').should('be.enabled').click()
    cy.getByTestID('timerange-dropdown--button')
      .should('be.visible')
      .contains(startTime)
    cy.log(
      'SQL composition should use standard UTC timestamp regardless of timezone'
    )
    // cy.getByTestID('sql-editor').within(() => {
    //   cy.get('textarea.inputarea').should(
    //     'contain',
    //     new RegExp(sqlTimestampRegex, 'g')
    //   )
    // })
    // UTC time
    cy.getByTestID('timerange-dropdown--button').should('be.visible').click()
    cy.getByTestID('timezone-dropdown').should('be.visible').click()
    cy.getByTestID('dropdown-item').should('be.visible').contains('UTC').click()
    cy.getByTestID('date-picker--input--from').clear().type(startTime)
    cy.getByTestID('daterange--apply-btn').should('be.enabled').click()
    cy.getByTestID('timerange-dropdown--button')
      .should('be.visible')
      .contains(startTime)
    // cy.getByTestID('sql-editor').within(() => {
    //   cy.get('textarea.inputarea').should(
    //     'contain',
    //     new RegExp(sqlTimestampRegex, 'g')
    //   )
    // })
    cy.getByTestID('date-picker--menu').should('not.exist')

    cy.log(
      'flux query variables should set to standard UTC time to the backend regardless of timezone'
    )
  })
})
