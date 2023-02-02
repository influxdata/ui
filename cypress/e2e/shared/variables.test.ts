import {Organization} from '../../../src/types'

const isIOxOrg = Boolean(Cypress.env('useIox'))
const isTSMOrg = !isIOxOrg

const setupTest = (shouldShowTasks: boolean = true) => {
  cy.flush()
  cy.signin()
  cy.setFeatureFlags({showVariablesInNewIOx: shouldShowTasks})
  cy.get('@org').then(({id}: Organization) => {
    if (isTSMOrg) {
      cy.clickNavBarItem('nav-item-settings')
      cy.getByTestID('variables--tab').should('be.visible').click()
      // Double check that the new schemaComposition flag does not interfere.
      cy.setFeatureFlags({
        schemaComposition: true,
      })
      // cy.wait($time) is necessary to consistently ensure sufficient time for the feature flag override.
      // The flag reset happens via redux, (it's not a network request), so we can't cy.wait($intercepted_route).
      cy.wait(1200)
      cy.location('pathname').should('match', /\/variables$/)
    } else {
      cy.visit(`orgs/${id}/settings/variables`)
    }
  })
}

describe('Variables - TSM', () => {
  beforeEach(() => {
    setupTest()
  })

  it('can CRUD a CSV, upload, map, and query variable and search for variables based on names', () => {
    // Navigate away from and back to variables index using the nav bar
    cy.clickNavBarItem('nav-item-data-explorer')
    cy.clickNavBarItem('nav-item-settings')
    cy.getByTestID('labels--tab').click()
    cy.getByTestID('variables--tab').click()

    cy.getByTestID('resource-card variable').should('have.length', 1)

    // ensure that the default variables are not accessible on the Variables Tab
    cy.getByTestID('resource-card variable').should(
      'not.contain',
      'timeRangeStart'
    )
    cy.getByTestID('resource-card variable').should(
      'not.contain',
      'timeRangeStop'
    )
    cy.getByTestID('resource-card variable').should(
      'not.contain',
      'windowPeriod'
    )

    cy.getByTestID('add-resource-dropdown--button').click()

    cy.getByTestID('add-resource-dropdown--new').click()

    cy.getByTestID('variable-type-dropdown--button').click()
    cy.getByTestID('variable-type-dropdown-constant').click()

    // Create a CSV variable
    const variableName = 'AnotherVariable'
    cy.getByInputName('name').type(variableName)

    cy.get('textarea').type('1,2,3,4,5,6')

    cy.getByTestID('csv-value-select-dropdown').click().contains('6').click()

    cy.get('form').contains('Create').click()

    cy.getByTestID(`variable-card--name ${variableName}`).click()
    cy.getByTestID('notification-success--dismiss').should('exist')
    cy.getByTestID('notification-success--dismiss').click()

    // Change it to a Query variable
    cy.getByTestID('edit-variable--overlay').within(() => {
      cy.getByTestID('variable-type-dropdown--button').click()
      cy.getByTestID('variable-type-dropdown-query').click()

      cy.getByTestID('flux-editor').monacoType(
        'filter(fn: (r) => r._field == "cpu")'
      )
      cy.getByTestID('variable-update-submit--button')
        .contains('Submit')
        .click()
    })

    cy.getByTestID('notification-success--dismiss').should('exist')
    cy.getByTestID('notification-success--dismiss').click()
    cy.getByTestID(`variable-card--name ${variableName}`).click()

    // Change it to a Map variable
    cy.getByTestID('edit-variable--overlay').within(() => {
      cy.getByTestID('variable-type-dropdown--button').click()
      cy.getByTestID('variable-type-dropdown-map').click()

      const lastMapItem = 'Mila Emile,"o61AhpOGr5aO3cYVArC0"'
      cy.get('textarea').type(`Juanito MacNeil,"5TKl6l8i4idg15Fxxe4P"
                  Astrophel Chaudhary,"bDhZbuVj5RV94NcFXZPm"
                  Ochieng Benes,"YIhg6SoMKRUH8FMlHs3V"
                  ${lastMapItem}`)

      cy.getByTestID('map-variable-dropdown--button').click()
      cy.contains(lastMapItem).click()

      cy.getByTestID('variable-update-submit--button')
        .contains('Submit')
        .click()
    })

    cy.getByTestID('notification-success--dismiss').should('exist')
    cy.getByTestID('notification-success--dismiss').click()

    cy.getByTestID('resource-card variable').should('have.length', 2)

    // Search variable by name
    cy.getByTestID('search-widget').type(variableName)

    cy.getByTestID('resource-card variable')
      .should('have.length', 1)
      .contains(variableName)

    // Delete a variable
    cy.getByTestID(`context-delete-variable ${variableName}--button`)
      .first()
      .click()
    cy.getByTestID(`context-delete-variable ${variableName}--confirm-button`)
      .first()
      .click()

    cy.getByTestID('notification-success--dismiss').should('exist')
    cy.getByTestID('notification-success--dismiss').click()

    cy.getByTestID('search-widget').clear()

    cy.getByTestID('resource-card variable')
      .should('have.length', 1)
      .contains('LittleVariable')

    // Rename the variable
    cy.getByTestID('context-menu-variable').last().click({force: true})

    cy.getByTestID('context-rename-variable').click({force: true})

    cy.getByTestID('danger-confirmation--button').click()

    cy.getByInputName('name').type('Renamed')

    cy.getByTestID('rename-variable-submit').click()

    cy.getByTestID('notification-success--dismiss').should('exist')
    cy.getByTestID('notification-success--dismiss').click()

    cy.getByTestID(`variable-card--name LittleVariableRenamed`).contains(
      'Renamed'
    )

    // Create a Map variable from scratch
    cy.getByTestID('add-resource-dropdown--button').click()

    cy.getByTestID('add-resource-dropdown--new').click()

    cy.getByTestID('variable-type-dropdown--button').click()
    cy.getByTestID('variable-type-dropdown-map').click()

    const mapVariableName = 'MapVariable'
    cy.getByInputName('name').type(mapVariableName)

    cy.get('textarea').type(`Astrophel Chaudhary,"bDhZbuVj5RV94NcFXZPm"
                  Ochieng Benes,"YIhg6SoMKRUH8FMlHs3V"`)

    cy.getByTestID('map-variable-dropdown--button').click().last().click()

    cy.get('form').contains('Create').click()

    cy.getByTestID('notification-success--dismiss').should('exist')
    cy.getByTestID('notification-success--dismiss').click()
    cy.getByTestID(`variable-card--name ${mapVariableName}`).should('exist')

    // Create a Query variable from scratch
    cy.getByTestID('add-resource-dropdown--button').click()

    cy.getByTestID('add-resource-dropdown--new').click()

    cy.getByTestID('variable-type-dropdown--button').click()
    cy.getByTestID('variable-type-dropdown-map').click()

    const queryVariableName = 'QueryVariable'
    cy.getByInputName('name').type(queryVariableName)

    cy.getByTestID('variable-type-dropdown--button').click()
    cy.getByTestID('variable-type-dropdown-query').click()

    cy.getByTestID('flux-editor').monacoType(
      'filter(fn: (r) => r._field == "cpu")'
    )

    cy.get('form').contains('Create').click()

    cy.getByTestID('notification-success--dismiss').should('exist')
    cy.getByTestID('notification-success--dismiss').click()
    cy.getByTestID(`variable-card--name ${queryVariableName}`).contains(
      queryVariableName
    )
  })

  it('can prevent variable names with hyphens or spaces from being saved', () => {
    // Prevent creation of a CSV variable with hyphens or spaces
    cy.getByTestID('add-resource-dropdown--button').should('be.visible')
    cy.getByTestID('add-resource-dropdown--button').click()

    cy.getByTestID('add-resource-dropdown--new').should('be.visible')
    cy.getByTestID('add-resource-dropdown--new').click()

    cy.getByTestID('variable-type-dropdown--button').should('be.visible')
    cy.getByTestID('variable-type-dropdown--button').click()

    cy.getByTestID('variable-type-dropdown--button').should('be.visible')
    cy.getByTestID('variable-type-dropdown-constant').click()

    cy.get('textarea').type('1,2,3,4,5,6')

    cy.getByTestID('csv-value-select-dropdown').click().contains('6').click()

    cy.getByInputName('name').type('bad name')
    cy.getByTestID('variable-form-save').should('be.disabled')

    cy.getByInputName('name').clear().type('bad-name')
    cy.getByTestID('variable-form-save').should('be.disabled')

    // Prevent creation of a Query variable with hyphens or spaces
    cy.getByTestID('variable-type-dropdown--button').click()
    cy.getByTestID('variable-type-dropdown-query').click()

    cy.getByTestID('flux-editor').monacoType(
      'filter(fn: (r) => r._field == "cpu")'
    )

    cy.getByInputName('name').clear().type('bad name')
    cy.getByTestID('variable-form-save').should('be.disabled')

    cy.getByInputName('name').clear().type('bad-name')
    cy.getByTestID('variable-form-save').should('be.disabled')

    // Prevent creation of a Map variable with hyphens or spaces
    cy.getByTestID('variable-type-dropdown--button').click()
    cy.getByTestID('variable-type-dropdown-map').click()

    const lastMapItem = 'Mila Emile,"o61AhpOGr5aO3cYVArC0"'
    cy.get('textarea').type(`Juanito MacNeil,"5TKl6l8i4idg15Fxxe4P"
    Astrophel Chaudhary,"bDhZbuVj5RV94NcFXZPm"
    Ochieng Benes,"YIhg6SoMKRUH8FMlHs3V"
    ${lastMapItem}`)

    cy.getByTestID('map-variable-dropdown--button').click()
    cy.contains(lastMapItem).click()

    cy.getByInputName('name').clear().type('bad name')
    cy.getByTestID('variable-form-save').should('be.disabled')

    cy.getByInputName('name').clear().type('bad-name')
    cy.getByTestID('variable-form-save').should('be.disabled')
  })

  it('can create and delete a label and sort by variable name', () => {
    cy.getByTestID('inline-labels--add').should('be.visible')

    // Create a label for the existing variable
    const labelName = 'label'
    cy.getByTestID('inline-labels--add').clickAttached()
    cy.getByTestID('inline-labels--popover--contents').type(labelName)
    cy.getByTestID('inline-labels--create-new').click()

    cy.getByTestID('create-label-form--submit')
      .scrollIntoView()
      .should('be.visible')
    cy.getByTestID('create-label-form--submit').click()

    cy.getByTestID('overlay--children').should('not.exist')

    // Create a CSV variable
    const variableName = 'SecondVariable'
    cy.getByTestID('add-resource-dropdown--button').should('be.visible')
    cy.getByTestID('add-resource-dropdown--button').click()

    cy.getByTestID('add-resource-dropdown--new').should('be.visible')
    cy.getByTestID('add-resource-dropdown--new').click()

    cy.getByTestID('variable-type-dropdown--button').should('be.visible')
    cy.getByTestID('variable-type-dropdown--button').click()

    cy.getByTestID('variable-type-dropdown--button').should('be.visible')
    cy.getByTestID('variable-type-dropdown-constant').click()

    cy.getByInputName('name').type(variableName)

    cy.get('textarea').type('1,2,3,4,5,6')

    cy.getByTestID('csv-value-select-dropdown').click().contains('6').click()

    cy.get('form').contains('Create').click()

    // Delete the label
    cy.getByTestID(`label--pill--delete ${labelName}`).click({force: true})
    cy.getByTestID('resource-card variable').should('have.length', 2)
    cy.getByTestID('search-widget').clear()
    cy.getByTestID('inline-labels--empty').should('exist')

    cy.getByTestID('resource-card variable').last().contains(variableName)

    cy.getByTestID('resource-sorter--button').click()
    cy.getByTestID('resource-sorter--name-desc').click()

    cy.getByTestID('resource-card variable').first().contains(variableName)
  })

  it('can filter by variable or label name', () => {
    const firstVariableName = 'LittleVariable'
    cy.getByTestID('resource-card variable')
      .should('have.length', 1)
      .contains(firstVariableName)

    // Create a Query variable from scratch
    const secondVariableName = 'SecondVariable'
    cy.getByTestID('add-resource-dropdown--button').click()
    cy.getByTestID('add-resource-dropdown--new').click()

    cy.getByTestID('variable-type-dropdown--button').click()
    cy.getByTestID('variable-type-dropdown-query').click()

    cy.getByTestID('flux-editor').monacoType(
      'filter(fn: (r) => r._field == "cpu")'
    )
    cy.getByInputName('name').type(secondVariableName)

    cy.get('form').contains('Create').click()

    // Create a CSV variable
    const thirdVariableName = 'ThirdVariable'
    cy.getByTestID('add-resource-dropdown--button').click()
    cy.getByTestID('add-resource-dropdown--new').click()

    cy.getByTestID('variable-type-dropdown--button').click()
    cy.getByTestID('variable-type-dropdown-constant').click()

    cy.getByInputName('name').type(thirdVariableName)
    cy.get('textarea').type('1,2,3,4,5,6')
    cy.getByTestID('csv-value-select-dropdown').click().contains('6').click()

    cy.get('form').contains('Create').click()

    // Ensure we have three variables and three buttons to add labels
    cy.getByTestID('resource-card variable').should('have.length', 3)
    cy.get('button.inline-labels--add').should('have.length', 3)

    // Create the labels
    const firstLabelName = 'little'
    cy.get('button.inline-labels--add').first().clickAttached()
    cy.getByTestID('inline-labels--popover-field').type(firstLabelName)
    cy.getByTestID('inline-labels--create-new').click()
    cy.getByTestID('create-label-form--submit')
      .scrollIntoView()
      .should('be.visible')
    cy.getByTestID('create-label-form--submit').click()

    const secondLabelName = 'query'
    cy.get('button.inline-labels--add').eq(1).clickAttached()
    cy.getByTestID('inline-labels--popover-field').type(secondLabelName)
    cy.getByTestID('inline-labels--create-new').click()
    cy.getByTestID('create-label-form--submit')
      .scrollIntoView()
      .should('be.visible')
    cy.getByTestID('create-label-form--submit').click()

    const thirdLabelName = 'csv'
    cy.get('button.inline-labels--add').last().clickAttached()
    cy.getByTestID('inline-labels--popover-field').type(thirdLabelName)
    cy.getByTestID('inline-labels--create-new').click()
    cy.getByTestID('create-label-form--submit')
      .scrollIntoView()
      .should('be.visible')
    cy.getByTestID('create-label-form--submit').click()

    // Select ascending order and use filter on variable name
    cy.getByTestID('resource-sorter--button').click()
    cy.getByTestID('resource-sorter--name-asc').click()

    cy.getByTestID('search-widget').type(firstVariableName)
    cy.getByTestID('resource-card variable')
      .should('have.length', 1)
      .contains(firstVariableName)

    cy.getByTestID('search-widget').clear().type(secondVariableName)
    cy.getByTestID('resource-card variable')
      .should('have.length', 1)
      .contains(secondVariableName)

    cy.getByTestID('search-widget').clear().type(thirdVariableName)
    cy.getByTestID('resource-card variable')
      .should('have.length', 1)
      .contains(thirdVariableName)

    // Select descending order and use filter on label name
    cy.getByTestID('search-widget').clear()
    cy.getByTestID('resource-sorter--button').click()
    cy.getByTestID('resource-sorter--name-desc').click()

    cy.getByTestID('search-widget').type(firstLabelName)
    cy.getByTestID('resource-card variable')
      .should('have.length', 1)
      .contains(firstVariableName)

    cy.getByTestID('search-widget').clear().type(secondLabelName)
    cy.getByTestID('resource-card variable')
      .should('have.length', 1)
      .contains(secondVariableName)

    cy.getByTestID('search-widget').clear().type(thirdLabelName)
    cy.getByTestID('resource-card variable')
      .should('have.length', 1)
      .contains(thirdVariableName)
  })
})

describe('Variables - IOx', () => {
  it('routes to 404 page when IOx user attempts to access variables', () => {
    cy.skipOn(isTSMOrg)
    const shouldShowTasks = false
    setupTest(shouldShowTasks)
    cy.contains('404: Page Not Found')
  })
})
