import {Authorization} from 'src/client'
import {Organization} from 'src/types'

const openCopyAs = () => {
  cy.getByTestID('square-button')
    .eq(1)
    .scrollIntoView()
    .click({force: true})
  cy.getByTestID('Export to Client Library--list-item').click()
}

const addFluxQueryInNotebook = (query: string) => {
  cy.getByTestID('add-flow-btn--rawFluxEditor').click()
  cy.getByTestID('flux-editor')
    .scrollIntoView()
    .focused()
    .type(Cypress.platform === 'darwin' ? '{cmd}a' : '{ctrl}a')
    .type(query)
}

const createEmptyNotebook = () => {
  cy.intercept('PATCH', `/api/v2private/notebooks/*`, req => {
    req.alias = 'NotebooksPatchRequest'
  })

  cy.getByTestID('create-flow--button')
    .first()
    .click()
  cy.focused()
  cy.wait('@NotebooksPatchRequest')
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
  cy.getByTestID('square-button')
    .eq(1)
    .scrollIntoView()
    .click({force: true})
  cy.getByTestID('Delete--list-item').click()
}

const verifyClientCode = (client: any) => {
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
  cy.getByTestID('button-copy').should('have.length', client.copyButtons)

  cy.get('.cf-overlay--dismiss').click()
}

const getClients = (
  org: string,
  bucket: string,
  token: string,
  query: string
) => {
  return [
    {
      name: 'arduino',
      token: `#define INFLUXDB_TOKEN "<INFLUX_TOKEN>"`,
      org: `#define INFLUXDB_ORG "${org}"`,
      bucket: `#define INFLUXDB_BUCKET "${bucket}"`,
      query,
      copyButtons: 3,
    },
    {
      name: 'csharp',
      token: `const string token = "${token}";`,
      org: `const string org = "${org}";`,
      bucket: `const string bucket = "${bucket}";`,
      query,
      copyButtons: 4,
    },
    {
      name: 'go',
      token: `const token = "${token}"`,
      org: `const org = "${org}"`,
      bucket: `const bucket = "${bucket}"`,
      query,
      copyButtons: 1,
    },
    {
      name: 'java',
      token: `String token = "${token}";`,
      org: `String org = "${org}";`,
      bucket: `String bucket = "${bucket}";`,
      query,
      copyButtons: 3,
    },
    {
      name: 'javascript-node',
      token: `const token = '${token}'`,
      org: `const org = '${org}'`,
      bucket: `const bucket = '${bucket}'`,
      query,
      copyButtons: 2,
    },
    {
      name: 'kotlin',
      token: `val token = "${token}"`,
      org: `val org = "${org}"`,
      bucket: `val bucket = "${bucket}"`,
      query,
      copyButtons: 3,
    },
    {
      name: 'php',
      token: `$token = '${token}';`,
      org: `$org = '${org}';`,
      bucket: `$bucket = '${bucket}';`,
      query,
      copyButtons: 2,
    },
    {
      name: 'python',
      token: `token = "${token}"`,
      org: `org = "${org}"`,
      bucket: `bucket = "${bucket}"`,
      query,
      copyButtons: 2,
    },
    {
      name: 'ruby',
      token: `token = '${token}'`,
      org: `org = '${org}'`,
      bucket: `bucket = '${bucket}'`,
      query,
      copyButtons: 2,
    },
    {
      name: 'scala',
      token: `val token = "${token}"`,
      org: `val org = "${org}"`,
      bucket: `val bucket = "${bucket}"`,
      query,
      copyButtons: 4,
    },
    {
      name: 'swift',
      token: `let token = "${token}"`,
      org: `let org = "${org}"`,
      bucket: `let bucket = "${bucket}"`,
      query,
      copyButtons: 2,
    },
  ]
}

describe('Flows', () => {
  beforeEach(() => {
    cy.flush()
  })

  describe('Flows Copy To Clipboard', () => {
    beforeEach(() => {
      cy.signin().then(() => {
        cy.get('@org').then(({id}: Organization) => {
          cy.fixture('routes').then(({orgs}) => {
            cy.request('api/v2/authorizations').then(({body}) => {
              cy.wrap(body.authorizations).as('tokens')
            })
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
      const bucket = 'defbuck'
      const query = 'buckets()'

      createEmptyNotebook()
      addFluxQueryInNotebook(query)
      openCopyAs()

      cy.get('@org').then(({name}: Organization) => {
        cy.get<Authorization[]>('@tokens').then(tokens => {
          getClients(name, bucket, tokens[0].token, query).forEach(client => {
            verifyClientCode(client)
          })
        })
      })
    })

    it('Export to Clipboard as Code with Custom Bucket', () => {
      const bucket = '_customBucket'
      const query = `from(bucket: "${bucket}"`

      createEmptyNotebook()
      addFluxQueryInNotebook(query)
      openCopyAs()

      cy.get('@org').then(({name}: Organization) => {
        cy.get<Authorization[]>('@tokens').then(tokens => {
          getClients(name, bucket, tokens[0].token, query).forEach(client => {
            verifyClientCode(client)
          })
        })
      })
    })
  })
})
