describe('Dashboard', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() =>
      cy.fixture('routes').then(({orgs}) => {
        cy.get('@org').then(({id: orgID}: any) => {
          cy.visit(`${orgs}/${orgID}/dashboards-list`)
        })
      })
    )
  })

  it('does render image tags in markdown preview', () => {
    cy.get('@org').then(({id: orgID}: any) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
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
      cy.getByTestID('note-editor--preview')
        .find('img')
        .should('be.visible')
      cy.getByTestID('save-note--button').click()
    })
    cy.getByTestID('cell--view-empty markdown')
      .find('img')
      .should('be.visible')
  })
})
