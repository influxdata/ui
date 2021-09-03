import {Organization} from '../../src/types'

describe('Load Data Sources', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(({id}: Organization) =>
          cy.fixture('routes').then(({orgs}) => {
            cy.visit(`${orgs}/${id}/load-data/sources`)
            cy.getByTestID('tree-nav')
          })
        )
      })
    )
  )

  it('navigate to Client Library details view and render it with essentials', () => {
    cy.getByTestID('write-data--section client-libraries').within(() => {
      cy.getByTestID('square-grid').within(() => {
        cy.getByTestIDSubStr('load-data-item')
          .first()
          .click()
      })
    })

    const contentContainer = cy.getByTestID('load-data-details-content')
    contentContainer.should('exist')
    contentContainer.children().should('exist')

    const logoElement = cy.getByTestID('load-data-details-thumb')
    logoElement.should('exist')
  })

  it('navigate to Telegraf Plugin details view and render it with essentials', () => {
    cy.getByTestID('write-data--section telegraf-plugins').within(() => {
      cy.getByTestID('square-grid').within(() => {
        cy.getByTestIDSubStr('load-data-item')
          .first()
          .click()
      })
    })

    const contentContainer = cy.getByTestID('load-data-details-content')
    contentContainer.should('exist')
    contentContainer.children().should('exist')

    const logoElement = cy.getByTestID('load-data-details-thumb')
    logoElement.should('exist')
  })

  it('let you search things', () => {
    cy.getByTestID('write-data--search').type('diskio')

    cy.getByTestID('write-data--section telegraf-plugins').should('exist')

    cy.getByTestID('write-data--section file-upload').should('not.exist')

    cy.getByTestID('write-data--section client-libraries').should('not.exist')

    cy.getByTestID('load-data-item diskio').should('exist')
  })
})
