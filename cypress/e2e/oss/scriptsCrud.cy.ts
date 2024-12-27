describe('Script Builder -- scripts crud on cloud', () => {
  before(() => {
    cy.flush().then(() => cy.signin())
  })

  beforeEach(() => {
    cy.scriptsLoginWithFlags({}).then(() => {
      cy.switchToDataExplorer('new')
    })
  })

  it('should not have the scripts crud options', () => {
    cy.getByTestID('script-query-builder--open-script').should('not.exist')
    cy.getByTestID('script-query-builder--save-script').should('not.exist')
    cy.getByTestID('script-query-builder--edit-script').should('not.exist')
  })
})
