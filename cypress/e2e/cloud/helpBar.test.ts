describe('Help bar support for free account users', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(() => {
          cy.quartzProvision({
            accountType: 'free',
          }).then(() => {
            cy.getByTestID('nav-item-support').should('be.visible')
          })
        })
      })
    )
  )
  it('displays important links for free account users', () => {
    cy.getByTestID('nav-item-support')
      .get('.cf-tree-nav--sub-menu-trigger')
      .eq(3)
      .trigger('mouseover')
    cy.getByTestID('nav-subitem-contact-support')
      .eq(1) // clockface duplicates tree-nav test ids so index specification is required
      .click({force: true})
    cy.getByTestID('free-support-overlay-header').should('exist')

    cy.getByTestID('overlay--container').within(() => {
      cy.getByTestID('free-account-links').contains('InfluxDB Community Forums')
      cy.getByTestID('free-account-links').contains('InfluxDB Slack')
    })
  })
})

describe('Help bar support for PAYG users', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(() => {
          cy.quartzProvision({
            accountType: 'pay_as_you_go',
          }).then(() => {
            cy.visit('/')
            cy.getByTestID('nav-item-support').should('be.visible')
          })
        })
      })
    )
  )

  it('Allows PAYG users to submit a support request', () => {
    const description =
      'here is a description from user about something they need help with'
    const subject = 'testing help bar'

    cy.getByTestID('nav-item-support')
      .get('.cf-tree-nav--sub-menu-trigger')
      .eq(3)
      .trigger('mouseover')
    cy.getByTestID('nav-subitem-contact-support')
      .eq(1) // clockface duplicates tree-nav test ids so index specification is required
      .click({force: true})
    cy.getByTestID('payg-support-overlay-header').should('exist')

    cy.getByTestID('contact-support-subject-input').clear().type(subject)
    cy.getByTestID('severity-level-dropdown')
      .within(() => {
        cy.getByTestID('dropdown--button').click()
        cy.getByTitle('1 - Critical').click()
      })
      .then(() => {
        cy.getByTestID('support-description--textarea')
          .clear()
          .type(description)
        cy.getByTestID('payg-contact-support--submit').should('not.be.disabled')
      })
  })
})
