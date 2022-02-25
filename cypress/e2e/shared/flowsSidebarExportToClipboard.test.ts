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
  cy.getByTestID('flux-editor').monacoType(`{selectall}{del}${query}`)
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
    .contains(client.org)
  cy.getByTestID('code-snippet')
    .children()
    .find('code')
    .contains(client.query)

  cy.get('.cf-overlay--dismiss').click()
}

const getClients = (org: string, query: string) => {
  return [
    {
      name: 'arduino',
      org: `"${org}"`,
      query: query.replace(/"/g, '\\"'),
    },
    {
      name: 'csharp',
      org: `const string org = "${org}";`,
      query: query.replace(/"/g, '""'),
    },
    {
      name: 'go',
      org: `client.QueryAPI("${org}")`,
      query,
    },
    {
      name: 'java',
      org: `String org = "${org}";`,
      query: query.replace(/"/g, '\\"'),
    },
    {
      name: 'javascript-node',
      org: `const org = '${org}'`,
      query,
    },
    {
      name: 'kotlin',
      org: `val org = "${org}"`,
      query,
    },
    {
      name: 'php',
      org: `$org = '${org}';`,
      query: query.replace(/"/g, '\\"'),
    },
    {
      name: 'python',
      org: `org = "${org}"`,
      query,
    },
    {
      name: 'ruby',
      org: `org = '${org}'`,
      query,
    },
    {
      name: 'scala',
      org: `val org = "${org}"`,
      query,
    },
    {
      name: 'swift',
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
        getClients(name, query).forEach(client => {
          verifyClientCode(client)
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
        getClients(name, query).forEach(client => {
          verifyClientCode(client)
        })
      })
    })
  })
})
