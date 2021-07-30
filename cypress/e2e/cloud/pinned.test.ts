import {Organization} from '../../../src/types'
import {createFirstTask} from '../shared/tasks.test'

describe('Pinned Items', () => {
  let orgID: string
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() =>
      cy.fixture('routes').then(({orgs}) => {
        cy.get('@org').then(({id}: any) => {
          orgID = id
          cy.setFeatureFlags({
            pinnedItems: true,
            docSearchWidget: true,
          }).then(() => {
            cy.wait(1000)
            cy.visit(`${orgs}/${id}`)
            cy.getByTestID('tree-nav')
          })
        })
      })
    )
  })

  it('renders a pinned items modal in the homepage with initial empty state', () => {
    cy.getByTestID('pinneditems--container').should('be.visible')
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
          cy.fixture('routes').then(({orgs}) => {
            cy.visit(`${orgs}/${orgID}/dashboards-list`)
            cy.getByTestID('tree-nav')
          })
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
      cy.getByTestID('pinneditems--card').should('be.visible')
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

        cy.get('.cf-input-field')
          .type('Bucks In Six')
          .type('{enter}')
      })

      cy.visit('/')
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
            })
        )
      })

      cy.fixture('routes').then(({orgs}) => {
        cy.get('@org').then(({id}: Organization) => {
          cy.visit(`${orgs}/${id}/tasks`)
          cy.getByTestID('tree-nav')
        })
      })

      taskName = 'Task'
      createFirstTask(taskName, ({name}) => {
        return `import "influxdata/influxdb/v1{rightarrow}
v1.tagValues(bucket: "${name}", tag: "_field"{rightarrow}
from(bucket: "${name}"{rightarrow}
   |> range(start: -2m{rightarrow}`
      })

      cy.getByTestID('task-save-btn').click()

      cy.getByTestID('notification-success--dismiss').click()
    })

    it('can pin a task to the homepage', () => {
      cy.getByTestID('task-card')
        .first()
        .trigger('mouseover')
        .then(() => {
          cy.getByTestID('context-pin-menu').click()
        })
      cy.visit('/')
      cy.getByTestID('pinneditems--container').within(() => {
        cy.getByTestID('pinneditems--link').should('contain.text', taskName)
      })
    })
  })
})
