import {Organization} from '../../../src/types'

describe('Tasks List Page', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.visit(`orgs/${id}/tasks`)
      })
    })
  })

  it('should render Set My Limits', () => {
    cy.getByTestID('search-widget').should('have.value', '')

    const tasks = [
      {
        name: 'task1',
        every: '3h30s',
        offset: '20m',
        query: 'task query1',
      },
      {
        name: 'task2',
        every: '3h',
        offset: '30m',
        query: 'task query2',
      },
    ]

    tasks.forEach(task => {
      cy.getByTestID('add-resource-dropdown').click()
      cy.getByTestID('add-resource-dropdown--new').click()

      // Fill Task Form
      cy.getByTestID('task-form-name')
        .clear()
        .type(task.name)
      cy.getByTestID('task-form-schedule-input')
        .clear()
        .type(task.every)
      cy.getByTestID('task-form-offset-input')
        .clear()
        .type(task.offset)
      cy.getByTestID('flux-editor').type(task.query)

      // Save Task
      cy.getByTestID('task-save-btn').click()
    })

    // Search for a task
    const task1Name = tasks[0].name.slice(-4)
    cy.getByTestID('search-widget').type(task1Name)
    cy.getByTestID('resource-list--body')
      .children()
      .should('have.length', 1)
    cy.getByTestID('resource-list--body')
      .children()
      .getByTestID('task-card--name')
      .click()

    // Navigate away from current page back to Tasks List page
    cy.getByTestID('task-cancel-btn').click()
    cy.getByTestID('search-widget').should('have.value', task1Name)
    cy.getByTestID('resource-list--body')
      .children()
      .should('have.length', 1)
    cy.getByTestID('resource-list--body')
      .children()
      .getByTestID('task-card--name')
      .contains(tasks[0].name)

    // Search for a different task
    cy.getByTestID('search-widget')
      .clear()
      .type(tasks[1].name)
    cy.getByTestID('resource-list--body')
      .children()
      .should('have.length', 1)
    cy.getByTestID('resource-list--body')
      .children()
      .getByTestID('task-card--name')
      .click()

    // Navigate away from current page back to Tasks List page
    cy.getByTestID('task-cancel-btn').click()
    cy.getByTestID('search-widget').should('have.value', tasks[1].name)
    cy.getByTestID('resource-list--body')
      .children()
      .should('have.length', 1)
    cy.getByTestID('resource-list--body')
      .children()
      .getByTestID('task-card--name')
      .contains(tasks[1].name)
  })
})
