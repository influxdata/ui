import {points, makeGraphSnapshot} from '../../support/commands'
import {
  FROM,
  RANGE,
  MEAN,
  MATH_ABS,
  MATH_FLOOR,
  STRINGS_TITLE,
  STRINGS_TRIM,
} from '../../../src/shared/constants/fluxFunctions'

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
    cy.flush().then(() =>
      cy.signin().then(() =>
        cy.get('@org').then(({id}: Organization) => {
          cy.fixture('routes').then(({orgs, explorer}) => {
            cy.visit(`${orgs}/${id}${explorer}`)
            cy.getByTestID('tree-nav').should('be.visible')
            cy.switchToDataExplorer('old')
          })
        })
      )
    )
  })

  describe('raw script editing', () => {
    beforeEach(() => {
      cy.getByTestID('switch-to-script-editor').should('be.visible').click()
    })

    it('imports the appropriate packages to build a query', () => {
      cy.getByTestID('flux-editor', {timeout: 30000}).should('be.visible')
      cy.getByTestID('functions-toolbar-contents--functions').should('exist')
      cy.getByTestID('flux--from--inject').click({force: true})
      cy.getByTestID('flux--range--inject').click({force: true})
      cy.getByTestID('flux--math.abs--inject').click({force: true})
      cy.getByTestID('flux--math.floor--inject').click({force: true})
      cy.getByTestID('flux--strings.title--inject').click({force: true})
      cy.getByTestID('flux--strings.trim--inject').click({force: true})

      cy.wait(100)

      getTimeMachineText().then(text => {
        const expected = `
        import"${STRINGS_TITLE.package}"
        import"${MATH_ABS.package}"
        ${FROM.example}|>
        ${RANGE.example}|>
        ${MATH_ABS.example}|>
        ${MATH_FLOOR.example}|>
        ${STRINGS_TITLE.example}|>
        ${STRINGS_TRIM.example}`

        cy.fluxEqual(text, expected).should('be.true')
      })
    })

    it('can use the function selector to build a query', () => {
      // wait for monaco to load so focus is not taken from flux-toolbar-search--input
      cy.get('.view-line').should('be.visible')

      cy.getByTestID('flux-toolbar-search--input').clear().type('covarianced') // purposefully misspell "covariance" so all functions are filtered out

      cy.getByTestID('flux-toolbar--list').within(() => {
        cy.getByTestID('empty-state').should('be.visible')
      })

      cy.getByTestID('flux-toolbar-search--input').type('{backspace}')

      cy.get('.flux-toolbar--list-item').should('contain', 'covariance')
      cy.get('.flux-toolbar--list-item').should('have.length', 1)

      cy.getByTestID('flux-toolbar-search--input').clear()

      cy.getByTestID('flux--from--inject').click()

      getTimeMachineText().then(text => {
        const expected = FROM.example

        cy.fluxEqual(text, expected).should('be.true')
      })

      cy.getByTestID('flux--range--inject').click()

      getTimeMachineText().then(text => {
        const expected = `${FROM.example}|>${RANGE.example}`

        cy.fluxEqual(text, expected).should('be.true')
      })

      cy.getByTestID('flux--mean--inject').click()

      getTimeMachineText().then(text => {
        const expected = `${FROM.example}|>${RANGE.example}|>${MEAN.example}`

        cy.fluxEqual(text, expected).should('be.true')
      })
    })
  })
})
describe('refresh', () => {
  beforeEach(() => {
    cy.writeData(points(10))

    cy.getByTestID(`selector-list m`).click()
    cy.getByTestID('time-machine-submit-button').click()

    // select short time period to ensure graph changes after short time
    cy.getByTestID('timerange-dropdown').click()
    cy.getByTestID('dropdown-item-past5m').click()
  })

  // TODO: get this test passing for OSS
  // This feature only exsists in OSS currently
  it.skip('auto refresh', () => {
    const snapshot = makeGraphSnapshot()
    cy.getByTestID('autorefresh-dropdown--button').click()
    cy.getByTestID('auto-refresh-5s').click()

    cy.wait(3_000)
    makeGraphSnapshot().shouldBeSameAs(snapshot)

    cy.wait(3_000)
    const snapshot2 = makeGraphSnapshot()
    snapshot2.shouldBeSameAs(snapshot, false)

    cy.getByTestID('autorefresh-dropdown-refresh').should('not.be.visible')
    cy.getByTestID('autorefresh-dropdown--button')
      .should('contain.text', '5s')
      .click()
    cy.getByTestID('auto-refresh-paused').click()
    cy.getByTestID('autorefresh-dropdown-refresh').should('be.visible')

    // wait if graph changes after another 6s when autorefresh is paused
    cy.wait(6_000)
    makeGraphSnapshot().shouldBeSameAs(snapshot2)
  })
})
