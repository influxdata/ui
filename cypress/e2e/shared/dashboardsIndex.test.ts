import {Organization} from '../../../src/types'

const newLabelName = 'click-me'
const dashboardName = 'Bee Happy'
const dashboardName2 = 'test dashboard'
const dashSearchName = 'bEE'

describe('Dashboards', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() =>
      cy.fixture('routes').then(({orgs}) => {
        cy.get('@org').then(({id}: Organization) => {
          cy.visit(`${orgs}/${id}/dashboards-list`)
        })
      })
    )
  })

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

  // TODO - fix failing test (fails only in circleci - cloud-e2e-firefox)
  it.skip('can CRUD dashboards from empty state, header, and a Template', () => {
    const newName = 'new 🅱️ashboard'

    // Create from empty state
    cy.getByTestID('empty-dashboards-list').within(() => {
      cy.getByTestID('add-resource-dropdown--button').click()
    })

    cy.getByTestID('add-resource-dropdown--new')
      .click()
      .then(() => {
        cy.fixture('routes').then(({orgs}) => {
          cy.get('@org').then(({id}: Organization) => {
            cy.visit(`${orgs}/${id}/dashboards-list`)
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
    cy.getByTestID('context-menu-item-export').click({force: true})
    cy.getByTestID('export-overlay--text-area').should('exist')
    cy.get('.cf-overlay--dismiss').click()

    // Create from header
    cy.getByTestID('add-resource-dropdown--button').click()
    cy.getByTestID('add-resource-dropdown--new').click()

    cy.fixture('routes').then(({orgs}) => {
      cy.get('@org').then(({id}: Organization) => {
        cy.visit(`${orgs}/${id}/dashboards-list`)
      })
    })

    cy.getByTestID('dashboard-card').should('have.length', 2)

    const dashboardDescription = 'this dashboard contains secret information'

    // change description
    cy.getByTestID('resource-list--editable-description')
      .first()
      .click('topLeft')
      .within(() => {
        cy.get('[placeholder="Describe Name this Dashboard"]')
          .type(dashboardDescription)
          .type('{enter}')
      })
    cy.getByTestID('resource-list--editable-description').should(
      'contain',
      dashboardDescription
    )

    // remove description
    cy.getByTestID('resource-list--editable-description')
      .first()
      .click('topLeft')
      .within(() => {
        cy.get('[placeholder="Describe Name this Dashboard"]')
          .clear()
          .type('{enter}')
      })
    cy.getByTestID('resource-list--editable-description').should(
      'not.contain',
      dashboardDescription
    )

    // Delete dashboards
    cy.getByTestID('dashboard-card')
      .first()
      .trigger('mouseover')
      .within(() => {
        cy.getByTestID('context-delete-menu').click()
        cy.getByTestID('context-delete-dashboard').click()
      })

    cy.getByTestID('dashboard-card')
      .first()
      .trigger('mouseover')
      .within(() => {
        cy.getByTestID('context-delete-menu').click()
        cy.getByTestID('context-delete-dashboard').click()
      })

    cy.getByTestID('empty-dashboards-list').should('exist')
  })

  // TODO - fix failing test (fails only in circleci - cloud-e2e-firefox)
  it.skip('can import as JSON or file', () => {
    const checkImportedDashboard = () => {
      // wait for importing done
      cy.wait(200)
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
        cy.get('@org').then(({id}: Organization) => {
          cy.visit(`${orgs}/${id}/dashboards-list`)
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
        cy.getByTestID('context-delete-menu').click()
        cy.getByTestID('context-delete-dashboard').click()
      })

    // dasboard no longer exists
    cy.getByTestID('dashboard-card').should('not.exist')

    // import dashboard as json
    cy.getByTestID('add-resource-dropdown--button')
      .first()
      .click()
    cy.getByTestID('add-resource-dropdown--import').click()

    cy.getByTestID('select-group--option')
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
    beforeEach(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.createDashboard(id, dashboardName).then(({body}) => {
          cy.createAndAddLabel('dashboards', id, body.id, newLabelName)
        })

        cy.createDashboard(id, dashboardName2).then(({body}) => {
          cy.createAndAddLabel('dashboards', id, body.id, 'bar')
        })
      })

      cy.fixture('routes').then(({orgs}) => {
        cy.get('@org').then(({id}: Organization) => {
          cy.visit(`${orgs}/${id}/dashboards-list`)
        })
      })
    })

    it('can clone a dashboard', () => {
      cy.getByTestID('dashboard-card').should('have.length', 2)

      cy.getByTestID('clone-dashboard')
        .first()
        .click({force: true})
        .wait(100)

      cy.fixture('routes').then(({orgs}) => {
        cy.get('@org').then(({id}: Organization) => {
          cy.visit(`${orgs}/${id}/dashboards-list`)
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
        cy.contains('Settings').click()
        cy.contains(
          "Looks like there aren't any Variables, why not create one?"
        )
        // return to dashboards page
        cy.contains('Boards').click()
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

        cy.get('@org').then(({id}: Organization) => {
          cy.createLabel(labelName, id).then(() => {
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

        cy.get('@org').then(({id}: Organization) => {
          cy.createLabel(labelName, id).then(() => {
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

        cy.get('@org').then(({id}: Organization) => {
          cy.createLabel(labelName, id).then(() => {
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
    })

    it('can list and search dashboards on home page', () => {
      cy.getByTestID('tree-nav--header').click()

      cy.get('.recent-dashboards--filter')
        .parent()
        .within(() => {
          const dashboardIsVisible = (name: string, isVisible = true) => {
            cy.contains(name).should(isVisible ? 'be.visible' : 'not.exist')
          }

          dashboardIsVisible(dashboardName)
          dashboardIsVisible(dashboardName2)

          cy.get('.recent-dashboards--filter').type(dashSearchName)

          dashboardIsVisible(dashboardName)
          dashboardIsVisible(dashboardName2, false)
        })
    })
  })

  it('should redirect to the dashboard list when dashboard not exist', () => {
    const nonexistentID = '0499992503cd3700'

    // visiting the dashboard edit page
    cy.get('@org').then(({id}: Organization) => {
      cy.fixture('routes').then(({orgs, dashboards}) => {
        cy.visit(`${orgs}/${id}${dashboards}/${nonexistentID}`)
        cy.url().should('include', `${orgs}/${id}/dashboards-list`)
      })
    })
  })
})
