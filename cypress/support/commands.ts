import {NotificationEndpoint} from '../../src/types'
import {Bucket, Organization} from '../../src/client'
import 'cypress-file-upload'

const DEX_URL_VAR = 'dexUrl'

export const signin = (): Cypress.Chainable<Cypress.Response> => {
  return cy.setupUser().then((response: any) => {
    wrapDefaultUser()
      .then(() => wrapDefaultPassword())
      .then(() => {
        cy.visit('/').then(() => {
          cy.get<string>('@defaultUser').then((defaultUser: string) => {
            const username = Cypress._.get(
              response,
              'body.user.name',
              defaultUser
            )
            cy.wrap(username)
              .as('defaultUser')
              .then(() => {
                cy.get<string>('@defaultPassword').then(
                  (defaultPassword: string) => {
                    if (Cypress.env(DEX_URL_VAR) === 'OSS') {
                      return loginViaOSS(username, defaultPassword)
                    } else {
                      return loginViaDex(username, defaultPassword)
                    }
                  }
                )
              })
              .then(() => cy.location('pathname').should('not.eq', '/signin'))
              .then(() => wrapEnvironmentVariablesForCloud())
          })
        })
      })
  })
}

// login via the purple OSS screen by typing in username/password
// this is only used if you're using monitor-ci + DEV_MODE_CLOUD=0
export const loginViaOSS = (username: string, password: string) => {
  cy.get('#login').type(username)
  cy.get('#password').type(password)
  cy.get('#submit-login').click()
}

// uses DEX APIs to perform login
// this is neccesary because for k8s-idpe dex is hosted on an alternative domain
// and that makes cypress angry if you try and navigate outside the baseURL
export const loginViaDex = (username: string, password: string) => {
  return cy
    .request({
      method: 'GET',
      url: '/api/v2/signin?redirectTo=' + Cypress.config().baseUrl,
      followRedirect: false,
    })
    .then(resp =>
      cy
        .request({
          url: resp.headers.location,
          followRedirect: false,
          method: 'GET',
        })
        .then(secondResp => {
          cy.request({
            url: Cypress.env(DEX_URL_VAR) + secondResp.headers.location,
            method: 'POST',
            form: true,
            body: {
              login: username,
              password: password,
            },
            followRedirect: false,
          }).then(thirdResp => {
            const req = thirdResp.headers.location.split('/approval?req=')[1]
            cy.request({
              url: thirdResp.redirectedToUrl,
              followRedirect: true,
              form: true,
              method: 'POST',
              body: {req: req, approval: 'approve'},
            }).then(() => {
              cy.visit('/')
              cy.getCookie('session').should('exist')
              cy.location('pathname').should('not.eq', '/signin')
            })
          })
        })
    )
}

export const wrapEnvironmentVariablesForCloud = (): Cypress.Chainable<Cypress.Response> => {
  return cy
    .request({
      method: 'GET',
      url: '/api/v2/orgs',
    })
    .then(orgsResponse => {
      const org = orgsResponse.body.orgs[0] as Organization
      cy.wrap(org).as('org')

      cy.request({
        method: 'GET',
        url: '/api/v2/buckets',
        qs: {orgID: org.id},
      }).then(bucketsResponse => {
        const buckets = bucketsResponse.body.buckets as Array<Bucket>
        const bucket = buckets.find(
          b =>
            b.orgID === org.id &&
            b.name !== '_tasks' &&
            b.name !== '_monitoring'
        )
        cy.wrap(bucket).as('bucket')
        wrapDefaultBucket()
      })
    })
}

export const wrapEnvironmentVariablesForOss = (): Cypress.Chainable => {
  return wrapDefaultBucket()
    .then(() => wrapDefaultUser())
    .then(() => wrapDefaultPassword())
    .then(() => {
      return cy.wrap('InfluxData').as('defaultOrg')
    })
}

