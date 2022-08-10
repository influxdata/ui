import {Organization} from '../../../src/types'

describe('Pinned Items', () => {
  let orgID: string
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.get('@org').then(({id}: any) => {
      orgID = id
      cy.setFeatureFlags({
        pinnedItems: true,
      })
      cy.getByTestID('tree-nav')
    })
  })

  it('renders a pinned items modal in the homepage with initial empty state', () => {
    cy.getByTestID('pinneditems--emptystate').should(
      'contain.text',
      'Pin a task, dashboard, or notebook here'
    )
  })

  describe('Pin dashboard tests', () => {
    beforeEach(() => {
      cy.createDashboard(orgID)
      cy.setFeatureFlags({
        pinnedItems: true,
      })
      cy.getByTestID('nav-item-dashboards').should('be.visible')
      cy.getByTestID('nav-item-dashboards').click()
    })
    it('pins a dashboard to the homepage for easy access as a pinned item', () => {
      cy.getByTestID('dashboard-card')
        .first()
        .within(() => {
          cy.getByTestID('context-menu-dashboard').click()
        })
      cy.getByTestID('context-pin-dashboard').click()

      cy.visit('/')
      cy.getByTestID('tree-nav')
      cy.getByTestID('pinneditems--container')
        .should('be.visible')
        .within(() => {
          cy.getByTestID('pinneditems--card').should('exist')
        })
    })

    it('reflects an edit to the dashboard name on the dashboard card', () => {
      cy.getByTestID('dashboard-card')
        .first()
        .within(() => {
          cy.getByTestID('context-menu-dashboard').click()
        })
      cy.getByTestID('context-pin-dashboard').click()

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
      cy.getByTestID('pinneditems--container')
        .should('be.visible')
        .within(() => {
          cy.getByTestID('pinneditems--link').should(
            'contain.text',
            'Bucks In Six'
          )
        })
    })

    it('unpins a card which removes it from the pinned list', () => {
      cy.getByTestID('dashboard-card')
        .first()
        .within(() => {
          cy.getByTestID('context-menu-dashboard').click()
        })
      cy.getByTestID('context-pin-dashboard').click()

      cy.visit('/')
      cy.getByTestID('tree-nav')

      cy.getByTestID('pinneditems--container')
        .should('be.visible')
        .within(() => {
          cy.getByTestID('pinneditems--card')
            .first()
            .trigger('mouseover')
        })
      cy.getByTestID('pinneditems-delete--menu--button').click()
      cy.getByTestID('pinneditems-delete--menu--confirm-button').click()
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
          cy.getByTestID('context-delete-menu--button').click()
        })
      cy.getByTestID('context-delete-menu--confirm-button').click()

      cy.visit('/')
      cy.getByTestID('tree-nav')
      cy.getByTestID('pinneditems--emptystate')
        .should('be.visible')
        .should('contain.text', 'Pin a task, dashboard, or notebook here')
    })
  })

  describe('Pin task tests', () => {
    let taskName: string
    beforeEach(() => {
      cy.flush()
      cy.signin()
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

      taskName = 'Task'
      cy.log('Using autocomplete for closing syntax.')
      cy.createTaskFromEmpty(
        taskName,
        ({name}) => {
          return `import "influxdata/influxdb/v1{rightarrow}
v1.tagValues(bucket: "${name}", tag: "_field"{rightarrow}
from(bucket: "${name}"{rightarrow}
   |> range(start: -2m{rightarrow}`
        },
        '24h',
        '20m',
        false,
        30
      )

      cy.getByTestID('task-save-btn').click()

      cy.getByTestID('notification-success--dismiss').click()

      cy.getByTestID('task-card')
        .first()
        .trigger('mouseover')
      cy.getByTestID('context-menu-task').click()
      cy.getByTestID('context-pin-task').click()
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
      cy.getByTestID('pinneditems--container')
        .should('be.visible')
        .within(() => {
          cy.getByTestID('pinneditems--link').should(
            'contain.text',
            'Bucks In Six'
          )
        })
    })

    it('unpins when the underlying resource is removed', () => {
      cy.getByTestID('task-card').first()
      cy.getByTestID(`context-delete-menu ${taskName}--button`).click()
      cy.getByTestID(`context-delete-menu ${taskName}--confirm-button`).click()

      cy.visit('/')
      cy.getByTestID('tree-nav')
      cy.getByTestID('pinneditems--emptystate')
        .should('be.visible')
        .should('contain.text', 'Pin a task, dashboard, or notebook here')
    })
  })

  describe('Pin flow tests', () => {
    beforeEach(() => {
      cy.setFeatureFlags({
        pinnedItems: true,
      })
      cy.intercept('GET', '/api/v2private/notebooks*').as('getNotebooks')
      cy.intercept('PATCH', '/api/v2private/notebooks/*').as('updateNotebook')

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
      cy.getByTestID('nav-item-flows').should('be.visible')
      cy.clickNavBarItem('nav-item-flows')
      cy.wait('@getNotebooks')

      cy.getByTestID('preset-new')
        .first()
        .click()
      cy.wait('@getNotebooks')
      cy.wait('@updateNotebook')

      cy.getByTestID('page-title')
        .first()
        .click()
      cy.getByTestID('renamable-page-title--input')
        .clear()
        .type('Flow{enter}')
      cy.wait('@updateNotebook')

      cy.getByTestID('time-machine-submit-button')
        .should('be.visible')
        .and('be.disabled')
      cy.getByTestID('enable-auto-refresh-button').should('be.disabled')
      cy.getByTestID('dropdown-menu--contents').should('not.exist')
      cy.getByTestID('timezone-dropdown').click()
      cy.getByTestID('dropdown-menu--contents')
        .should('be.visible')
        .within(() => {
          cy.getByTestID('dropdown-item').should('have.length.gte', 2)
          cy.getByTestID('dropdown-item')
            .last()
            .click()
        })
      cy.visit(`/orgs/${orgID}/notebooks`)
      cy.wait('@getNotebooks')
    })

    it('pins a notebook to the homepage', () => {
      cy.getByTestID('flow-card--Flow').within(() => {
        cy.getByTestID('context-menu-flow').click()
      })
      cy.getByTestID('context-pin-flow').click()
      cy.getByTestID('notification-success').should('be.visible')

      cy.visit('/')
      cy.getByTestID('tree-nav')
      cy.getByTestID('pinneditems--container')
        .should('be.visible')
        .within(() => {
          cy.getByTestID('pinneditems--type').should('contain.text', 'NOTEBOOK')
        })
    })

    it('updates the name when the notebook name is updated', () => {
      cy.getByTestID('flow-card--Flow').within(() => {
        cy.getByTestID('context-menu-flow').click()
      })
      cy.getByTestID('context-pin-flow').click()
      cy.getByTestID('notification-success').should('be.visible')
      cy.getByTestID('notification-success--dismiss').click()

      cy.intercept('PUT', '**/pinned/*').as('updatePinned')
      const updatedName = 'Bucks in Six'

      cy.getByTestID('resource-editable-name')
        .first()
        .trigger('mouseover')

      cy.getByTestID('flow-card--name-button')
        .first()
        .click()

      cy.get('.cf-input-field')
        .last()
        .type(`${updatedName}{enter}`)

      cy.getByTestID('notification-success').should('be.visible')
      cy.wait('@updatePinned')
      cy.wait('@updateNotebook')
      cy.visit('/')
      cy.getByTestID('tree-nav')
      cy.getByTestID('pinneditems--container')
        .should('be.visible')
        .within(() => {
          cy.getByTestID('pinneditems--link').should(
            'contain.text',
            updatedName
          )
        })
    })

    it('unpins when the resource it is pointing to is deleted', () => {
      cy.getByTestID('flow-card--Flow').within(() => {
        cy.getByTestID('context-menu-flow').click()
      })
      cy.getByTestID('context-pin-flow').click()
      cy.getByTestID('notification-success').should('be.visible')
      cy.getByTestID('notification-success--dismiss').click()

      cy.getByTestID('flow-card--Flow').within(() => {
        cy.getByTestID(`context-delete-menu--button`).click()
      })
      cy.getByTestID(`context-delete-menu--confirm-button`).click()
      cy.getByTestID('notification-success').should('be.visible')

      cy.visit('/')
      cy.getByTestID('tree-nav')
      cy.getByTestID('pinneditems--emptystate')
        .should('be.visible')
        .should('contain.text', 'Pin a task, dashboard, or notebook here')
    })
  })
})
