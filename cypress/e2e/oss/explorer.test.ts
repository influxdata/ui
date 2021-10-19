import {points, makeGraphSnapshot} from '../../support/commands'

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
  // This feature only exsists in OSS currently.
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
