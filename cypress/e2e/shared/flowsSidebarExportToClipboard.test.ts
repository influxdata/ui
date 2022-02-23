import {Authorization} from 'src/client'
import {Organization} from 'src/types'

const openCopyAs = () => {
  cy.getByTestID('sidebar-button')
    .first()
    .scrollIntoView()
    .click({force: true})
  cy.getByTestID('Export to Client Library--list-item').click()
}

const addFluxQueryInNotebook = (query: string) => {
  cy.getByTestID('add-flow-btn--rawFluxEditor').click()
  cy.getByTestID('flux-editor').clear()
  cy.getByTestID('flux-editor').monacoType(`${query}`)
}

const createEmptyNotebook = () => {
  cy.intercept('PATCH', `/api/v2private/notebooks/*`, req => {
    req.alias = 'NotebooksPatchRequest'
  })

  cy.getByTestID('preset-new')
    .first()
    .click()
  cy.wait('@NotebooksPatchRequest')
  cy.getByTestID('sidebar-button')
    .first()
    .scrollIntoView()
    .click({force: true})
  cy.getByTestID('Delete--list-item').click()
  cy.getByTestID('sidebar-button')
    .first()
    .scrollIntoView()
    .click({force: true})
  cy.getByTestID('Delete--list-item').click()
  cy.getByTestID('sidebar-button')
    .first()
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
    .contains(client.query)

  cy.get('.cf-overlay--dismiss').click()
}

const getClients = (org: string, token: string, query: string) => {
  return [
    {
      name: 'arduino',
      token: `"<INFLUX_TOKEN>"`,
      org: `"${org}"`,
      query: query.replace(/"/g, '\\"'),
    },
    {
      name: 'csharp',
      token: `const string token = "${token}";`,
      org: `const string org = "${org}";`,
      query: query.replace(/"/g, '""'),
    },
    {
      name: 'go',
      token: `"${token}"`,
      org: `client.QueryAPI("${org}")`,
      query,
    },
    {
      name: 'java',
      token: `String token = "${token}";`,
      org: `String org = "${org}";`,
      query: query.replace(/"/g, '\\"'),
    },
    {
      name: 'javascript-node',
      token: `const token = '${token}'`,
      org: `const org = '${org}'`,
      query,
    },
    {
      name: 'kotlin',
      token: `val token = "${token}"`,
      org: `val org = "${org}"`,
      query,
    },
    {
      name: 'php',
      token: `$token = '${token}';`,
      org: `$org = '${org}';`,
      query: query.replace(/"/g, '\\"'),
    },
    {
      name: 'python',
      token: `token = "${token}"`,
      org: `org = "${org}"`,
      query,
    },
    {
      name: 'ruby',
      token: `token = '${token}'`,
      org: `org = '${org}'`,
      query,
    },
    {
      name: 'scala',
      token: `val token = "${token}"`,
      org: `val org = "${org}"`,
      query,
    },
    {
      name: 'swift',
      token: `let token = "${token}"`,
      org: `let org = "${org}"`,
      query,
    },
  ]
}

describe('Flows', () => {
  beforeEach(() => cy.flush())

  describe('Flows Copy To Clipboard', () => {
    beforeEach(() => {
      cy.signin()
      cy.get('@org').then(({id}: Organization) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.request('api/v2/authorizations').then(({body}) => {
            cy.wrap(body.authorizations).as('tokens')
          })
          cy.visit(`${orgs}/${id}`)
        })
      })
      cy.getByTestID('tree-nav')

      cy.clickNavBarItem('nav-item-flows')
    })

    it('Export to Clipboard as Code', () => {
      const query = 'buckets()'

      createEmptyNotebook()
      addFluxQueryInNotebook(query)
      openCopyAs()

      cy.get('@org').then(({name}: Organization) => {
        cy.get<Authorization[]>('@tokens').then(tokens => {
          getClients(name, tokens[0].token, query).forEach(client => {
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
          getClients(name, tokens[0].token, query).forEach(client => {
            verifyClientCode(client)
          })
        })
      })
    })
  })
})