export const wrapDefaultBucket = (): Cypress.Chainable => {
  return cy
    .wrap('defbuck')
    .as('defaultBucket')
    .then(defaultBucket => {
      cy.wrap('selector-list '.concat(defaultBucket)).as(
        'defaultBucketListSelector'
      )
    })
}

export const wrapDefaultUser = (): Cypress.Chainable => {
  const username = Cypress.env('username') ?? 'dev_user'
  return cy.wrap(username).as('defaultUser')
}

export const wrapDefaultPassword = (): Cypress.Chainable => {
  const password = Cypress.env('password') ?? 'CHECKMEOUTASUPERSECRETPASSWORD'
  return cy.wrap(password).as('defaultPassword')
}

export const createDashboard = (
  orgID?: string,
  name: string = 'test dashboard'
): Cypress.Chainable<Cypress.Response> => {
  return cy.request({
    method: 'POST',
    url: '/api/v2/dashboards',
    body: {
      name,
      orgID,
    },
  })
}

export const createCell = (
  dbID: string,
  dims: {x: number; y: number; height: number; width: number} = {
    x: 0,
    y: 0,
    height: 4,
    width: 4,
  },
  name?: string
): Cypress.Chainable<Cypress.Response> => {
  return cy.request({
    method: 'POST',
    url: `/api/v2/dashboards/${dbID}/cells`,
    body: {
      x: dims.x,
      y: dims.y,
      h: dims.height,
      w: dims.width,
      name: name,
    },
  })
}

export const createView = (
  dbID: string,
  cellID: string
): Cypress.Chainable<Cypress.Response> => {
  return cy.fixture('view').then(view => {
    return cy.request({
      method: 'PATCH',
      url: `/api/v2/dashboards/${dbID}/cells/${cellID}/view`,
      body: view,
    })
  })
}

export const createDashWithCell = (
  orgID: string
): Cypress.Chainable<Cypress.Response> =>
  createDashboard(orgID).then(({body: dashboard}) => createCell(dashboard.id))

export const createDashWithViewAndVar = (
  orgID: string
): Cypress.Chainable<Cypress.Response> => {
  createMapVariable(orgID)
  return createDashboard(orgID).then(({body: dashboard}) =>
    createCell(dashboard.id).then(({body: cell}) =>
      createView(dashboard.id, cell.id)
    )
  )
}

export const createOrg = (
  name = 'test org'
): Cypress.Chainable<Cypress.Response> => {
  return cy.request({
    method: 'POST',
    url: '/api/v2/orgs',
    body: {
      name,
    },
  })
}

export const deleteOrg = (id: string): Cypress.Chainable<Cypress.Response> => {
  return cy.request({
    method: 'DELETE',
    url: `/api/v2/orgs/${id}`,
  })
}

export const createBucket = (
  orgID?: string,
  organization?: string,
  bucketName?: string
): Cypress.Chainable<Cypress.Response> => {
  return cy.request({
    method: 'POST',
    url: '/api/v2/buckets',
    body: {
      name: bucketName,
      orgID,
      organization,
      retentionRules: [],
    },
  })
}

export const createTask = (
  token: string,
  orgID?: string,
  name: string = '🦄ask'
): Cypress.Chainable<Cypress.Response> => {
  const flux = `import "csv"

option task = {
  name: "${name}",
  every: 24h,
  offset: 20m
}
from(bucket: "defbuck")
      |> range(start: -2m)`

  return cy.request({
    method: 'POST',
    url: '/api/v2/tasks',
    body: {
      flux,
      orgID,
      token,
    },
  })
}

export const createQueryVariable = (
  orgID?: string,
  name: string = 'LittleVariable',
  query?: string
): Cypress.Chainable<Cypress.Response> => {
  const argumentsObj = {
    type: 'query',
    values: {
      language: 'flux',
      query: query || `filter(fn: (r) => r._field == "cpu")`,
    },
  }

  return cy.request({
    method: 'POST',
    url: '/api/v2/variables',
    body: {
      name,
      orgID,
      arguments: argumentsObj,
    },
  })
}

