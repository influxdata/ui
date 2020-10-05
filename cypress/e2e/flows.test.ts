describe('Flows', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin().then(({body}) => {
      const {
        org: {id},
        bucket,
      } = body
      cy.wrap(body.org).as('org')
      cy.wrap(bucket).as('bucket')
      cy.fixture('routes').then(({orgs}) => {
        cy.visit(`${orgs}/${id}`)
        cy.getByTestID('tree-nav')

        cy.window().then(win => {
          win.influx.set('notebooks', true)
        })

        cy.getByTestID('nav-item-flows').click()
      })
    })
  })

  // TODO: unskip when no longer blocked by feature flag
  it('CRUD a flow from the index page', () => {
    cy.getByTestID('create-flow--button')
      .first()
      .click()

    cy.getByTestID('page-title').click()
    cy.getByTestID('renamable-page-title--input').type('My Flow {enter}')

    cy.getByTestID('add-flow-btn--query').click()

    cy.getByTestID('panel-add-btn-0').click()

    cy.getByTestID('add-flow-btn--visualization').click()

    cy.getByTestID('flows-delete-cell')
      .eq(1)
      .click()

    cy.getByTestID('time-machine-submit-button').click()

    cy.getByTestID('panel-add-btn-0').click()

    cy.getByTestID('add-flow-btn--visualization').click()

    cy.getByTestID('slide-toggle').click()

    cy.get('.flow-panel--header')
      .eq(0)
      .click()

    // test for presentation mode state

    cy.getByTestID('slide-toggle').click()
  })
})
