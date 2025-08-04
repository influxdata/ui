const setupTest = () => {
  cy.flush().then(() =>
    cy.signin().then(() => {
      cy.get('@org').then(({id}) => {
        cy.visit(`/orgs/${id}/accounts/orglist`)
      })
    })
  )
}

const filterSearchTerm = (sortMethod: string, firstResult: string) => {
  cy.getByTestID('resource-sorter--button').should('be.visible').click()

  cy.contains(sortMethod).click()

  cy.getByTestID('account--organizations-tab-orgs-card')
    .first()
    .contains(firstResult)
}

const testSearchTerm = (searchTerm: string, expectedResults: string[]) => {
  const expectedLength = expectedResults.length

  cy.getByTestID('search-widget')
    .should('be.visible')
    .clear()
    .click()
    .type(searchTerm)

  cy.getByTestID('account--organizations-tab-orgs-card')
    .should('have.length', expectedLength)
    .within(() => {
      expectedResults.forEach(result => {
        cy.contains(result)
      })
    })
}

describe('Account / Organizations Tab', () => {
  before(() => {
    setupTest()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('sid')
    // Resolves issue with misidentifying the first org card when the DOM is updated.
    cy.wait(500)
  })

  it('displays a paginated list of provisioned and suspended organizations in the current account', () => {
    cy.getByTestID('account--organizations-tab-orgs-card')
      .first()
      .should('be.visible')
      .and('have.class', 'account--organizations-tab-orgs-card')
      .contains('Pending Organization')

    cy.get('.account--organizations-tab-suspended-orgs-card')
      .should('have.length', 1)
      .and('be.visible')
      .within(() => {
        cy.getByTestID('question-mark-tooltip').click()
        cy.contains('Deletion in progress')
      })

    cy.getByTestID('question-mark-tooltip--tooltip--dialog').contains(
      'Organizations can be reactivated within 7 days of deletion.'
    )

    cy.getByTestID('question-mark-tooltip--tooltip--dialog').within(() => {
      cy.get('a')
        .contains('support@influxdata.com')
        .should('have.attr', 'href', 'mailto:support@influxdata.com')
    })

    cy.getByTestID('pagination-item')
      .should('have.length', 2)
      .contains('2')
      .click()

    cy.url().should('include', 'orglist?page=2')

    cy.getByTestID('pagination-item')
      .should('have.length', 2)
      .contains('1')
      .click()
  })

  it('searches the organizations in the current account', () => {
    // Search by name
    testSearchTerm('Test Org 0', ['Test Org 0'])

    // Search by cloud provider
    testSearchTerm('Azure', [
      'Suspended Organization',
      'Test Org 3',
      'Test Org 4',
      'Test Org 5',
    ])

    // Search by region code
    testSearchTerm('us-west', ['Test Org 3', 'Test Org 9'])

    // Search by human-readable location
    testSearchTerm('Amsterdam', ['Suspended Organization', 'Test Org 4'])

    cy.getByTestID('search-widget').should('be.visible').clear()
  })

  it('sorts the organizations in the current account', () => {
    filterSearchTerm('Name (A ➞ Z)', 'Pending Organization')
    filterSearchTerm('Name (Z ➞ A)', 'Test Org 9')

    filterSearchTerm('Cloud Provider (A ➞ Z)', 'Pending Organization')
    filterSearchTerm('Cloud Provider (Z ➞ A)', 'Test Org 6')

    filterSearchTerm('Region (A ➞ Z)', 'Test Org 5')
    filterSearchTerm('Region (Z ➞ A)', 'Suspended Organization')

    filterSearchTerm('Location (A ➞ Z)', 'Suspended Organization')
    filterSearchTerm('Location (Z ➞ A)', 'Test Org 5')
  })
})