export const createCSVVariable = (
  orgID?: string,
  name: string = 'CSVVariable',
  csv?: string[]
): Cypress.Chainable<Cypress.Response> => {
  const argumentsObj = {
    type: 'constant',
    values: csv || ['c1', 'c2', 'c3', 'c4'],
  }

  return cy.request({
    method: 'POST',
    url: '/api/v2/variables',
    body: {
      name,
      orgID,
      arguments: argumentsObj,
    },
  })
}

export const createMapVariable = (
  orgID?: string
): Cypress.Chainable<Cypress.Response> => {
  const argumentsObj = {
    type: 'map',
    values: {k1: 'v1', k2: 'v2'},
  }

  return cy.request({
    method: 'POST',
    url: '/api/v2/variables',
    body: {
      name: 'mapTypeVar',
      orgID,
      arguments: argumentsObj,
    },
  })
}

export const createLabel = (
  name?: string,
  orgID?: string,
  properties: {description: string; color: string} = {
    description: `test ${name}`,
    color: '#ff0054',
  }
): Cypress.Chainable<Cypress.Response> => {
  return cy.request({
    method: 'POST',
    url: '/api/v2/labels',
    body: {
      name,
      orgID,
      properties: properties,
    },
  })
}

export const createAndAddLabel = (
  resource: string,
  orgID: string = '',
  resourceID: string,
  name?: string
): Cypress.Chainable<Cypress.Response> => {
  return cy
    .request({
      method: 'POST',
      url: '/api/v2/labels',
      body: {
        name,
        orgID,
        properties: {
          description: `test ${name}`,
          color: '#ff00ff',
        },
      },
    })
    .then(({body}) => {
      return addResourceLabel(resource, resourceID, body.label.id)
    })
}

export const addResourceLabel = (
  resource: string,
  resourceID: string,
  labelID: string
): Cypress.Chainable<Cypress.Response> => {
  return cy.request({
    method: 'POST',
    url: `/api/v2/${resource}/${resourceID}/labels`,
    body: {labelID},
  })
}

export const createSource = (
  orgID?: string
): Cypress.Chainable<Cypress.Response> => {
  return cy.request({
    method: 'POST',
    url: '/api/v2/sources',
    body: {
      name: 'defsource',
      default: true,
      orgID,
      type: 'self',
    },
  })
}

export const createScraper = (
  scraperName?: string,
  url?: string,
  type?: string,
  orgID?: string,
  bucketID?: string
): Cypress.Chainable<Cypress.Response> => {
  return cy.request({
    method: 'POST',
    url: '/api/v2/scrapers',
    body: {
      name: scraperName,
      type,
      url,
      orgID,
      bucketID,
    },
  })
}

export const createTelegraf = (
  name?: string,
  description?: string,
  orgID?: string,
  bucket?: string
): Cypress.Chainable<Cypress.Response> => {
  return cy.request({
    method: 'POST',
    url: '/api/v2/telegrafs',
    body: {
      name,
      description,
      agent: {collectionInterval: 10000},
      plugins: [
        {
          name: 'influxdb_v2',
          type: 'output',
          comment: 'string',
          config: {
            urls: ['string'],
            token: 'string',
            organization: 'string',
            bucket,
          },
        },
      ],
      orgID,
    },
  })
}

export const createRule = (
  orgID: string,
  endpointID: string,
  name = ''
): Cypress.Chainable<Cypress.Response> => {
  return cy.request({
    method: 'POST',
    url: 'api/v2/notificationRules',
    body: genRule({endpointID, orgID, name}),
  })
}

type RuleArgs = {
  endpointID: string
  orgID: string
  type?: string
  name?: string
}

const genRule = ({
  endpointID,
  orgID,
  type = 'slack',
  name = 'r1',
}: RuleArgs) => ({
  type,
  every: '20m',
  offset: '1m',
  url: '',
  orgID,
  name,
  activeStatus: 'active',
  status: 'active',
  endpointID,
  tagRules: [],
  labels: [],
  statusRules: [
    {currentLevel: 'CRIT', period: '1h', count: 1, previousLevel: 'INFO'},
  ],
  description: '',
  messageTemplate: 'im a message',
  channel: '',
})

