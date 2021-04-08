import {Organization} from '../../../src/types'

describe('Checkout Page', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) =>{
        console.log('Organization:::: ', id)
        cy.visit(`orgs/${id}/tasks`)
      })
    })
  })

  it('should render Set My Limits', () => {
    cy.getByTestID('search-widget').should('have.value', '')
    
    const tasks = [{
      name: 't1',
      every: '3h30s',
      offset: '20m',
      query: 'task query1'
    }, {
      name: 't2',
      every: '3h',
      offset: '30m',
      query: 'task query2'
    }]
    
    tasks.forEach(task => {
      cy.getByTestID('add-resource-dropdown').click()
      cy.getByTestID('add-resource-dropdown--new').click()

      // Fill Task Form
      cy.getByTestID('task-form-name').clear().type(task.name)
      cy.getByTestID('task-form-schedule-input').clear().type(task.every)
      cy.getByTestID('task-form-offset-input').clear().type(task.offset)
      cy.getByTestID('flux-editor').type(task.query)
  
      // Save Task
      cy.getByTestID('task-save-btn').click()
    })

    // Search for a task
    cy.getByTestID('search-widget').type(tasks[0].name)
    cy.getByTestID('resource-list--body').children().should('have.length', 1)
    cy.getByTestID('resource-list--body').children().getByTestID('task-card--name').click()

    // Navigate away from current page back to Tasks List page
    cy.getByTestID('task-cancel-btn').click()
    cy.getByTestID('search-widget').should('have.value', tasks[0].name)

      // Search for a different task
      cy.getByTestID('search-widget').clear().type(tasks[1].name)
      cy.getByTestID('resource-list--body').children().should('have.length', 1)
      cy.getByTestID('resource-list--body').children().getByTestID('task-card--name').click()
  
      // Navigate away from current page back to Tasks List page
      cy.getByTestID('task-cancel-btn').click()
      cy.getByTestID('search-widget').should('have.value', tasks[1].name)
  })
})
