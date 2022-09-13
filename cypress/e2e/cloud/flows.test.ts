import {Organization} from '../../../src/types'

describe('Flows', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin().then(() => {
      cy.setFeatureFlags({quartzIdentity: true, multiOrg: true})
    })
    cy.get('@org').then(({id}: Organization) => {
      cy.fixture('routes').then(({orgs}) => {
        cy.visit(`${orgs}/${id}`)
        cy.getByTestID('version-info').should('be.visible')
        cy.getByTestID('nav-item-flows').should('be.visible')
        cy.getByTestID('nav-item-flows').click()
      })
    })
  })

  it('can create, clone a flow and persist selected data in the clone, and delete a flow from the list page', () => {
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
    const flowCloneNamePrefix = `${flowName} (cloned at `

    cy.getByTestID('preset-new').first().click()

    cy.getByTestID('time-machine-submit-button').should('be.visible')

    cy.getByTestID('page-title').first().click()

    cy.getByTestID('renamable-page-title--input').type(
      `{backspace}${flowName}{enter}`
    )
    cy.wait('@updateNotebook')

    cy.getByTestID('page-title').contains(flowName)

    cy.getByTestID('sidebar-button').first().click()
    cy.getByTestID('Delete--list-item').click()
    cy.wait('@updateNotebook')

    cy.get('.flow-divider--button').first().click()

    // Opening the menu adds another Query Builder button
    cy.getByTestID('add-flow-btn--queryBuilder').should('have.length', 2)

    // Click the newest Query Builder button
    cy.getByTestID('add-flow-btn--queryBuilder').last().click()
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
    cy.getByTestID('table-cell beans').first().should('be.visible')
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
    cy.getByTestID('page-title')
      .first()
      .then(cloneNameElement => {
        const cloneName = cloneNameElement.text()
        const cloneTime = cloneName.slice(
          flowCloneNamePrefix.length,
          cloneName.length - 1
        )
        const cloneTimeAsDate = new Date(cloneTime)
        expect(cloneTimeAsDate.toTimeString()).not.to.equal('Invalid Date')
        expect(cloneTimeAsDate.valueOf()).to.equal(cloneTimeAsDate.valueOf())
      })

    cy.clickNavBarItem('nav-item-flows')

    cy.get('.cf-resource-card').should('have.length', 2)
    cy.get('.cf-resource-editable-name').first().contains(flowCloneNamePrefix)

    // Delete the cloned flow
    cy.getByTestIDHead(`flow-card--${flowCloneNamePrefix}`).within(() => {
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
    cy.getByTestID('page-title')
      .first()
      .then(cloneNameElement => {
        const cloneName = cloneNameElement.text()
        const cloneTime = cloneName.slice(
          flowCloneNamePrefix.length,
          cloneName.length - 1
        )
        const cloneTimeAsDate = new Date(cloneTime)
        expect(cloneTimeAsDate.toTimeString()).not.to.equal('Invalid Date')
        expect(cloneTimeAsDate.valueOf()).to.equal(cloneTimeAsDate.valueOf())
      })

    // Delete the cloned flow inside the notebook
    cy.getByTestID('flow-menu-button').click()
    cy.getByTestID('flow-menu-button-delete').should('be.visible')
    cy.getByTestID('flow-menu-button-delete').click()

    cy.getByTestID('notification-success').should('be.visible')

    cy.get('.cf-resource-card').should('have.length', 1)
    cy.get('.cf-resource-editable-name').should('have.length', 1)
    cy.get('.cf-resource-editable-name').contains(`${flowName}`)
  })

  it('can use the dynamic flux function selector to build a query', () => {
    cy.setFeatureFlags({
      fluxDynamicDocs: true,
      quartzIdentity: true,
      multiOrg: true,
    }).then(() => {
      cy.getByTestID('preset-script').first().click()

      cy.get('.view-line').should('be.visible')

      cy.get('button[title="Function Reference"]').click()

      // search for a function
      cy.getByTestID('flux-toolbar-search--input').click().type('microsecondd') // purposefully misspell "microsecond" so all functions are filtered out

      cy.getByTestID('flux-toolbar--list').within(() => {
        cy.getByTestID('empty-state').should('be.visible')
      })
      cy.getByTestID('flux-toolbar-search--input').type('{backspace}')

      cy.get('.flux-toolbar--list-item').should('contain', 'microsecond')
      cy.get('.flux-toolbar--list-item').should('have.length', 1)

      // hovers over function and see a tooltip
      cy.get('.flux-toolbar--list-item').trigger('mouseover')
      cy.getByTestID('flux-docs--microsecond').should('be.visible')

      // inject function into script editor
      cy.getByTestID('flux--microsecond--inject').click({force: true})

      // At minimium two lines: import and a function call
      cy.get('.view-line').should('have.length.at.least', 2)
      cy.get('.view-line').last().contains('microsecond')
    })
  })

  it('can use the dynamic flux function search bar to search by package or function name', () => {
    cy.setFeatureFlags({
      fluxDynamicDocs: true,
      quartzIdentity: true,
      multiOrg: true,
    }).then(() => {
      cy.getByTestID('preset-script').first().click()

      cy.get('.view-line').should('be.visible')

      cy.get('button[title="Function Reference"]').click()

      cy.getByTestID('flux-toolbar-search--input').click().type('filter')

      cy.getByTestID('flux-toolbar-search--input').click().type('filter')

      cy.get('.flux-toolbar--search').within(() => {
        cy.getByTestID('dismiss-button').click()
      })

      cy.getByTestID('flux-toolbar-search--input')
        .invoke('val')
        .then(value => {
          expect(value).to.equal('')
        })

      cy.getByTestID('flux-toolbar-search--input').click().type('array')

      cy.getByTestID('flux-toolbar-search--input').click().type('array')

      cy.get('.flux-toolbar--search').within(() => {
        cy.getByTestID('dismiss-button').click()
      })

      cy.getByTestID('flux-toolbar-search--input')
        .invoke('val')
        .then(value => {
          expect(value).to.equal('')
        })
    })
  })
})

