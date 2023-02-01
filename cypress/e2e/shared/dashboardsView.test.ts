import {Organization} from '../../../src/types'
import {points} from '../../support/commands'

const isIOxOrg = Boolean(Cypress.env('ioxUser'))
const isTSMOrg = !isIOxOrg

const setupTest = () => {
  cy.flush()
  cy.signin()
  cy.fixture('routes').then(({orgs}) => {
    cy.get<Organization>('@org').then(({id: orgID}: Organization) => {
      cy.visit(`${orgs}/${orgID}/dashboards-list`)
      cy.getByTestID('tree-nav')
    })
  })
}

describe('Dashboard - TSM', () => {
  beforeEach(() => {
    cy.skipOn(isIOxOrg)

    setupTest()
  })

  it("can edit a dashboard's name", () => {
    cy.get<Organization>('@org').then(({id: orgID}: Organization) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('tree-nav')
        })
      })
    })

    const newName = 'new 🅱️ashboard'

    cy.get('.renamable-page-title').click()
    cy.get('.cf-input-field').type(newName).type('{enter}')

    cy.fixture('routes').then(({orgs}) => {
      cy.get<Organization>('@org').then(({id: orgID}: Organization) => {
        cy.visit(`${orgs}/${orgID}/dashboards-list`)
        cy.getByTestID('tree-nav')
      })
    })

    cy.getByTestID('dashboard-card').should('contain', newName)
  })

  it('can create, clone and destroy cells & toggle in and out of presentation mode', () => {
    cy.get<Organization>('@org').then(({id: orgID}: Organization) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('tree-nav')
        })
      })
    })

    // Create View cell
    cy.getByTestID('add-cell--button').click()
    cy.getByTestID('save-cell--button').click()
    cy.getByTestID('cell-context--toggle').last().click()
    cy.getByTestID('cell-context--configure').click()

    // Rename View cell
    const xyCellName = 'Line Graph'
    cy.getByTestID('page-title').click()
    cy.getByTestID('renamable-page-title--input')
      .clear()
      .type(xyCellName)
      .type('{enter}')
    cy.getByTestID('save-cell--button').click()

    const xyCell = `cell ${xyCellName}`

    cy.getByTestID(xyCell).within(([$cell]) => {
      const prevWidth = $cell.clientWidth
      const prevHeight = $cell.clientHeight
      cy.wrap(prevWidth).as('prevWidth')
      cy.wrap(prevHeight).as('prevHeight')
    })

    // Resize Cell
    cy.getByTestID(xyCell).within(() => {
      cy.get('.react-resizable-handle')
        .trigger('mousedown', {which: 1, force: true})
        .trigger('mousemove', {
          clientX: 800,
          clientY: 800,
          force: true,
        })
        .trigger('mouseup', {force: true})
    })

    cy.getByTestID(xyCell).within(([$cell]) => {
      const currWidth = $cell.clientWidth
      const currHeight = $cell.clientHeight
      cy.get('@prevWidth').should('be.lessThan', currWidth)
      cy.get('@prevHeight').should('be.lessThan', currHeight)
    })

    // Note cell
    const noteText = 'this is a note cell'
    const headerPrefix = '#'

    cy.getByTestID('add-note--button').click()
    cy.getByTestID('note-editor--overlay').monacoType(
      `${headerPrefix} ${noteText}`
    )

    cy.getByTestID('note-editor--overlay').within(() => {
      cy.getByTestID('note-editor--preview').contains(noteText)
      cy.getByTestID('note-editor--preview').should('not.contain', headerPrefix)

      cy.getByTestID('save-note--button').click()
    })

    // Note Cell controls
    cy.getByTestID('add-note--button').click()
    cy.getByTestID('note-editor--overlay').should('be.visible')
    cy.getByTestID('cancel-note--button').click()
    cy.getByTestID('note-editor--overlay').should('not.exist')

    const noteCell = 'cell--view-empty markdown'
    cy.getByTestID(noteCell).contains(noteText)
    cy.getByTestID(noteCell).should('not.contain', headerPrefix)

    // Drag and Drop Cell
    cy.getByTestID('cell--draggable Note')
      .trigger('mousedown', {which: 1, force: true})
      .trigger('mousemove', {clientX: -800, clientY: -800, force: true})
      .trigger('mouseup', {force: true})

    cy.getByTestID(noteCell).within(([$cell]) => {
      const noteTop = $cell.getBoundingClientRect().top
      const noteBottom = $cell.getBoundingClientRect().bottom
      cy.wrap(noteTop).as('noteTop')
      cy.wrap(noteBottom).as('noteBottom')
    })

    cy.getByTestID(xyCell).within(([$cell]) => {
      const xyCellTop = $cell.getBoundingClientRect().top
      const xyCellBottom = $cell.getBoundingClientRect().bottom
      cy.get('@noteTop').should('be.lessThan', xyCellTop)
      cy.get('@noteBottom').should('be.lessThan', xyCellBottom)
    })

    // toggle presentation mode
    cy.getByTestID('collapsible_menu').click()
    cy.getByTestID('presentation-mode-toggle').click()

    // ensure a notification is sent when toggling to presentation mode
    cy.getByTestID('notification-primary').should('be.visible')
    cy.get('.cf-notification--dismiss').click()

    // escape to toggle the presentation mode off
    cy.get('body').trigger('keyup', {
      keyCode: 27,
      code: 'Escape',
      key: 'Escape',
    })

    // Edit note cell
    cy.getByTestID('cell-context--toggle').last().click()
    cy.getByTestID('cell-context--note').click()

    // Note cell
    const noteText2 = 'changed text'
    const headerPrefix2 = '-'

    cy.getByTestID('note-editor--overlay').monacoType(
      `\n${headerPrefix2} ${noteText2}`
    )

    cy.getByTestID('note-editor--overlay').within(() => {
      cy.getByTestID('note-editor--preview').contains(noteText2)
      cy.getByTestID('note-editor--preview').should(
        'not.contain',
        headerPrefix2
      )

      cy.getByTestID('save-note--button').click()
    })

    cy.getByTestID('note-editor--overlay').should('not.exist')
    cy.getByTestID('cell Name this Cell').should('contain', noteText2)

    // Remove Note cell
    cy.getByTestID('cell-context--toggle').last().click()
    cy.getByTestID('cell-context--delete').click()
    cy.getByTestID('cell-context--delete-confirm').click()
    cy.getByTestID('notification-primary').should('be.visible')
    cy.get('.cf-notification--dismiss').click()

    // Clone View cell
    cy.getByTestID('cell-context--toggle').last().click()
    cy.getByTestID('cell-context--clone').click()

    // Ensure that the clone exists
    cy.getByTestID('cell Line Graph (Clone)').should('exist')

    // Remove View cells
    cy.getByTestID('cell-context--toggle').first().click()
    cy.getByTestID('cell-context--delete').click()
    cy.getByTestID('cell-context--delete-confirm').click()
    cy.getByTestID('notification-primary').should('be.visible')
    cy.get('.cf-notification--dismiss').click()

    cy.getByTestID('cell-context--toggle').last().click()
    cy.getByTestID('cell-context--delete').click()
    cy.getByTestID('cell-context--delete-confirm').click()
    cy.getByTestID('notification-primary').should('be.visible')
    cy.get('.cf-notification--dismiss').click()

    cy.getByTestID('empty-state').should('exist')
  })

  // fix for https://github.com/influxdata/influxdb/issues/15239
  it('retains the cell content after canceling an edit to the cell', () => {
    cy.get<Organization>('@org').then(({id: orgID}: Organization) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('tree-nav')
        })
      })
    })

    // Add an empty cell
    cy.getByTestID('add-cell--button').click()
    cy.getByTestID('save-cell--button').click()
    cy.getByTestIDSubStr('cell--view-empty').should('be.visible')

    cy.getByTestIDSubStr('cell--view-empty')
      .invoke('text')
      .then(cellContent => {
        // cellContent is yielded as a cutesy phrase from src/shared/copy/cell

        // open Cell Editor Overlay
        cy.getByTestID('cell-context--toggle').last().click()
        cy.getByTestID('cell-context--configure').click()

        // Cancel edit
        cy.getByTestID('cancel-cell-edit--button').click()

        // Cell content should remain
        cy.getByTestIDSubStr('cell--view-empty').contains(cellContent)
      })
  })

  it('can create a view through the API', () => {
    cy.get<Organization>('@org').then(({id: orgID = ''}: Organization) => {
      cy.createDashWithViewAndVar(orgID)
      cy.fixture('routes').then(({orgs}) => {
        cy.visit(`${orgs}/${orgID}/dashboards-list`)
        cy.getByTestID('tree-nav')
        cy.getByTestID('dashboard-card--name').click()
        cy.get('.cell--view').should('have.length', 1)
      })
    })
  })

  it("should return empty table parameters when query hasn't been submitted", () => {
    cy.get<Organization>('@org').then(({id: orgID}: Organization) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('tree-nav')
        })
      })
    })

    cy.getByTestID('add-cell--button').click()
    cy.get('.view-options').should('not.exist')
    cy.getByTestID('cog-cell--button').should('have.length', 1).click()
    // should toggle the view options
    cy.get('.view-options').should('exist')
    cy.getByTestID('dropdown--button').contains('Graph').click()
    cy.getByTestID('view-type--table')
      .contains('Table')
      .should('have.length', 1)
      .click()

    cy.getByTestID('empty-state--text')
      .contains('This query returned no columns')
      .should('exist')
  })

  // based on issue #18339
  it('should save a time format change and show in the dashboard cell card', () => {
    const numLines = 360
    cy.writeData(points(numLines))
    cy.get<Organization>('@org').then(({id: orgID}: Organization) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('tree-nav')
        })
      })
    })
    const timeFormatOriginal = 'YYYY-MM-DD HH:mm:ss'
    const timeFormatNew = 'hh:mm a'

    cy.log('creating new dashboard cell')
    cy.getByTestID('add-cell--button').click()
    cy.getByTestID(`selector-list m`).click()
    cy.getByTestID('selector-list v').click()
    cy.getByTestID(`selector-list tv1`).click()
    cy.getByTestID('time-machine-submit-button').click()
    cy.getByTestID('view-type--dropdown').click()
    cy.getByTestID('view-type--line-plus-single-stat').click()

    cy.log('asserting default graph time format, saving')
    cy.getByTestID('cog-cell--button').click()
    cy.getByTestID('dropdown--button').should('contain', timeFormatOriginal)
    cy.getByTestID(`save-cell--button`).click()

    cy.log('changing graph time format')
    cy.getByTestID(`cell-context--toggle`).click()
    cy.getByTestID(`cell-context--configure`).click()
    cy.getByTestID('dropdown--button').should('contain', timeFormatOriginal)
    cy.getByTestID('dropdown--button').contains(timeFormatOriginal).click()
    cy.getByTestID('dropdown-item').contains(timeFormatNew).click()
    cy.getByTestID('dropdown--button').should('contain', timeFormatNew)
    cy.getByTestID(`save-cell--button`).click()

    cy.log('asserting the time format has not changed after saving the cell')
    cy.getByTestID(`cell-context--toggle`).click()
    cy.getByTestID(`cell-context--configure`).click()
    cy.getByTestID('dropdown--button').should('contain', timeFormatNew)
  })

  it('can sort values in a dashboard cell', () => {
    const numLines = 360
    cy.writeData(points(numLines))
    cy.get<Organization>('@org').then(({id: orgID}: Organization) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('tree-nav')
        })
      })
    })

    // creating new dashboard cell
    cy.getByTestID('add-cell--button').click()
    cy.getByTestID(`selector-list m`)
      .click()
      .getByTestID('selector-list v')
      .click()
      .getByTestID(`selector-list tv1`)
      .click()
    cy.getByTestID('time-machine-submit-button').click()

    // change to table graph type
    cy.getByTestID('view-type--dropdown').click()
    cy.getByTestID('view-type--table').click()
    cy.getByTestID(`save-cell--button`).click()

    // assert sorting
    cy.getByTestID(`cell Name this Cell`)
    cy.getByTestID('_value-table-header table-graph-cell')
      .should('exist')
      .click()
    cy.getByTestID('_value-table-header table-graph-cell__sort-asc')
      .should('exist')
      .click()
    cy.getByTestID('_value-table-header table-graph-cell__sort-desc').should(
      'exist'
    )
  })

  it('changes cell view type', () => {
    const dashName = 'dashboard'
    const dropdowns = [
      'band',
      'gauge',
      'line-plus-single-stat',
      'heatmap',
      'histogram',
      'mosaic',
      'scatter',
      'single-stat',
      'table',
    ]

    cy.get<Organization>('@org').then(({id}: Organization) =>
      cy.createDashboard(id, dashName).then(({body}) => {
        cy.createCell(body.id).then(cell1Resp =>
          cy.createView(body.id, cell1Resp.body.id).then(() =>
            cy.fixture('routes').then(({orgs}) =>
              cy.get<Organization>('@org').then(({id}: Organization) => {
                cy.visit(`${orgs}/${id}/dashboards/${body.id}`)
                cy.getByTestID('tree-nav').then(() =>
                  cy
                    .intercept('POST', '/api/v2/query?*')
                    .as('loadQuery')
                    .then(() =>
                      cy
                        .writeLPDataFromFile({
                          filename: 'data/wumpus01.lp',
                          offset: '20m',
                          stagger: '1m',
                        })
                        .should('equal', 'success')
                    )
                )
              })
            )
          )
        )
      })
    )

    // graph
    cy.getByTestID('cell-context--toggle').click()
    cy.getByTestID('cell-context--configure').click()
    cy.getByTestID('page-header').should('be.visible')
    cy.getByTestID('selector-list wumpus').click()
    cy.getByTestID('selector-list dur').click()
    cy.getByTestID('time-machine-submit-button').click()
    cy.getByTestID('save-cell--button').click()
    cy.wait('@loadQuery')
    cy.getByTestID('giraffe-layer-line').should('be.visible')
    for (let i: number = 0; i < dropdowns.length; i++) {
      cy.getByTestID('cell-context--toggle').click()
      cy.getByTestID('cell-context--configure').click()
      cy.getByTestID('page-header').should('be.visible')
      cy.getByTestID('view-type--dropdown').click()
      cy.getByTestID('dropdown-menu').should('be.visible')
      cy.getByTestID(`view-type--${dropdowns[i]}`).click()
      cy.getByTestID('time-machine-submit-button').click()
      cy.getByTestID('save-cell--button').click()
      cy.wait('@loadQuery')
      cy.getByTestID(`cell--view-empty ${dropdowns[i]}`).should('be.visible')
    }
  })

  it('creates a dashboard to test light/dark mode toggle', () => {
    // dashboard creation
    cy.get<Organization>('@org').then(({id: orgID}: Organization) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('tree-nav')
        })
      })
    })

    cy.getByTestID('collapsible_menu').click()

    cy.get('label[title="Light Mode"]').click() // light mode
    cy.getByTestID('app-wrapper')
      .invoke('css', 'background-color')
      .should('equal', 'rgb(241, 241, 243)')
    cy.getByTestID('app-wrapper')
      .invoke('css', 'color')
      .should('equal', 'rgb(104, 104, 123)')

    cy.get('label[title="Dark Mode"]').click() // dark mode
    cy.getByTestID('app-wrapper')
      .invoke('css', 'background-color')
      .should('equal', 'rgb(7, 7, 14)')
    cy.getByTestID('app-wrapper')
      .invoke('css', 'color')
      .should('equal', 'rgb(241, 241, 243)')
  })

  describe('clone cell', () => {
    let otherBoardID: string
    let orgId: string | undefined
    let allOrgs: any

    beforeEach(() => {
      cy.get<Organization>('@org').then(({id: orgID, name}: Organization) => {
        orgId = orgID
        cy.createDashboard(orgID, 'other-dashboard').then(({body}) => {
          otherBoardID = body.id
        })
        cy.createDashboard(orgID).then(({body}) => {
          cy.fixture('routes').then(({orgs}) => {
            allOrgs = orgs
            cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
            cy.getByTestID('tree-nav')
          })
        })
        cy.createBucket(orgID, name, 'schmucket')
        const now = Date.now()
        cy.writeData(
          [
            `test,container_name=cool dopeness=12 ${now - 1000}000000`,
            `test,container_name=beans dopeness=18 ${now - 1200}000000`,
            `test,container_name=cool dopeness=14 ${now - 1400}000000`,
            `test,container_name=beans dopeness=10 ${now - 1600}000000`,
          ],
          'schmucket'
        )
      })
      cy.getByTestID('button').click()
      cy.getByTestID('switch-to-script-editor').should('be.visible')
      cy.getByTestID('switch-to-script-editor').click()
      cy.getByTestID('toolbar-tab').click()
      const query1 = `from(bucket: "schmucket")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["container_name"] == "cool")`
      cy.getByTestID('flux-editor').monacoType(`{selectall}{del}${query1}`)
      cy.getByTestID('page-title').click()
      cy.getByTestID('renamable-page-title--input').clear().type('blah{enter}')
      cy.getByTestID('save-cell--button').click()
      cy.getByTestID('cell-context--toggle').first().click()
      cy.getByTestID('cell-context--copy').click()
    })

    it('clones a cell to another dashboard and displays it there', () => {
      const cloneNamePrefix = `cell blah (cloned at `
      cy.getByTestID('typeAhead-dropdown--button').click()
      cy.get(`#${otherBoardID}`).click()
      cy.intercept('PATCH', '/api/v2/dashboards/*/cells/*/view').as('setView')
      cy.getByTestID('confirm-clone-cell-button').click()

      cy.wait('@setView')
      cy.visit(`${allOrgs}/${orgId}/dashboards/${otherBoardID}`)
      cy.getByTestID('tree-nav')
      cy.getByTestIDHead(cloneNamePrefix).should('be.visible')
    })

    it('moves a cell to another dashboard and removes it from the current one', () => {
      const cloneNamePrefix = `cell blah (cloned at `
      cy.getByTestID('typeAhead-dropdown--button').click()
      cy.get(`#${otherBoardID}`).click()
      cy.getByTestID('cell-clone-move-cell').click()
      cy.intercept('PATCH', '/api/v2/dashboards/*/cells/*/view').as('setView')
      cy.getByTestID('confirm-clone-cell-button').click()
      cy.wait('@setView')
      cy.visit(`${allOrgs}/${orgId}/dashboards/${otherBoardID}`)
      cy.getByTestID('tree-nav')
      cy.getByTestIDHead(cloneNamePrefix).should('be.visible')
      cy.go('back')
      cy.getByTestID('tree-nav')
      cy.getByTestID('empty-state--text').should('be.visible')
    })
  })
})

describe('Dashboard - IOx', () => {
  it('should not show Dashboard', () => {
    cy.skipOn(isTSMOrg)

    setupTest()
    cy.contains('404: Page Not Found')
  })
})
