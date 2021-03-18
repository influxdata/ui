import {Organization} from '../../../src/types'
describe('Annotations', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin().then(() =>
      cy.fixture('routes').then(({orgs}) => {
        cy.get('@org').then(({id: orgID}: Organization) => {
          cy.visit(`${orgs}/${orgID}/dashboards-list`)
          cy.getByTestID('tree-nav')
        })
      })
    )
  })
  it('searching stream list when pill is active does not show stream', () => {
    cy.window().then(w => {
      cy.wait(1000)
      w.influx.set('annotations', true)
    })
    cy.get('@org').then(({id: orgID}: Organization) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('tree-nav')
          cy.createBucket(orgID, name, 'schmucket')
          const now = Date.now()
          cy.writeData(
            [
              `test,container_name=cool dopeness=12 ${now - 1000}000000`,
              `test,container_name=beans dopeness=18 ${now - 1200}000000`,
              `test,container_name=cool dopeness=14 ${now - 1400}000000`,
              `test,container_name=beans dopeness=10 ${now - 1600}000000`,
            ],
            'schmucket'
          )
        })
      })
    })
    cy.getByTestID('toggle-annotations-controls').click()
    cy.getByTestID('annotations-control-bar').should('be.visible')
    cy.getByTestID('button').click()
    cy.getByTestID('switch-to-script-editor').should('be.visible')
    cy.getByTestID('switch-to-script-editor').click()
    cy.getByTestID('toolbar-tab').click()
    const query1 = `from(bucket: "schmucket")
|> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["container_name"] == "cool")`
    cy.getByTestID('flux-editor')
      .should('be.visible')
      .click()
      .focused()
      .type(query1)
    cy.getByTestID('overlay').within(() => {
      cy.getByTestID('page-title').click()
      cy.getByTestID('renamable-page-title--input')
        .clear()
        .type('blah')
      cy.getByTestID('save-cell--button').click()
    })
    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID('giraffe-inner-plot').click()
    })
    cy.getByTestID('overlay--container').within(() => {
      cy.getByTestID('textarea')
        .should('be.visible')
        .click()
        .focused()
        .type('im a hippopotamus')
      cy.getByTestID('add-annotation-submit').click()
    })
    cy.getByTestID('annotations-search-input')
      .focus()
      .click()
    cy.getByTestID('annotations-searchbar-suggestions').within(() => {
      cy.getByTestID('list-empty-state').should('be.visible')
    })
  })
  it('text for created annotation shows up in tooltip', () => {
    cy.get('@org').then(({id: orgID}: Organization) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('tree-nav')
        })
      })
    })
  })
})
