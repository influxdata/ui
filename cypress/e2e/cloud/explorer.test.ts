import {Organization} from '../../../src/types'

function getTimeMachineText() {
  return cy
    .wrap({
      text: () => {
        const store = cy.state().window.store.getState().timeMachines
        const timeMachine = store.timeMachines[store.activeTimeMachineID]
        const query =
          timeMachine.draftQueries[timeMachine.activeQueryIndex].text
        return query
      },
    })
    .invoke('text')
}

describe('DataExplorer', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.createMapVariable(id)
        cy.fixture('routes').then(({orgs, explorer}) => {
          cy.visit(`${orgs}/${id}${explorer}`)
          cy.getByTestID('tree-nav').should('be.visible')
        })
      })
    })
  })

  describe('Script Editor', () => {
    beforeEach(() => {
      cy.getByTestID('switch-to-script-editor').should('be.visible').click()
    })

    it('can use the dynamic flux function selector to build a query', () => {
      cy.setFeatureFlags({
        quartzIdentity: true,
        multiOrg: true,
      }).then(() => {
        cy.get('.view-line').should('be.visible')

        cy.getByTestID('flux-toolbar-search--input')
          .click()
          .type('microsecondd') // purposefully misspell "microsecond" so all functions are filtered out

        cy.getByTestID('flux-toolbar--list').within(() => {
          cy.getByTestID('empty-state').should('be.visible')
        })
        cy.getByTestID('flux-toolbar-search--input').type('{backspace}')

        cy.get('.flux-toolbar--list-item').should('contain', 'microsecond')
        cy.get('.flux-toolbar--list-item').should('have.length', 1)

        // hovers over function and see a tooltip
        cy.get('.flux-toolbar--list-item').trigger('mouseover')
        cy.getByTestID('flux-docs--microsecond').should('be.visible')

        // inject function into script editor
        cy.getByTestID('flux--microsecond--inject').click()

        getTimeMachineText().then(text => {
          const expected = 'import "date"  date.microsecond(t: )'
          cy.fluxEqual(text, expected).should('be.true')
        })
      })
    })

    it('can use the dynamic flux function search bar to search by package or function name', () => {
      cy.setFeatureFlags({
        quartzIdentity: true,
        multiOrg: true,
      }).then(() => {
        cy.get('.view-line').should('be.visible')

        cy.getByTestID('flux-toolbar-search--input').click().type('filter')

        cy.getByTestID('flux-toolbar-search--input').click().type('filter')

        cy.get('.flux-toolbar--search').within(() => {
          cy.getByTestID('dismiss-button').click()
        })

        cy.getByTestID('flux-toolbar-search--input')
          .invoke('val')
          .then(value => {
            expect(value).to.equal('')
          })

        cy.getByTestID('flux-toolbar-search--input').click().type('array')

        cy.getByTestID('flux-toolbar-search--input').click().type('array')

        cy.get('.flux-toolbar--search').within(() => {
          cy.getByTestID('dismiss-button').click()
        })

        cy.getByTestID('flux-toolbar-search--input')
          .invoke('val')
          .then(value => {
            expect(value).to.equal('')
          })
      })
    })
  })
})
