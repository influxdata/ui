import {Organization} from '../../../src/types'

describe('Pinned Items', () => {
  let orgID: string
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() =>
      cy.fixture('routes').then(() => {
        cy.get('@org').then(({id}: any) => {
          orgID = id
          cy.setFeatureFlags({
            pinnedItems: true,
            docSearchWidget: true,
          }).then(() => {
            cy.getByTestID('tree-nav')
          })
        })
      })
    )
  })

  it('renders a pinned items modal in the homepage with initial empty state', () => {
    cy.getByTestID('pinneditems--emptystate').should(
      'contain.text',
      'Pin a task, dashboard, or notebook here'
    )
  })

  describe('Pin dashboard tests', () => {
    beforeEach(() => {
      cy.createDashboard(orgID).then(() => {
        cy.setFeatureFlags({
          pinnedItems: true,
          docSearchWidget: true,
        }).then(() => {
          cy.getByTestID('nav-item-dashboards').should('be.visible')
          cy.getByTestID('nav-item-dashboards').click()
        })
      })
    })
    it('pins a dashboard to the homepage for easy access as a pinned item', () => {
      cy.getByTestID('dashboard-card')
        .first()
        .trigger('mouseover')
        .within(() => {
          cy.getByTestID('context-pin-menu').click()
          cy.getByTestID('context-pin-dashboard').click()
        })
      cy.visit('/')
      cy.getByTestID('tree-nav')
      cy.getByTestID('pinneditems--container').within(() => {
        cy.getByTestID('pinneditems--card').should('exist')
      })
    })

    it('reflects an edit to the dashboard name on the dashboard card', () => {
      cy.getByTestID('dashboard-card')
        .first()
        .trigger('mouseover')
        .within(() => {
          cy.getByTestID('context-pin-menu').click()
          cy.getByTestID('context-pin-dashboard').click()
        })
      cy.getByTestID('dashboard-card').within(() => {
        cy.getByTestID('dashboard-card--name')
          .first()
          .trigger('mouseover')

        cy.getByTestID('dashboard-card--name-button')
          .first()
          .click()

        cy.intercept('PUT', '**/pinned/*').as('updatePinned')
        cy.get('.cf-input-field')
          .type('Bucks In Six')
          .type('{enter}')
      })
      cy.wait('@updatePinned')
      cy.visit('/')
      cy.getByTestID('tree-nav')
      cy.getByTestID('pinneditems--container').within(() => {
        cy.getByTestID('pinneditems--link').should(
          'contain.text',
          'Bucks In Six'
        )
      })
    })

    it('unpins a card which removes it from the pinned list', () => {
      cy.getByTestID('dashboard-card')
        .first()
        .trigger('mouseover')
        .within(() => {
          cy.getByTestID('context-pin-menu').click()
          cy.getByTestID('context-pin-dashboard').click()
        })
      cy.visit('/')
      cy.getByTestID('tree-nav')
      cy.getByTestID('pinneditems--card')
        .first()
        .trigger('mouseover')
        .within(() => {
          cy.getByTestID('pinneditems-delete--menu').click()
          cy.getByTestID('pinneditems-delete--confirm').click()
        })
      cy.getByTestID('pinneditems--emptystate').should(
        'contain.text',
        'Pin a task, dashboard, or notebook here'
      )
    })

    it('unpins when the underlying resource is removed', () => {
      cy.getByTestID('dashboard-card')
        .first()
        .trigger('mouseover')
        .within(() => {
          cy.getByTestID('context-delete-menu').click()
          cy.getByTestID('context-delete-dashboard').click()
        })

      cy.visit('/')
      cy.getByTestID('tree-nav')
      cy.getByTestID('pinneditems--emptystate').should(
        'contain.text',
        'Pin a task, dashboard, or notebook here'
      )
    })
  })

  describe('Pin task tests', () => {
    let taskName: string
    beforeEach(() => {
      cy.flush()

      cy.signin().then(() => {
        cy.get('@org').then(({id: orgID}: Organization) =>
          cy
            .createToken(orgID, 'test token', 'active', [
              {action: 'write', resource: {type: 'views', orgID}},
              {action: 'write', resource: {type: 'documents', orgID}},
              {action: 'write', resource: {type: 'tasks', orgID}},
            ])
            .then(({body}) => {
              cy.wrap(body.token).as('token')
              cy.getByTestID('tree-nav')
              cy.visit(`/orgs/${orgID}/tasks`)
              cy.getByTestID('tree-nav')
            })
        )
      })

      taskName = 'Task'
      cy.createTaskFromEmpty(taskName, ({name}) => {
        return `import "influxdata/influxdb/v1{rightarrow}
v1.tagValues(bucket: "${name}", tag: "_field"{rightarrow}
from(bucket: "${name}"{rightarrow}
   |> range(start: -2m{rightarrow}`
      })

      cy.getByTestID('task-save-btn').click()

      cy.getByTestID('notification-success--dismiss').click()

      cy.getByTestID('task-card')
        .first()
        .trigger('mouseover')
        .then(() => {
          cy.getByTestID('context-pin-menu').click()
          cy.getByTestID('context-pin-task').click()
        })
    })

    it('can pin a task to the homepage', () => {
      cy.visit('/')
      cy.getByTestID('tree-nav')
      cy.getByTestID('pinneditems--container').within(() => {
        cy.getByTestID('pinneditems--link').should('contain.text', taskName)
      })
    })

    it('reflects an update to the task name in the pinned task link', () => {
      cy.getByTestID('task-card').within(() => {
        cy.getByTestID('task-card--name')
          .first()
          .trigger('mouseover')

        cy.getByTestID('task-card--name-button')
          .first()
          .click()

        cy.intercept('PUT', '**/pinned/*').as('updatePinned')
        cy.get('.cf-input-field')
          .type('Bucks In Six')
          .type('{enter}')
      })
      cy.wait('@updatePinned')
      cy.visit('/')
      cy.getByTestID('tree-nav')
      cy.getByTestID('pinneditems--container').within(() => {
        cy.getByTestID('pinneditems--link').should(
          'contain.text',
          'Bucks In Six'
        )
      })
    })

    it('unpins when the underlying resource is removed', () => {
      cy.getByTestID('task-card')
        .first()
        .trigger('mouseover')
        .within(() => {
          cy.getByTestID('context-delete-menu').click()
          cy.getByTestID('context-delete-task').click()
        })

      cy.visit('/')
      cy.getByTestID('tree-nav')
      cy.getByTestID('pinneditems--emptystate').should(
        'contain.text',
        'Pin a task, dashboard, or notebook here'
      )
    })
  })

  describe('Pin flow tests', () => {
    beforeEach(() => {
      cy.setFeatureFlags({
        notebooks: true,
        simpleTable: true,
        pinnedItems: true,
      }).then(() => {
        cy.getByTestID('nav-item-flows').should('be.visible')
        cy.getByTestID('nav-item-flows').click()
        const now = Date.now()
        cy.writeData(
          [
            `test,container_name=cool dopeness=12 ${now - 1000}000000`,
            `test,container_name=beans dopeness=18 ${now - 1200}000000`,
            `test,container_name=cool dopeness=14 ${now - 1400}000000`,
            `test,container_name=beans dopeness=10 ${now - 1600}000000`,
          ],
          'defbuck'
        )
        cy.getByTestID('create-flow--button')
          .first()
          .click()

        cy.getByTestID('time-machine-submit-button').should('be.visible')
        cy.getByTestID('page-title').click()
        cy.getByTestID('renamable-page-title--input')
          .clear()
          .type('Flow')
          .type('{enter}')
        cy.visit(`/orgs/${orgID}/notebooks`)
      })
    })

    it('pins a notebook to the homepage', () => {
      cy.getByTestID('flow-card--Flow')
        .trigger('mouseover')
        .then(() => {
          cy.getByTestID('context-pin-menu').click()
          cy.getByTestID('context-pin-flow').click()
        })
      cy.visit('/')
      cy.getByTestID('tree-nav')
      cy.getByTestID('pinneditems--container').within(() => {
        cy.getByTestID('pinneditems--type').should('contain.text', 'Notebook')
      })
    })

    it('updates the name when the notebook name is updated', () => {
      cy.getByTestID('flow-card--Flow')
        .trigger('mouseover')
        .then(() => {
          cy.getByTestID('context-pin-menu').click()
          cy.getByTestID('context-pin-flow').click()
        })
      cy.getByTestID('resource-editable-name')
        .first()
        .trigger('mouseover')

      cy.getByTestID('flow-card--name-button')
        .first()
        .click()
      cy.intercept('PUT', '**/pinned/*').as('updatePinned')

      cy.get('.cf-input-field')
        .last()
        .focus()
        .type('Bucks In Six')
        .type('{enter}')
      cy.wait('@updatePinned')
      cy.visit('/')
      cy.getByTestID('tree-nav')
      cy.getByTestID('pinneditems--container').within(() => {
        cy.getByTestID('pinneditems--link').should(
          'contain.text',
          'Bucks In Six'
        )
      })
    })

    it('unpins when the resource it is pointing to is deleted', () => {
      cy.getByTestID('resource-editable-name')
        .first()
        .trigger('mouseover')

      cy.getByTestID('flow-card--name-button')
        .first()
        .click()

      cy.get('.cf-input-field')
        .last()
        .focus()
        .type('Bucks In Six')
        .type('{enter}')
      cy.getByTestID('flow-card--Bucks In Six')
        .trigger('mouseover')
        .then(() => {
          cy.getByTestID('context-pin-menu').click()
          cy.getByTestID('context-pin-flow').click()
          cy.getByTestID('context-delete-menu Bucks In Six').click()
          cy.getByTestID('context-delete-flow Bucks In Six').click()
        })
      cy.visit('/')
      cy.getByTestID('tree-nav')
      cy.getByTestID('pinneditems--emptystate').should(
        'contain.text',
        'Pin a task, dashboard, or notebook here'
      )
    })
  })
})
