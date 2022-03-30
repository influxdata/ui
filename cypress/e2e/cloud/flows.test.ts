import {Organization} from '../../src/types'

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

  it('can create and clone a flow, persist selected data in the clone, and delete a flow from the list page', () => {
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
    const clone = `${flowName} (clone 1)`

    cy.getByTestID('preset-new')
      .first()
      .click()

    cy.getByTestID('time-machine-submit-button').should('be.visible')

    cy.getByTestID('page-title')
      .first()
      .click()

    cy.getByTestID('renamable-page-title--input').type(`${flowName}{enter}`)
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

    cy.get('.cf-resource-card').should('have.length', 1)

    cy.getByTestID('resource-editable-name').contains(`${flowName}`)

    cy.getByTestID(`flow-card--${flowName}`).within(() => {
      cy.getByTestID(`context-menu-flow`).click()
    })

    cy.getByTestID(`context-clone-flow`).click()

    cy.getByTestID('time-machine-submit-button').should('be.visible')

    // Should redirect the user to the newly cloned flow
    // Validates that the selected clone is the clone
    cy.getByTestID('page-title').contains(`${clone}`)

    cy.clickNavBarItem('nav-item-flows')

    cy.get('.cf-resource-card').should('have.length', 2)
    cy.get('.cf-resource-editable-name')
      .first()
      .contains(`${clone}`)

    // Delete the cloned flow
    cy.getByTestID(`flow-card--${clone}`).within(() => {
      cy.getByTestID(`context-delete-menu--button`).click()
    })
    cy.getByTestID(`context-delete-menu--confirm-button`).click()

    cy.getByTestID('notification-success').should('be.visible')
    cy.getByTestID('notification-success--dismiss').click()

    cy.get('.cf-resource-card').should('have.length', 1)
    cy.getByTestID('resource-editable-name').contains(`${flowName}`)

    // Clone a flow again
    cy.getByTestID(`flow-card--${flowName}`).within(() => {
      cy.getByTestID(`context-menu-flow`).click()
    })
    cy.getByTestID(`context-clone-flow`).click()

    // Should redirect the user to the newly cloned flow
    cy.getByTestID('time-machine-submit-button').should('be.visible')
    cy.wait('@updateNotebook')
    cy.getByTestID('page-title').contains(`${clone}`)

    // Delete the cloned flow inside the notebook
    cy.getByTestID('flow-menu-button').click()
    cy.getByTestID('flow-menu-button-delete').should('be.visible')
    cy.getByTestID('flow-menu-button-delete').click()

    cy.getByTestID('notification-success').should('be.visible')

    cy.get('.cf-resource-card').should('have.length', 1)
    cy.get('.cf-resource-editable-name').should('have.length', 1)
    cy.get('.cf-resource-editable-name').contains(`${flowName}`)
  })
})
