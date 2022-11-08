import {Organization} from '../../../src/types'

describe('Paginating tasks', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.get<Organization>('@org').then(({id: orgID}: Organization) =>
      cy
        .createToken(orgID, 'test token', 'active', [
          {action: 'write', resource: {type: 'views', orgID}},
          {action: 'write', resource: {type: 'documents', orgID}},
          {action: 'write', resource: {type: 'tasks', orgID}},
        ])
        .then(({body}) => {
          cy.wrap(body.token).as('token')
        })
    )

    cy.fixture('routes').then(({orgs}) => {
      cy.get<Organization>('@org').then(({id}: Organization) => {
        cy.visit(`${orgs}/${id}/tasks`)
        cy.getByTestID('tree-nav')
      })
    })

    cy.get<Organization>('@org').then(({id}: Organization) => {
      cy.get<string>('@token').then(token => {
        cy.createTask(token, id, 'Task 1')
        cy.createTask(token, id, 'Task 2')
        cy.createTask(token, id, 'Task 3')
        cy.createTask(token, id, 'Task 4')
        cy.createTask(token, id, 'Task 5')
        cy.createTask(token, id, 'Task 6')
        cy.createTask(token, id, 'Task 7')
        cy.createTask(token, id, 'Task 8')
        cy.createTask(token, id, 'Task 9')
        cy.createTask(token, id, 'Task 10')
        cy.createTask(token, id, 'Task 11')
        cy.createTask(token, id, 'Task 12')
        cy.createTask(token, id, 'Task 13')
        cy.createTask(token, id, 'Task 14')
        cy.createTask(token, id, 'Task 15')
        cy.createTask(token, id, 'Task 16')
        cy.createTask(token, id, 'Task 17')
        cy.createTask(token, id, 'Task 18')
        cy.createTask(token, id, 'Task 19')
        cy.createTask(token, id, 'Task 20')
        cy.createTask(token, id, 'Task 21')
      })
    })
    cy.reload()
  })

  it('can paginate between pages of 10 tasks', () => {
    cy.getByTestID('task-card').should('have.length', 10)

    cy.getByTestID('pagination-direction-item').last().click()
    cy.getByTestID('task-card').should('have.length', 10)

    cy.getByTestID('pagination-direction-item').last().click()
    cy.getByTestID('task-card').should('have.length', 1).contains('Task 21')

    // reloading should put us on the last page we were on
    cy.reload()
    cy.getByTestID('task-card').should('have.length', 1).contains('Task 21')

    cy.getByTestID('search-widget').type('task 1')

    // filtering should reduce the page count from 3 to 2 and put us on the last page
    cy.getByTestID('pagination-item').should('have.length', 2)
    cy.getByTestID('task-card').should('have.length', 1).contains('Task 19')

    cy.getByTestID('pagination-direction-item').first().click()
    cy.getByTestID('task-card').should('have.length', 10)

    cy.getByTestID('task-card').contains('Task 1')
    cy.getByTestID('task-card').contains('Task 18')

    cy.getByTestID('dismiss-button').click()
    cy.getByTestID('pagination-item').should('have.length', 3)
  })
})
