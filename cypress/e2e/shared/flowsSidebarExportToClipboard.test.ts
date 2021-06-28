import {Organization} from '../../src/types'

describe('Flows', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin().then(() => {
      cy.get('@org').then(({id}: Organization) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${id}`)
          cy.getByTestID('tree-nav')
          cy.setFeatureFlags({
            notebooks: true,
            'flow-sidebar': true,
            simpleTable: true,
          })
          cy.getByTestID('nav-item-flows').click()
        })
      })
    })
  })

  it('Export to Clipboard as Code', () => {
    const query = 'buckets()'

    cy.getByTestID('create-flow--button')
      .first()
      .click()
    cy.focused()
    cy.wait(2000)
    cy.getByTestID('square-button')
      .eq(1)
      .scrollIntoView()
      .click({force: true})
    cy.getByTestID('Delete--list-item').click()
    cy.getByTestID('square-button')
      .eq(1)
      .scrollIntoView()
      .click({force: true})
    cy.getByTestID('Delete--list-item').click()
    cy.getByTestID('add-flow-btn--rawFluxEditor').click()
    cy.getByTestID('flux-editor')
      .scrollIntoView()
      .focused()
      .type(Cypress.platform === 'darwin' ? '{cmd}a' : '{ctrl}a')
      .type(query)

    cy.getByTestID('square-button')
      .eq(1)
      .scrollIntoView()
      .click({force: true})
    cy.getByTestID('Copy As--list-item').click()

    const bucket = 'defbuck'
    cy.get('@org').then(({name}: Organization) => {
      const clients = [
        {
          name: 'python',
          token: 'token = "<INFLUX_TOKEN>"',
          org: `org = "${name}"`,
          bucket: `bucket = "${bucket}"`,
          query,
        },
        {
          name: 'arduino',
          token: `#define INFLUXDB_TOKEN "<INFLUX_TOKEN>"`,
          org: `#define INFLUXDB_ORG "${name}"`,
          bucket: `#define INFLUXDB_BUCKET "${bucket}"`,
          query,
        },
      ]
      clients.forEach(client => {
        cy.getByTestID(`load-data-item ${client.name}`)
          .scrollIntoView()
          .click()

        cy.getByTestID('code-snippet')
          .children()
          .find('code')
          .contains(client.token)
        cy.getByTestID('code-snippet')
          .children()
          .find('code')
          .contains(client.org)
        cy.getByTestID('code-snippet')
          .children()
          .find('code')
          .contains(client.bucket)
        cy.getByTestID('code-snippet')
          .children()
          .find('code')
          .contains(client.query)

        cy.get('.cf-overlay--dismiss').click()
      })
    })
  })
})