/*
[{action: 'write', resource: {type: 'views'}},
      {action: 'write', resource: {type: 'documents'}},
      {action: 'write', resource: {type: 'dashboards'}},
      {action: 'write', resource: {type: 'buckets'}}]}
 */

export const createToken = (
  orgId: string,
  description: string,
  status: string,
  permissions: object[]
): Cypress.Chainable<Cypress.Response> => {
  return cy.request('POST', 'api/v2/authorizations', {
    orgID: orgId,
    description: description,
    status: status,
    permissions: permissions,
  })
}

// TODO: have to go through setup because we cannot create a user w/ a password via the user API
export const setupUser = (): Cypress.Chainable<Cypress.Response> => {
  return cy.request({
    method: 'GET',
    url: '/debug/provision',
  })
}

export const flush = () => {
  cy.request('/debug/flush').then(response => {
    expect(response.status).to.eq(200)
  })
}

export const lines = (numLines = 3) => {
  // each line is 10 seconds before the previous line
  const offset_ms = 10_000
  const now = Date.now()
  const nanos_per_ms = '000000'

  const decendingValues = Array(numLines)
    .fill(0)
    .map((_, i) => i)
    .reverse()

  const incrementingTimes = decendingValues.map(val => {
    return now - offset_ms * val
  })

  return incrementingTimes.map((tm, i) => {
    return `m,tk1=tv1 v=${i + 1} ${tm}${nanos_per_ms}`
  })
}

export const writeData = (
  lines: string[],
  namedBucket?: string
): Cypress.Chainable<Cypress.Response> => {
  return cy.get<Organization>('@org').then((org: Organization) => {
    return cy.get<Bucket>('@bucket').then((bucket: Bucket) => {
      const bucketToUse = namedBucket ?? bucket.name
      return cy.request({
        method: 'POST',
        url: '/api/v2/write?org=' + org.name + '&bucket=' + bucketToUse,
        body: lines.join('\n'),
      })
    })
  })
}

// DOM node getters
export const getByTestID = (
  dataTest: string,
  options?: Partial<
    Cypress.Loggable & Cypress.Timeoutable & Cypress.Withinable & Cypress.Shadow
  >
): Cypress.Chainable => {
  return cy.get(`[data-testid="${dataTest}"]`, options)
}

export const getByTestIDAndSetInputValue = (
  testId: string,
  value: string | number
): Cypress.Chainable => {
  const val = `${value}`
  cy.getByTestID(testId).clear()
  cy.getByTestID(testId)
    .focus()
    .type(val)

  return cy.getByTestID(testId).should('have.value', val)
}

export const getByTestIDSubStr = (dataTest: string): Cypress.Chainable => {
  return cy.get(`[data-testid*="${dataTest}"]`)
}

export const getByInputName = (name: string): Cypress.Chainable => {
  return cy.get(`input[name=${name}]`)
}

export const getByInputValue = (value: string): Cypress.Chainable => {
  return cy.get(`input[value='${value}']`)
}

export const getByTitle = (name: string): Cypress.Chainable => {
  return cy.get(`[title="${name}"]`)
}

// Helper function for filling in login details on OSS.

export const fillInOSSLoginFormWithDefaults = () => {
  cy.get<string>('@defaultUser').then((defaultUser: string) => {
    cy.getByTestID('input-field--username').type(defaultUser)
  })
  cy.get<string>('@defaultPassword').then((defaultPassword: string) => {
    cy.getByTestID('input-field--password').type(defaultPassword)
    cy.getByTestID('input-field--password-chk').type(defaultPassword)
  })

  cy.get<string>('@defaultOrg').then((defaultOrg: string) => {
    cy.getByTestID('input-field--orgname').type(defaultOrg)
  })

  cy.get<string>('@defaultBucket').then((defaultBucket: string) => {
    cy.getByTestID('input-field--bucketname').type(defaultBucket)
  })
}

