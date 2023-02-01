describe.skip('Dashboard', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() =>
        cy.fixture('routes').then(({orgs}) => {
          cy.get('@org').then(({id: orgID}: any) => {
            cy.visit(`${orgs}/${orgID}/dashboards-list`)
            cy.getByTestID('tree-nav')
          })
        })
      )
    )
  )

  it('does not render image tags in markdown preview', () => {
    cy.get('@org').then(({id: orgID}: any) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('tree-nav')
        })
      })
    })

    // Note cell
    const markdownImageWarning =
      "We don't support images in markdown for security purposes"
    const noteText =
      '![](https://icatcare.org/app/uploads/2018/07/Thinking-of-getting-a-cat.png)'

    cy.getByTestID('add-note--button').click()
    cy.getByTestID('note-editor--overlay').within(() => {
      cy.getByTestID('markdown-editor').within(() => {
        cy.get('textarea').type(`${noteText}`, {force: true})
      })
      cy.getByTestID('note-editor--preview').contains(markdownImageWarning)
      cy.getByTestID('note-editor--preview').should('not.contain', noteText)
      cy.getByTestID('save-note--button').click()
    })
    cy.getByTestID('cell--view-empty markdown').contains(markdownImageWarning)
  })

  it.skip('escapes html in markdown editor', () => {
    cy.get('@org').then(({id: orgID}: any) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('tree-nav')
        })
      })
    })

    // Note cell
    const noteText =
      "<img src='https://icatcare.org/app/uploads/2018/07/Thinking-of-getting-a-cat.png'/>"

    cy.getByTestID('add-note--button').click()
    cy.getByTestID('note-editor--overlay').within(() => {
      cy.getByTestID('markdown-editor').within(() => {
        cy.get('textarea').type(`${noteText}`, {force: true})
      })
      cy.getByTestID('note-editor--preview').contains(noteText)
      cy.getByTestID('save-note--button').click()
    })
    cy.getByTestID('cell--view-empty markdown').contains(noteText)
  })
})
