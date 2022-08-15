import {Organization} from '../../../src/types'

describe('Flows', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.get('@org').then(({id}: Organization) =>
      cy.fixture('routes').then(({orgs}) => {
        cy.visit(`${orgs}/${id}`)
      })
    )
    cy.getByTestID('version-info')
    cy.getByTestID('nav-item-flows').should('be.visible')
    cy.getByTestID('nav-item-flows').click()
  })

  it('CRUD a flow from the index page', () => {
    cy.intercept('PATCH', '/api/v2private/notebooks/*').as('updateNotebook')

    const now = Date.now()
    cy.writeData(
      [
        `test,container_name=cool dopeness=12 ${now - 1000}000000`,
        `test,container_name=beans dopeness=18 ${now - 1200}000000`,
        `test,container_name=cool dopeness=14 ${now - 1400}000000`,
        `test,container_name=beans dopeness=10 ${now - 1600}000000`,
      ],
      'defbuck'
    )
    cy.getByTestID('preset-new')
      .first()
      .click()

    cy.getByTestID('time-machine-submit-button').should('be.visible')

    cy.getByTestID('page-title')
      .first()
      .click()
    cy.getByTestID('renamable-page-title--input')
      .clear()
      .type('My Flow {enter}')
    cy.wait('@updateNotebook')

    // "Add Another Panel" menu is present and there is a Query Builder button
    cy.get('.insert-cell-menu.always-on').contains('Add Another Panel')
    cy.getByTestID('add-flow-btn--queryBuilder').should('have.length', 1)

    cy.getByTestID('sidebar-button')
      .first()
      .click()
    cy.getByTestID('Delete--list-item').click()

    cy.get('.flow-divider--button')
      .first()
      .click()

    // Opening the menu adds another Query Builder button
    cy.getByTestID('add-flow-btn--queryBuilder').should('have.length', 2)

    // Click the newest Query Builder button
    cy.getByTestID('add-flow-btn--queryBuilder')
      .last()
      .click()

    cy.getByTestID('selector-list defbuck')
      .first()
      .click()
    cy.getByTestID('selector-list test')
      .first()
      .click()

    cy.getByTestID('time-machine-submit-button').click()
    cy.get('.flow-visualization--view .giraffe-plot').should('have.length', 1)
    cy.getByTestID('giraffe-layer-line').should('have.length', 1)
  })

  it('can execute preview, see results, change tags, execute preview, see different results', () => {
    cy.intercept('PATCH', '/api/v2private/notebooks/*').as('updateNotebook')

    const newBucketName = 'lets goooo'
    const now = Date.now()
    cy.get<Organization>('@org').then(({id, name}: Organization) => {
      cy.createBucket(id, name, newBucketName)
    })
    cy.writeData(
      [
        `test,container_name=cool dopeness=12 ${now - 1000}000000`,
        `test,container_name=beans dopeness=18 ${now - 1200}000000`,
        `test,container_name=cool dopeness=14 ${now - 1400}000000`,
        `test,container_name=beans dopeness=10 ${now - 1600}000000`,
      ],
      newBucketName
    )

    cy.getByTestID('preset-new')
      .first()
      .click()
    cy.getByTestID('time-machine-submit-button').should('be.visible')

    cy.getByTestID('page-title')
      .first()
      .click()
    cy.getByTestID('renamable-page-title--input')
      .clear()
      .type('My Flow {enter}')
    cy.wait('@updateNotebook')

    // "Add Another Panel" menu is present and there is a Query Builder button
    cy.get('.insert-cell-menu.always-on').contains('Add Another Panel')
    cy.getByTestID('add-flow-btn--queryBuilder').should('have.length', 1)

    // Delete the first panel
    cy.getByTestID('sidebar-button')
      .first()
      .click()
    cy.getByTestID('Delete--list-item').click()

    cy.get('.flow-divider--button')
      .first()
      .click()

    // Opening the menu adds another Query Builder button
    cy.getByTestID('add-flow-btn--queryBuilder').should('have.length', 2)

    // Click the newest Query Builder button
    cy.getByTestID('add-flow-btn--queryBuilder')
      .last()
      .click()

    // select our bucket
    cy.getByTestID('bucket-selector').within(() => {
      cy.getByTestID('selector-list lets goooo').click()
    })

    // select measurement and field
    cy.getByTestID('builder-card')
      .eq(0)
      .within(() => {
        cy.getByTestID(`selector-list test`).click()
      })
    cy.getByTestID('builder-card')
      .eq(1)
      .within(() => {
        cy.getByTestID(`selector-list dopeness`).click()
      })
    // select beans tag and click preview
    cy.getByTestID('builder-card')
      .eq(2)
      .within(() => {
        cy.getByTestID(`selector-list beans`).click()
      })

    cy.getByTestID('time-machine-submit-button').click()

    // we should only see beans in the table
    cy.getByTestID('simple-table').should('be.visible')
    cy.getByTestID('table-cell beans')
      .first()
      .should('be.visible')
    cy.getByTestID('table-cell cool').should('not.exist')

    // change tag to cool and click preview
    cy.getByTestID('builder-card')
      .eq(2)
      .within(() => {
        cy.getByTestID(`selector-list cool`).click()
      })
    cy.getByTestID('time-machine-submit-button').click()

    // we should only see cool in the table
    cy.getByTestID('simple-table').should('be.visible')
    cy.getByTestID('table-cell cool')
      .first()
      .should('be.visible')
  })

  it('can create and delete a flow from the list page', () => {
    cy.intercept('PATCH', '/api/v2private/notebooks/*').as('updateNotebook')

    const newBucketName = 'shmucket'
    const now = Date.now()
    cy.get<Organization>('@org').then(({id, name}: Organization) => {
      cy.createBucket(id, name, newBucketName)
    })
    cy.writeData(
      [
        `test,container_name=cool dopeness=12 ${now - 1000}000000`,
        `test,container_name=beans dopeness=18 ${now - 1200}000000`,
        `test,container_name=cool dopeness=14 ${now - 1400}000000`,
        `test,container_name=beans dopeness=10 ${now - 1600}000000`,
      ],
      newBucketName
    )

    const flowName = 'Flowbooks'

    cy.getByTestID('preset-new')
      .first()
      .click()

    cy.getByTestID('time-machine-submit-button').should('be.visible')

    cy.getByTestID('page-title')
      .first()
      .click()

    cy.getByTestID('renamable-page-title--input')
      .clear()
      .type(`${flowName}{enter}`)
    cy.wait('@updateNotebook')

    cy.getByTestID('page-title').contains(flowName)

    cy.getByTestID('sidebar-button')
      .first()
      .click()
    cy.getByTestID('Delete--list-item').click()
    cy.wait('@updateNotebook')

    cy.get('.flow-divider--button')
      .first()
      .click()

    // Opening the menu adds another Query Builder button
    cy.getByTestID('add-flow-btn--queryBuilder').should('have.length', 2)

    // Click the newest Query Builder button
    cy.getByTestID('add-flow-btn--queryBuilder')
      .last()
      .click()
    cy.wait('@updateNotebook')

    // select our bucket
    cy.getByTestID('bucket-selector').within(() => {
      cy.getByTestID(`selector-list ${newBucketName}`).click()
    })
    cy.wait('@updateNotebook')

    // select measurement and field
    cy.getByTestID('builder-card')
      .eq(0)
      .within(() => {
        cy.getByTestID(`selector-list test`).click()
      })
    cy.wait('@updateNotebook')

    cy.getByTestID('builder-card')
      .eq(1)
      .within(() => {
        cy.getByTestID(`selector-list dopeness`).click()
      })
    cy.wait('@updateNotebook')

    // select beans tag and click preview
    cy.getByTestID('builder-card')
      .eq(2)
      .within(() => {
        cy.getByTestID(`selector-list beans`).click()
      })
    cy.wait('@updateNotebook')

    cy.getByTestID('time-machine-submit-button').click()

    // we should only see beans in the table
    cy.getByTestID('simple-table').should('be.visible')
    cy.getByTestID('table-cell beans')
      .first()
      .should('be.visible')
    cy.getByTestID('table-cell cool').should('not.exist')

    // This is a random validator that the autorefresh option doesn't pop up
    // In Flows again without explicit changes
    cy.getByTestID('autorefresh-dropdown--button').should('not.exist')

    cy.clickNavBarItem('nav-item-flows')
    cy.get('@org').then(({id}: Organization) =>
      cy.fixture('routes').then(({orgs}) => {
        cy.location('pathname').should('eq', `${orgs}/${id}/notebooks`)
      })
    )

    cy.get('.cf-resource-card').should('have.length', 1)

    cy.getByTestID('resource-editable-name').contains(`${flowName}`)
  })

  it('should have the same number of flow panels and no presentation panel when presentation mode is off', () => {
    cy.intercept('PATCH', '/api/v2private/notebooks/*').as('updateNotebook')

    const newBucketName = 'shmucket'
    const now = Date.now()
    cy.get<Organization>('@org').then(({id, name}: Organization) => {
      cy.createBucket(id, name, newBucketName)
    })
    cy.writeData(
      [
        `test,container_name=cool dopeness=12 ${now - 1000}000000`,
        `test,container_name=beans dopeness=18 ${now - 1200}000000`,
        `test,container_name=cool dopeness=14 ${now - 1400}000000`,
        `test,container_name=beans dopeness=10 ${now - 1600}000000`,
      ],
      newBucketName
    )

    const flowName = 'Flowbooks'

    cy.getByTestID('preset-new')
      .first()
      .click()
    cy.getByTestID('time-machine-submit-button').should('be.visible')

    cy.getByTestID('page-title')
      .first()
      .click()
    cy.getByTestID('renamable-page-title--input')
      .clear()
      .type(`${flowName}{enter}`)
    cy.wait('@updateNotebook')

    // "Add Another Panel" menu is present and there is a Query Builder button
    cy.get('.insert-cell-menu.always-on').contains('Add Another Panel')
    cy.getByTestID('add-flow-btn--queryBuilder').should('have.length', 1)

    cy.getByTestID('sidebar-button')
      .first()
      .click()
    cy.getByTestID('Delete--list-item').click()

    cy.get('.flow-divider--button')
      .first()
      .click()

    // Opening the menu adds another Query Builder button
    cy.getByTestID('add-flow-btn--queryBuilder').should('have.length', 2)

    // Click the newest Query Builder button
    cy.getByTestID('add-flow-btn--queryBuilder')
      .last()
      .click()

    // select our bucket
    cy.getByTestID('bucket-selector').within(() => {
      cy.getByTestID(`selector-list ${newBucketName}`).click()
    })

    // select measurement and field
    cy.getByTestID('builder-card')
      .eq(0)
      .within(() => {
        cy.getByTestID(`selector-list test`).click()
      })
    cy.getByTestID('builder-card')
      .eq(1)
      .within(() => {
        cy.getByTestID(`selector-list dopeness`).click()
      })
    // select beans tag and click preview
    cy.getByTestID('builder-card')
      .eq(2)
      .within(() => {
        cy.getByTestID(`selector-list beans`).click()
      })

    cy.getByTestID('time-machine-submit-button').click()

    // we should only see beans in the table
    cy.getByTestID('simple-table').should('be.visible')
    cy.getByTestID('table-cell beans')
      .first()
      .should('be.visible')
    cy.getByTestID('table-cell cool').should('not.exist')

    // there are exactly 3 Flow panels
    cy.get('.flow-panel__visible').should('have.length', 3)

    // exit the flow, reload, and come back in
    cy.clickNavBarItem('nav-item-flows')
    cy.getByTestID('tree-nav').should('be.visible')
    cy.getByTestID('resource-editable-name').should('exist')
    cy.getByTestID('resource-editable-name').click()

    // validation and visualization should exist
    cy.getByTestID('simple-table').should('exist')
    cy.getByTestID('giraffe-inner-plot').should('exist')

    // there are still exactly 3 flow panels and no presentation panels
    cy.get('.flow-panel__visible').should('have.length', 3)
    cy.get('.presentation-panel').should('not.exist')
  })

  it('should have a presentation panel and no flow panels when presentation mode is on', () => {
    cy.intercept('PATCH', '/api/v2private/notebooks/*').as('updateNotebook')

    const newBucketName = 'shmucket'
    const now = Date.now()
    cy.get<Organization>('@org').then(({id, name}: Organization) => {
      cy.createBucket(id, name, newBucketName)
    })
    cy.writeData(
      [
        `test,container_name=cool dopeness=12 ${now - 1000}000000`,
        `test,container_name=beans dopeness=18 ${now - 1200}000000`,
        `test,container_name=cool dopeness=14 ${now - 1400}000000`,
        `test,container_name=beans dopeness=10 ${now - 1600}000000`,
      ],
      newBucketName
    )

    const flowName = 'Flowbooks'

    cy.getByTestID('preset-new')
      .first()
      .click()
    cy.getByTestID('time-machine-submit-button').should('be.visible')

    cy.getByTestID('page-title')
      .first()
      .click()
    cy.getByTestID('renamable-page-title--input')
      .clear()
      .type(`${flowName}{enter}`)
    cy.wait('@updateNotebook')

    // "Add Another Panel" menu is present and there is a Query Builder button
    cy.get('.insert-cell-menu.always-on').contains('Add Another Panel')
    cy.getByTestID('add-flow-btn--queryBuilder').should('have.length', 1)

    cy.getByTestID('sidebar-button')
      .first()
      .click()
    cy.getByTestID('Delete--list-item').click()

    cy.get('.flow-divider--button')
      .first()
      .click()

    // Opening the menu adds another Query Builder button
    cy.getByTestID('add-flow-btn--queryBuilder').should('have.length', 2)

    // Click the newest Query Builder button
    cy.getByTestID('add-flow-btn--queryBuilder')
      .last()
      .click()

    // select our bucket
    cy.getByTestID('bucket-selector').within(() => {
      cy.getByTestID(`selector-list ${newBucketName}`).click()
    })

    // select measurement and field
    cy.getByTestID('builder-card')
      .eq(0)
      .within(() => {
        cy.getByTestID(`selector-list test`).click()
      })
    cy.getByTestID('builder-card')
      .eq(1)
      .within(() => {
        cy.getByTestID(`selector-list dopeness`).click()
      })
    // select beans tag and click preview
    cy.getByTestID('builder-card')
      .eq(2)
      .within(() => {
        cy.getByTestID(`selector-list beans`).click()
      })

    cy.getByTestID('time-machine-submit-button').click()

    // we should only see beans in the table
    cy.getByTestID('simple-table').should('be.visible')
    cy.getByTestID('table-cell beans')
      .first()
      .should('be.visible')
    cy.getByTestID('table-cell cool').should('not.exist')

    // there are exactly 3 Flow panels before turning on presentation mode
    cy.get('.flow-panel__visible').should('have.length', 3)

    // enable presentation mode
    cy.getByTestID('slide-toggle').click()

    // exit the flow, reload, and come back in
    cy.clickNavBarItem('nav-item-flows')
    cy.getByTestID('tree-nav').should('be.visible')
    cy.getByTestID('resource-editable-name').should('exist')
    cy.getByTestID('resource-editable-name').click()

    // visualization should exist but not validation
    cy.getByTestID('simple-table').should('not.exist')
    cy.getByTestID('giraffe-inner-plot').should('be.visible')

    // there are no flow panels and exactly 1 presentation panel
    cy.get('.flow-panel__visible').should('have.length', 0)
    cy.get('.presentation-panel').should('have.length', 1)
    cy.get('.presentation-panel').should('be.visible')
  })

  it('should have certain dropdown menu items', () => {
    cy.getByTestID('preset-new')
      .first()
      .click()
    cy.getByTestID('time-machine-submit-button').should('be.visible')

    const defaultMenuItems = ['Delete', 'Duplicate', 'Hide Panel']
    const items = [
      {
        panel: 'queryBuilder',
        menuItems: [
          ...defaultMenuItems,
          'Convert to |> Flux',
          'Export to Client Library',
          'Link to Source',
          'Link to Results',
          'Link to Panel',
        ],
      },
      {
        panel: 'rawFluxEditor',
        menuItems: [
          ...defaultMenuItems,
          'Export to Client Library',
          'Link to Source',
          'Link to Results',
          'Link to Panel',
        ],
      },
      {
        panel: 'table',
        menuItems: [...defaultMenuItems, 'Download as CSV', 'Link to Panel'],
      },
      {
        panel: 'visualization',
        menuItems: [...defaultMenuItems, 'Download as CSV', 'Link to Panel'],
      },
      {
        panel: 'markdown',
        menuItems: [...defaultMenuItems, 'Link to Panel'],
      },
      {
        panel: 'notification',
        menuItems: [...defaultMenuItems, 'Link to Panel'],
      },
      {
        panel: 'schedule',
        menuItems: [...defaultMenuItems, 'Link to Panel'],
      },
    ]

    // Intercepts
    cy.intercept('/api/v2/orgs/*/secrets').as('fetchSecrets')

    items.forEach(item => {
      cy.get('.flow-divider--button')
        .first()
        .click()

      // "Add Another Panel" menu is present and there is a duplicate of each button
      cy.get('.insert-cell-menu.always-on').contains('Add Another Panel')
      cy.getByTestID(`add-flow-btn--${item.panel}`).should('have.length', 2)

      // Click the newest button from opening the panel button
      cy.get('.insert-cell-menu.always-on').within(() => {
        cy.getByTestID(`add-flow-btn--${item.panel}`)
          .last()
          .click()
        if (item.panel === 'notification') {
          cy.wait('@fetchSecrets')
        }
      })

      cy.getByTestID('sidebar-button')
        .last()
        .click()
      cy.getByTestID('dropdown-menu').should('be.visible')
      cy.getByTestID('dropdown-menu--contents')
        .find('.flow-sidebar--dropdownmenu-container')
        .children()
        .should('have.length.gte', item.menuItems.length)

      item.menuItems.forEach(menuItem => {
        cy.getByTestID(`${menuItem}--list-item`).should('be.visible')
      })
    })
  })

  it('can create a Band plot without crashing', () => {
    cy.intercept('PATCH', '/api/v2private/notebooks/*').as('updateNotebook')

    const newBucketName = 'lets goooo'
    const now = Date.now()
    cy.get<Organization>('@org').then(({id, name}: Organization) => {
      cy.createBucket(id, name, newBucketName)
    })
    cy.writeData(
      [
        `test,container_name=cool dopeness=12 ${now - 1000}000000`,
        `test,container_name=beans dopeness=18 ${now - 1200}000000`,
        `test,container_name=cool dopeness=14 ${now - 1400}000000`,
        `test,container_name=beans dopeness=10 ${now - 1600}000000`,
      ],
      newBucketName
    )

    cy.getByTestID('preset-new')
      .first()
      .click()
    cy.getByTestID('time-machine-submit-button').should('be.visible')

    cy.getByTestID('page-title')
      .first()
      .click()
    cy.getByTestID('renamable-page-title--input').type(
      'I am not afraid of Band Plot {enter}'
    )
    cy.wait('@updateNotebook')

    // select our bucket
    cy.getByTestID('bucket-selector').within(() => {
      cy.getByTestID('selector-list lets goooo').click()
    })

    // select measurement and field
    cy.getByTestID('builder-card')
      .eq(0)
      .within(() => {
        cy.getByTestID(`selector-list test`).click()
      })
    cy.getByTestID('builder-card')
      .eq(1)
      .within(() => {
        cy.getByTestID(`selector-list dopeness`).click()
      })

    cy.get('input.flow-panel--title-input')
      .eq(1)
      .should('have.value', 'Validate the Data')
    cy.getByTestID('sidebar-button')
      .eq(1)
      .click()

    cy.get('button.cf-dropdown-item[title="Delete"]')
      .should('be.visible')
      .click()

    cy.get('input.flow-panel--title-input')
      .eq(1)
      .should('have.value', 'Visualize the Result')

    cy.getByTestID('view-type--dropdown').click()
    cy.getByTestID('view-type--band').click()
    cy.get(
      '.flow-panel--persistent-control > button.cf-button[title="Run"]'
    ).click()
    cy.getByTestID('giraffe-layer-band-chart').should('be.visible')

    cy.get('button.cf-button[title="Configure Visualization"]').click()
    cy.getByTestID('dropdown--button-main-column').within(() => {
      cy.get('.cf-dropdown--selected').contains('_result')
    })
  })
})
