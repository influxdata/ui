describe('Help bar support for Contract users', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(() => {
          cy.quartzProvision({
            accountType: 'contract',
          }).then(() => {
            cy.visit('/')
            cy.getByTestID('nav-item-support').should('be.visible')
          })
        })
      })
    )
  )

  it('Allows Contract users to submit a support request', () => {
    const description =
      'here is a description from user about something they need help with'
    const subject = 'testing help bar'

    cy.getByTestID('nav-item-support')
      .get('.cf-tree-nav--sub-menu-trigger')
      .last()
      .trigger('mouseover')
    cy.getByTestID('nav-subitem-contact-support')
      .eq(1) // clockface duplicates tree-nav test ids so index specification is required
      .click({force: true})
    cy.getByTestID('contact-support-overlay-header').should('exist')

    cy.getByTestID('contact-support-subject-input').clear().type(subject)
    cy.getByTestID('severity-level-dropdown')
      .within(() => {
        cy.getByTestID('dropdown--button').click()
        cy.getByTitle('1 - Critical').click()
      })
      .then(() => {
        cy.getByTestID('contact-support-description--textarea')
          .clear()
          .type(description)
        cy.getByTestID('contact-support--submit').should('not.be.disabled')
      })
  })
})
