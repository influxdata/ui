import {Organization} from '../../../src/types'
describe('Dashboard bad test', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.fixture('routes').then(({orgs}) => {
      cy.get('@org').then(({id: orgID}: Organization) => {
        cy.visit(`${orgs}/${orgID}/dashboards-list`)
        cy.getByTestID('tree-nav')
      })
    })
  })

  it('can create, clone and destroy cells & toggle in and out of presentation mode', () => {
    cy.get('@org').then(({id: orgID}: Organization) => {
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
    cy.getByTestID('cell-context--toggle')
      .last()
      .click()
    cy.getByTestID('cell-context--configure').click()

    // Rename View cell
    const xyCellName = 'Line Graph'
    cy.getByTestID('overlay').within(() => {
      cy.getByTestID('page-title').click()
      cy.getByTestID('renamable-page-title--input')
        .clear()
        .type(xyCellName)
        .type('{enter}')
      cy.getByTestID('save-cell--button').click()
    })

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
    cy.getByTestID('notification-primary--children').should('exist')
    // escape to toggle the presentation mode off
    cy.get('body').trigger('keyup', {
      keyCode: 27,
      code: 'Escape',
      key: 'Escape',
    })

    // Edit note cell
    cy.getByTestID('cell-context--toggle')
      .last()
      .click()
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

    cy.getByTestID('cell Name this Cell').should('not.contain', noteText)
    cy.getByTestID('cell Name this Cell').should('contain', noteText2)

    // Remove Note cell
    cy.getByTestID('cell-context--toggle')
      .last()
      .click()
    cy.getByTestID('cell-context--delete').click()
    cy.getByTestID('cell-context--delete-confirm').click()
    cy.wait(200)

    // Clone View cell
    cy.getByTestID('cell-context--toggle')
      .last()
      .click()
    cy.getByTestID('cell-context--clone').click()

    // Ensure that the clone exists
    cy.getByTestID('cell Line Graph (Clone)').should('exist')
    // Remove View cells
    cy.getByTestID('cell-context--toggle')
      .first()
      .click()
    cy.getByTestID('cell-context--delete').click()
    cy.getByTestID('cell-context--delete-confirm').click()
    cy.getByTestID('cell-context--toggle')
      .last()
      .click()
    cy.getByTestID('cell-context--delete').click()
    cy.getByTestID('cell-context--delete-confirm').click()

    cy.getByTestID('empty-state').should('exist')
  })
})