// custom assertions

// fluxEqual strips flux scripts of whitespace and newlines to make the
// strings easier to match by the human eye during testing
export const fluxEqual = (s1: string, s2: string): Cypress.Chainable => {
  // remove new lines and spaces
  const strip = (s: string) => s.replace(/(\r\n|\n|\r| +)/g, '')
  const strip1 = strip(s1)
  const strip2 = strip(s2)

  cy.log('comparing strings: ')
  cy.log(strip1)
  cy.log(strip2)

  return cy.wrap(strip1 === strip2)
}

// notification endpoints
export const createEndpoint = (
  endpoint: NotificationEndpoint
): Cypress.Chainable<Cypress.Response> => {
  return cy.request('POST', 'api/v2/notificationEndpoints', endpoint)
}

// helpers
// Re-query elements that are found 'detached' from the DOM
// https://github.com/cypress-io/cypress/issues/7306
export const clickAttached = (subject?: JQuery<HTMLElement>) => {
  if (!subject) {
    console.error('no element provided to "clickAttached"')
    return
  }

  cy.wrap(subject).should($el => {
    // ensure the element is attached
    expect(Cypress.dom.isDetached($el)).to.be.false

    // using Jquery click here so no queuing from cypress side and not chance for the element to detach
    $el.trigger('click')
  })
}

/* eslint-disable */
// notification endpoints
Cypress.Commands.add('createEndpoint', createEndpoint)
// notification rules
Cypress.Commands.add('createRule', createRule)

// assertions
Cypress.Commands.add('fluxEqual', fluxEqual)

// getters
Cypress.Commands.add('getByTestID', getByTestID)
Cypress.Commands.add('getByInputName', getByInputName)
Cypress.Commands.add('getByInputValue', getByInputValue)
Cypress.Commands.add('getByTitle', getByTitle)
Cypress.Commands.add('getByTestIDSubStr', getByTestIDSubStr)

// auth flow
Cypress.Commands.add('signin', signin)

// setup
Cypress.Commands.add('setupUser', setupUser)
Cypress.Commands.add(
  'wrapEnvironmentVariablesForCloud',
  wrapEnvironmentVariablesForCloud
)
Cypress.Commands.add(
  'wrapEnvironmentVariablesForOss',
  wrapEnvironmentVariablesForOss
)

// dashboards
Cypress.Commands.add('createDashboard', createDashboard)
Cypress.Commands.add('createCell', createCell)
Cypress.Commands.add('createDashWithCell', createDashWithCell)
Cypress.Commands.add('createDashWithViewAndVar', createDashWithViewAndVar)
Cypress.Commands.add('createView', createView)

// orgs
Cypress.Commands.add('createOrg', createOrg)
Cypress.Commands.add('deleteOrg', deleteOrg)

// buckets
Cypress.Commands.add('createBucket', createBucket)

// scrapers
Cypress.Commands.add('createScraper', createScraper)

// telegrafs
Cypress.Commands.add('createTelegraf', createTelegraf)

// general
Cypress.Commands.add('flush', flush)

// tasks
Cypress.Commands.add('createTask', createTask)

// tokens
Cypress.Commands.add('createToken', createToken)

// variables
Cypress.Commands.add('createQueryVariable', createQueryVariable)
Cypress.Commands.add('createCSVVariable', createCSVVariable)
Cypress.Commands.add('createMapVariable', createMapVariable)

// labels
Cypress.Commands.add('createLabel', createLabel)
Cypress.Commands.add('createAndAddLabel', createAndAddLabel)

// test
Cypress.Commands.add('writeData', writeData)

// helpers
Cypress.Commands.add('clickAttached', {prevSubject: 'element'}, clickAttached)
Cypress.Commands.add(
  'fillInOSSLoginFormWithDefaults',
  fillInOSSLoginFormWithDefaults
)
Cypress.Commands.add('getByTestIDAndSetInputValue', getByTestIDAndSetInputValue)
/* eslint-enable */
