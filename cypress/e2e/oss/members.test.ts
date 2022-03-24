import {Organization} from '../../../src/types'

// a generous commitment to delivering this page in a loaded state
const PAGE_LOAD_SLA = 10000

describe('Member List', () => {
  beforeEach(() => {
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(({id}: Organization) =>
          cy.fixture('routes').then(({orgs}) => {
            cy.visit(`${orgs}/${id}/members`)
            cy.getByTestID('tree-nav')
            cy.get('[data-testid="resource-list--body"]', {
              timeout: PAGE_LOAD_SLA,
            })
          })
        )
      })
    )
  })

  it('can sort by name', () => {
    // in ascending order

    // in descending order
  })

  it('can sort by role', () => {
    // in ascending order
    // in descending order
  })

  it('can delete a member', () => {})
})
