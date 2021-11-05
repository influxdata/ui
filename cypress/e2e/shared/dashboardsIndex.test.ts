import {Organization} from '../../../src/types'

const newLabelName = 'click-me'
const dashboardName = 'Bee Happy'
const dashboardName2 = 'test dashboard'
const dashSearchName = 'bEE'

describe('Dashboards', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() =>
        cy.fixture('routes').then(({orgs}) => {
          cy.get('@org').then(({id: orgID}: Organization) => {
            cy.visit(`${orgs}/${orgID}/dashboards-list`)
            cy.getByTestID('tree-nav')
          })
        })
      )
    )
  )

  it('empty state should have a header with text and a button to create a dashboard', () => {
    cy.getByTestID('page-contents').within(() => {
      cy.getByTestID('empty-dashboards-list').within(() => {
        cy.getByTestID('empty-state--text').should($t => {
          expect($t).to.have.length(1)
          expect($t).to.contain(
            "Looks like you don't have any Dashboards, why not create one?"
          )
        })
        cy.getByTestID('add-resource-dropdown--button').should($b => {
          expect($b).to.have.length(1)
          expect($b).to.contain('Create Dashboard')
        })
      })
    })
  })

  it('can CRUD dashboards from empty state, header, and a Template', () => {
    const newName = 'new 🅱️ashboard'
    // Create from empty state
    cy.getByTestID('empty-dashboards-list').within(() => {
      cy.getByTestID('add-resource-dropdown--button').click()
    })

    cy.getByTestID('add-resource-dropdown--new')
      .click()
      .then(() => {
        cy.fixture('routes').then(({orgs}) => {
          cy.get<Organization>('@org').then(({id}: Organization) => {
            cy.on('uncaught:exception', () => {
              // workaround for when ChunkLoadError is thrown at cy.visit in ffox
              return false
            })
            cy.visit(`${orgs}/${id}/dashboards-list`, {
              retryOnStatusCodeFailure: true,
            })
            cy.getByTestID('tree-nav')
          })
        })
      })

    cy.getByTestID('dashboard-card').within(() => {
      cy.getByTestID('dashboard-card--name')
        .first()
        .trigger('mouseover')

      cy.getByTestID('dashboard-card--name-button')
        .first()
        .click()

      cy.get('.cf-input-field')
        .type(newName)
        .type('{enter}')
    })

    cy.getByTestID('dashboard-card').should('contain', newName)

    // Open Export overlay
    cy.getByTestID('context-menu-dashboard').click()
    cy.getByTestID('context-export-dashboard').click()
    cy.getByTestID('export-overlay--text-area').should('exist')
    cy.get('.cf-overlay--dismiss').click()

    // Create from header
    cy.getByTestID('add-resource-dropdown--button').click()
    cy.getByTestID('add-resource-dropdown--new').click()

    cy.fixture('routes').then(({orgs}) => {
      cy.get<Organization>('@org').then(({id}: Organization) => {
        cy.on('uncaught:exception', () => {
          // workaround for when ChunkLoadError is thrown at cy.visit in ffox
          return false
        })
        cy.visit(`${orgs}/${id}/dashboards-list`)
        cy.getByTestID('tree-nav')
      })
    })

    cy.getByTestID('dashboard-card').should('have.length', 2)

    const dashboardDescription = 'this dashboard contains secret information'

    // change description
    cy.get(
      '[data-testid=resource-list--editable-description] .cf-resource-description--preview'
    )
      .first()
      .trigger('mouseover')
      .click('topLeft', {force: true})
    cy.get('[placeholder="Describe Name this Dashboard"]')
      .first()
      .type(dashboardDescription)
      .type('{enter}')
    cy.getByTestID('resource-list--editable-description').should(
      'contain',
      dashboardDescription
    )

    // remove description
    cy.get(
      '[data-testid=resource-list--editable-description] .cf-resource-description--preview'
    )
      .first()
      .trigger('mouseover')
      .click('topLeft', {force: true})
    cy.get('[placeholder="Describe Name this Dashboard"]')
      .first()
      .clear()
      .type('{enter}')
    cy.getByTestID('resource-list--editable-description').should(
      'not.contain',
      dashboardDescription
    )

    // Delete dashboards
    cy.getByTestID('dashboard-card')
      .first()
      .trigger('mouseover')
      .within(() => {
        cy.getByTestID('context-delete-menu--button').click()
      })
    cy.getByTestID('context-delete-menu--confirm-button').click()

    cy.getByTestID('dashboard-card')
      .first()
      .trigger('mouseover')
      .within(() => {
        cy.getByTestID('context-delete-menu--button').click()
      })
    cy.getByTestID('context-delete-menu--confirm-button').click()

    cy.getByTestID('empty-dashboards-list').should('exist')
  })

  it('can import as JSON or file', () => {
    const checkImportedDashboard = () => {
      // wait for importing done
      cy.intercept('POST', '/api/v2/dashboards/*/cells').as('createCells')
      // create cell 1
      cy.wait('@createCells')
      // create cell 2
      cy.wait('@createCells')
      cy.getByTestID('dashboard-card--name')
        .should('contain', 'IMPORT dashboard')
        .click()
      cy.getByTestID('cell Name this Cell').within(() => {
        cy.get('.markdown-cell--contents').should(
          'contain',
          'Note about no tea'
        )
      })
      cy.getByTestID('cell cellll').should('exist')

      // return to previous page
      cy.fixture('routes').then(({orgs}) => {
        cy.get<Organization>('@org').then(({id}: Organization) => {
          cy.visit(`${orgs}/${id}/dashboards-list`)
          cy.getByTestID('tree-nav')
        })
      })
    }

    // import dashboard from file
    cy.getByTestID('add-resource-dropdown--button')
      .first()
      .click()
    cy.getByTestID('add-resource-dropdown--import').click()

    cy.getByTestID('drag-and-drop--input').attachFile({
      filePath: 'dashboard-import.json',
    })

    cy.getByTestID('submit-button Dashboard').click()
    checkImportedDashboard()

    // delete dashboard before reimport
    cy.getByTestID('dashboard-card')
      .first()
      .trigger('mouseover')
      .within(() => {
        cy.getByTestID('context-delete-menu--button').click()
      })
    cy.getByTestID('context-delete-menu--confirm-button').click()

    // dashboard no longer exists
    cy.getByTestID('dashboard-card').should('not.exist')

    // import dashboard as json
    cy.getByTestID('add-resource-dropdown--button')
      .first()
      .click()
    cy.getByTestID('add-resource-dropdown--import').click()

    cy.getByTestID('select-group')
      .contains('Paste')
      .click()

    cy.fixture('dashboard-import.json').then(json => {
      cy.getByTestID('import-overlay--textarea')
        .should('be.visible')
        .click()
        .type(JSON.stringify(json), {parseSpecialCharSequences: false})
    })

    cy.getByTestID('submit-button Dashboard').click()
    checkImportedDashboard()
  })

  it('keeps user input in text area when attempting to import invalid JSON', () => {
    cy.getByTestID('page-control-bar').within(() => {
      cy.getByTestID('add-resource-dropdown--button').click()
    })

    cy.getByTestID('add-resource-dropdown--import').click()
    cy.contains('Paste').click()
    cy.getByTestID('import-overlay--textarea')
      .click()
      .type('this is invalid JSON')
    cy.get('button[title*="Import JSON"]').click()
    cy.getByTestID('import-overlay--textarea--error').should('have.length', 1)
    cy.getByTestID('import-overlay--textarea').should($s =>
      expect($s).to.contain('this is invalid JSON')
    )
    cy.getByTestID('import-overlay--textarea').type(
      '{backspace}{backspace}{backspace}{backspace}{backspace}'
    )
    cy.get('button[title*="Import JSON"]').click()
    cy.getByTestID('import-overlay--textarea--error').should('have.length', 1)
    cy.getByTestID('import-overlay--textarea').should($s =>
      expect($s).to.contain('this is invalid')
    )
  })

  describe('Dashboard List', () => {
    beforeEach(() =>
      cy.get<Organization>('@org').then(({id}: Organization) =>
        cy.createDashboard(id, dashboardName).then(({body}) =>
          cy
            .createAndAddLabel('dashboards', id, body.id, newLabelName)
            .then(() =>
              cy.createDashboard(id, dashboardName2).then(({body}) =>
                cy
                  .createAndAddLabel('dashboards', id, body.id, 'bar')
                  .then(() =>
                    cy.fixture('routes').then(({orgs}) =>
                      cy
                        .get<Organization>('@org')
                        .then(({id}: Organization) => {
                          cy.visit(`${orgs}/${id}/dashboards-list`)
                          return cy.getByTestID('tree-nav')
                        })
                    )
                  )
              )
            )
        )
      )
    )

    it('can clone a dashboard', () => {
      cy.getByTestID('dashboard-card').should('have.length', 2)

      cy.getByTestID('dashboard-card')
        .first()
        .within(() => {
          cy.getByTestID('context-menu-dashboard').click()
        })

      cy.getByTestID('context-clone-dashboard').click()

      cy.fixture('routes').then(({orgs}) => {
        cy.get<Organization>('@org').then(({id}: Organization) => {
          cy.visit(`${orgs}/${id}/dashboards-list`)
          cy.getByTestID('tree-nav')
        })
      })

      cy.getByTestID('dashboard-card').should('have.length', 3)
    })

    it('retains dashboard sort order after navigating away', () => {
      const expectedDashboardOrder = ['test dashboard', 'Bee Happy']

      cy.getByTestID('dashboard-card').should('have.length', 2)

      // change sort order to 'Name (Z → A)'
      cy.getByTestID('resource-sorter--button')
        .click()
        .then(() => {
          cy.contains('Name (Z → A)').click()
        })
        .then(() => {
          // assert dashboard order is correct
          cy.get('span[data-testid*="dashboard-card--name"]').each(
            (val, index) => {
              cy.wrap(val).contains(expectedDashboardOrder[index])
            }
          )
        })

      // visit another page
      cy.getByTestID('tree-nav').then(() => {
        cy.contains('Settings').click({force: true})
        cy.contains(
          "Looks like there aren't any Variables, why not create one?"
        )
        // return to dashboards page
        cy.contains('Dashboards').click()
      })

      // assert dashboard order remains the same
      cy.get('span[data-testid*="dashboard-card--name"]').each((val, index) => {
        cy.wrap(val).contains(expectedDashboardOrder[index])
      })
    })

    describe('Labeling', () => {
      it('can click to filter dashboard labels', () => {
        cy.getByTestID('dashboard-card').should('have.length', 2)

        cy.getByTestID(`label--pill ${newLabelName}`).click()

        cy.getByTestID('dashboard-card')
          .should('have.length', 1)
          .and('contain', newLabelName)
      })

      it('can delete a label from a dashboard', () => {
        cy.getByTestID('dashboard-card')
          .first()
          .within(() => {
            const pillID = `label--pill ${newLabelName}`

            cy.getByTestID(pillID).should('have.length', 1)

            cy.getByTestID(`label--pill--delete ${newLabelName}`).click({
              force: true,
            })

            cy.getByTestID(pillID).should('have.length', 0)
            cy.getByTestID(`inline-labels--empty`).should('have.length', 1)
          })
      })

      it('clicking a list item adds a label and leaves open the popover with the next item highlighted', () => {
        const labelName = 'clicky'

        cy.get<Organization>('@org').then(({id}: Organization) => {
          cy.createLabel(labelName, id).then(() => {
            cy.reload()
            cy.getByTestID(`inline-labels--add`)
              .first()
              .click()

            cy.getByTestID(`label--pill ${labelName}`).click()

            cy.getByTestID(`label--pill bar`).should('be.visible')
          })
        })
      })

      it('can add an existing label to a dashboard', () => {
        const labelName = 'swogglez'

        cy.get<Organization>('@org').then(({id}: Organization) => {
          cy.createLabel(labelName, id).then(() => {
            cy.reload()
            cy.getByTestID(`inline-labels--add`)
              .first()
              .click()

            cy.getByTestID(`label--pill ${labelName}`).click()

            cy.getByTestID('dashboard-card')
              .first()
              .within(() => {
                cy.getByTestID(`label--pill ${labelName}`).should('be.visible')
              })
          })
        })
      })

      it('typing in the input updates the list', () => {
        const labelName = 'banana'

        cy.get<Organization>('@org').then(({id}: Organization) => {
          cy.createLabel(labelName, id).then(() => {
            cy.reload()
            cy.getByTestID(`inline-labels--add`)
              .first()
              .click()

            cy.getByTestID(`inline-labels--popover-field`).type(labelName)

            cy.getByTestID(`label--pill ${labelName}`).should('be.visible')
            cy.getByTestID('inline-labels--list').should('have.length', 1)
          })
        })
      })

      it('typing a new label name and pressing ENTER starts label creation flow, closes popover', () => {
        const labelName = 'choco'

        cy.getByTestID(`inline-labels--add`)
          .first()
          .click()

        cy.getByTestID('inline-labels--popover--contents').should('be.visible')
        cy.getByTestID(`inline-labels--popover-field`)
          .type(labelName)
          .type('{enter}')
        cy.getByTestID('overlay--body').should('be.visible')
        cy.getByTestID('inline-labels--popover--contents').should('not.exist')
      })

      it('typing a new label name and clicking name starts label creation flow, closes popover', () => {
        // https://github.com/influxdata/influxdb/issues/17964
        const labelName = 'the new new'

        cy.getByTestID(`inline-labels--add`)
          .first()
          .click()

        cy.getByTestID('inline-labels--popover--contents').should('be.visible')

        cy.getByTestID(`inline-labels--popover-field`).type(labelName)

        cy.getByTestID(`inline-labels--create-new`).click()

        cy.getByTestID('overlay--body').should('be.visible')
        cy.getByTestID('inline-labels--popover--contents').should('not.exist')
      })

      it('can create a label and add to a dashboard', () => {
        const label = 'plerps'
        cy.getByTestID(`inline-labels--add`)
          .first()
          .click()

        cy.getByTestID('inline-labels--popover-field').type(label)
        cy.getByTestID('inline-labels--create-new').click()

        cy.getByTestID('overlay--container').within(() => {
          cy.getByTestID('create-label-form--name').should('have.value', label)
          cy.getByTestID('create-label-form--submit').click()
        })

        cy.getByTestID('dashboard-card')
          .first()
          .within(() => {
            cy.getByTestID(`label--pill ${label}`).should('be.visible')
          })
      })
    })

    describe('Searching', () => {
      it('can search dashboards by labels', () => {
        cy.getByTestID('dashboard-card').should('have.length', 2)

        cy.getByTestID('search-widget').type(newLabelName)

        cy.getByTestID('dashboard-card').should('have.length', 1)

        cy.getByTestID('dashboard-card')
          .first()
          .get('.cf-label')
          .should('contain', newLabelName)
      })

      it('can search by clicking label', () => {
        const clicked = 'click-me'

        cy.getByTestID('dashboard-card').should('have.length', 2)

        cy.getByTestID(`label--pill ${clicked}`).click()

        cy.getByTestID('search-widget').should('have.value', clicked)

        cy.getByTestID('dashboard-card').should('have.length', 1)
      })

      it('can search by dashboard name', () => {
        cy.getByTestID('search-widget').type(dashSearchName)

        cy.getByTestID('dashboard-card').should('have.length', 1)
        cy.contains(dashboardName)
      })

      it('can persist search term', () => {
        cy.getByTestID('dashboard-card').should('have.length', 2)

        cy.getByTestID('search-widget').type(dashSearchName)

        cy.getByTestID('dashboard-card').should('have.length', 1)

        cy.getByTestID('dashboard-card')
          .first()
          .getByTestID('dashboard-card--name')
          .should('contain', dashboardName)

        // Navigate Away and come back using browser's back button
        cy.getByTestID('dashboard-card')
          .first()
          .getByTestID('dashboard-card--name')
          .click()
        cy.getByTestID('page-title').contains(dashboardName)
        cy.go('back')
        cy.getByTestID('search-widget').should('have.value', dashSearchName)

        // Navigate Away and come back by clicking on Boards icon
        cy.getByTestID('nav-item-tasks').click()
        cy.getByTestID('page-title').contains('Tasks')
        cy.getByTestID('nav-item-dashboards').click()
        cy.getByTestID('search-widget').should('have.value', dashSearchName)
      })
    })
  })

  it('should redirect to the dashboard list when dashboard not exist', () => {
    const nonexistentID = '0499992503cd3700'

    // visiting the dashboard edit page
    cy.get<Organization>('@org').then(({id}: Organization) => {
      cy.fixture('routes').then(({orgs, dashboards}) => {
        cy.visit(`${orgs}/${id}${dashboards}/${nonexistentID}`)
        cy.url().should('include', `${orgs}/${id}/dashboards-list`)
      })
    })
  })

  before(() =>
    cy.exec('rm cypress/downloads/*', {
      log: true,
      failOnNonZeroExit: false,
    })
  )

  it('creates a dashboard and downloads JSON', () => {
    cy.get('@org').then(({id: orgID}: Organization) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('nav-item-dashboards').click()
          cy.getByTestID('dashboard-card--name').click()
          cy.getByTestID('page-title').type('dashboard') // dashboard name added to prevent failure due to downloading JSON with a different name
          cy.getByTestID('add-note--button').click()
          cy.getByTestID('note-editor--overlay').should('be.visible')
          cy.getByTestID('markdown-editor').type('test note added')
          cy.getByTestID('save-note--button').click() // note added to add content to be downloaded in the JSON file
          cy.getByTestID('nav-item-dashboards').click()
          cy.getByTestID('dashboard-card').invoke('hover')
          cy.getByTestID('context-menu-dashboard').click()
          cy.getByTestID('context-export-dashboard').click()
          cy.getByTestID('form-container').should('be.visible')
          cy.getByTestID('export-overlay--text-area').should('be.visible')
          cy.getByTestID('button').click()
          // readFile has a 4s timeout before the test fails
          cy.readFile('cypress/downloads/dashboard.json').should('not.be.null')
        })
      })
    })
  })

  it('copies to clipboard', () => {
    cy.get('@org').then(({id: orgID}: Organization) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('tree-nav')
          cy.window().then(win => {
            cy.stub(win, 'prompt').returns('DISABLED WINDOW PROMPT') // disable pop-up prompt
          })
          cy.getByTestID('nav-item-dashboards').click()
          cy.getByTestID('dashboard-card').invoke('hover')
          cy.getByTestID('context-menu-dashboard').click()
          cy.getByTestID('context-export-dashboard').click()
          cy.getByTestID('button-copy').click()
          cy.getByTestID('notification-success--children').should('be.visible')
        })
      })
    })
  })
})