describe('Flows with newQueryBuilder flag on', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.get('@org').then(({id}: Organization) =>
      cy.fixture('routes').then(({orgs}) => {
        cy.setFeatureFlags({
          multiOrg: true,
          quartzIdentity: true,
          newQueryBuilder: true,
        }).then(() => {
          cy.visit(`${orgs}/${id}`)
        })
      })
    )
    cy.getByTestID('version-info')
    cy.getByTestID('nav-item-flows').should('be.visible')
    cy.getByTestID('nav-item-flows').click()
  })

  it('can create, clone a flow and persist selected data in the clone, and delete a flow from the list page', () => {
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
    const flowCloneNamePrefix = `${flowName} (cloned at `

    cy.getByTestID('preset-new').first().click()

    cy.getByTestID('time-machine-submit-button').should('be.visible')

    cy.getByTestID('page-title').first().click()

    cy.getByTestID('renamable-page-title--input').type(`${flowName}{enter}`)
    cy.wait('@updateNotebook')

    cy.getByTestID('page-title').contains(flowName)

    cy.getByTestID('sidebar-button').first().click()
    cy.getByTestID('Delete--list-item').click()
    cy.wait('@updateNotebook')

    cy.get('.flow-divider--button').first().click()

    // Opening the menu adds another Query Builder button
    cy.getByTestID('add-flow-btn--queryBuilder').should('have.length', 2)

    // Click the newest Query Builder button
    cy.getByTestID('add-flow-btn--queryBuilder').last().click()
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
    cy.getByTestID('table-cell beans').first().should('be.visible')
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
    cy.getByTestID('page-title')
      .first()
      .then(cloneNameElement => {
        const cloneName = cloneNameElement.text()
        const cloneTime = cloneName.slice(
          flowCloneNamePrefix.length,
          cloneName.length - 1
        )
        const cloneTimeAsDate = new Date(cloneTime)
        expect(cloneTimeAsDate.toTimeString()).not.to.equal('Invalid Date')
        expect(cloneTimeAsDate.valueOf()).to.equal(cloneTimeAsDate.valueOf())
      })

    cy.clickNavBarItem('nav-item-flows')

    cy.get('.cf-resource-card').should('have.length', 2)
    cy.get('.cf-resource-editable-name').first().contains(flowCloneNamePrefix)

    // Delete the cloned flow
    cy.getByTestIDHead(`flow-card--${flowCloneNamePrefix}`).within(() => {
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
    cy.getByTestID('page-title')
      .first()
      .then(cloneNameElement => {
        const cloneName = cloneNameElement.text()
        const cloneTime = cloneName.slice(
          flowCloneNamePrefix.length,
          cloneName.length - 1
        )
        const cloneTimeAsDate = new Date(cloneTime)
        expect(cloneTimeAsDate.toTimeString()).not.to.equal('Invalid Date')
        expect(cloneTimeAsDate.valueOf()).to.equal(cloneTimeAsDate.valueOf())
      })

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
