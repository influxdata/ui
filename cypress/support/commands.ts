import {
  AccountType,
  NotificationEndpoint,
  GenEndpoint,
  GenCheck,
  GenRule,
  NotificationRule,
  Secret,
} from '../../src/types'
import {Bucket, Organization} from '../../src/client'
import {FlagMap} from 'src/shared/actions/flags'
import {addTimestampToRecs, addStaggerTimestampToRecs, parseTime} from './Utils'
import 'cypress-file-upload'

const DEX_URL_VAR = 'dexUrl'

Cypress.on('uncaught:exception', (err, _) => {
  // returning false here prevents Cypress from failing the test when there are console errors.
  // this was the default behavior until cypress v7.
  // we expect a 401 error when logging in with DEX's APIs, so ignore that but fail for all other console errors.
  // we also can ignore AbortErrors for when network requests are terminated early.
  return !(
    err.message.includes('unauthorized access') ||
    err.message.includes('Request failed with status code 401') ||
    err.message.includes('The operation was aborted') ||
    err.message.includes('NetworkError') ||
    err.message.includes('path not found') ||
    err.message.includes('Request aborted')
  )
})

export const signin = (
  useIox: boolean = false
): Cypress.Chainable<Cypress.Response<any>> => {
  return cy.setupUser(useIox).then((response: any) => {
    wrapDefaultUser()
      .then(() => wrapDefaultPassword())
      .then(() => {
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
                  } else if (Cypress.env(DEX_URL_VAR) === 'CLOUD') {
                    return loginViaDexUI(username, defaultPassword)
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
}

export const signinWithoutUserReprovision = () => {
  return wrapDefaultUser()
    .then(() => wrapDefaultPassword())
    .then(() => {
      const username = Cypress.env('defaultUser')
      cy.wrap(username)
        .as('defaultUser')
        .then(() => {
          cy.get<string>('@defaultPassword').then((defaultPassword: string) => {
            if (Cypress.env(DEX_URL_VAR) === 'OSS') {
              return loginViaOSS(username, defaultPassword)
            } else if (Cypress.env(DEX_URL_VAR) === 'CLOUD') {
              return loginViaDexUI(username, defaultPassword)
            } else {
              return loginViaDex(username, defaultPassword)
            }
          })
        })
        .then(() => cy.location('pathname').should('not.eq', '/signin'))
        .then(() => wrapEnvironmentVariablesForCloud())
    })
}

export const loginViaDexUI = (username: string, password: string) => {
  cy.visit('/')
  cy.get('#login').type(username)
  cy.get('#password').type(password)
  cy.get('#submit-login').click()
}

Cypress.Commands.add(
  'monacoType',
  {prevSubject: true},
  (subject, text: string, force = true, delay = 10) => {
    return cy.wrap(subject).within(() => {
      cy.get('.monaco-editor .view-line:last')
        .click({force: true})
        .focused()
        .type(text, {force, delay})
    })
  }
)

// login via the purple OSS screen by typing in username/password
// this is only used if you're using monitor-ci + DEV_MODE_CLOUD=0
export const loginViaOSS = (username: string, password: string) => {
  cy.visit('/')
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
          url: resp.headers.location as string,
          followRedirect: false,
          method: 'GET',
        })
        .then(secondResp =>
          cy
            .request({
              url: Cypress.env(DEX_URL_VAR) + secondResp.headers.location,
              method: 'POST',
              form: true,
              body: {
                login: username,
                password: password,
              },
              followRedirect: false,
            })
            .then(thirdResp => {
              const req = (thirdResp.headers.location as string).split(
                '/approval?req='
              )[1]
              return cy
                .request({
                  url: thirdResp.redirectedToUrl,
                  followRedirect: true,
                  form: true,
                  method: 'POST',
                  body: {req: req, approval: 'approve'},
                })
                .then(() => {
                  cy.visit('/')
                  cy.location('pathname').should('not.eq', '/signin')
                  return cy.getByTestID('tree-nav')
                })
            })
        )
    )
}

export const wrapEnvironmentVariablesForCloud = (): Cypress.Chainable<
  Cypress.Response<any>
> => {
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
        return wrapDefaultBucket()
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
): Cypress.Chainable<Cypress.Response<any>> => {
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
): Cypress.Chainable<Cypress.Response<any>> => {
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
  cellID: string,
  viewFile = 'view'
): Cypress.Chainable<Cypress.Response<any>> => {
  return cy.fixture(viewFile).then(view => {
    return cy.request({
      method: 'PATCH',
      url: `/api/v2/dashboards/${dbID}/cells/${cellID}/view`,
      body: view,
    })
  })
}

export const createDashWithCell = (
  orgID: string
): Cypress.Chainable<Cypress.Response<any>> =>
  createDashboard(orgID).then(({body: dashboard}) => createCell(dashboard.id))

export const createDashWithViewAndVar = (
  orgID: string
): Cypress.Chainable<Cypress.Response<any>> => {
  createMapVariable(orgID)
  return createDashboard(orgID).then(({body: dashboard}) =>
    createCell(dashboard.id).then(({body: cell}) =>
      createView(dashboard.id, cell.id)
    )
  )
}

export const createOrg = (
  name = 'test org'
): Cypress.Chainable<Cypress.Response<any>> => {
  return cy.request({
    method: 'POST',
    url: '/api/v2/orgs',
    body: {
      name,
    },
  })
}

export const deleteOrg = (
  id: string
): Cypress.Chainable<Cypress.Response<any>> => {
  return cy.request({
    method: 'DELETE',
    url: `/api/v2/orgs/${id}`,
  })
}

export const createBucket = (
  orgID?: string,
  organization?: string,
  bucketName?: string
): Cypress.Chainable<Cypress.Response<any>> => {
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

export const upsertSecret = (
  orgID: string,
  secret: Secret
): Cypress.Chainable<Cypress.Response<any>> => {
  return cy.request({
    method: 'PATCH',
    url: `/api/v2/orgs/${orgID}/secrets`,
    body: secret,
  })
}

// TODO: (sahas) need to make this function to actually mimic the navbar functionality
export const clickNavBarItem = (testID: string): Cypress.Chainable => {
  return cy.getByTestID(testID).click({force: true})
}

export const createTask = (
  token: string,
  orgID?: string,
  name: string = '🦄ask'
): Cypress.Chainable<Cypress.Response<any>> => {
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
): Cypress.Chainable<Cypress.Response<any>> => {
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
): Cypress.Chainable<Cypress.Response<any>> => {
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
): Cypress.Chainable<Cypress.Response<any>> => {
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

export const createMapVariableFromFixture = (
  fixName: string,
  orgID?: string
): Cypress.Chainable<Cypress.Response<any>> => {
  return cy.fixture(fixName).then(varBody => {
    varBody.orgID = orgID
    return cy.request({
      method: 'POST',
      url: '/api/v2/variables',
      body: varBody,
    })
  })
}

export const createLabel = (
  name?: string,
  orgID?: string,
  properties: {description: string; color: string} = {
    description: `test ${name}`,
    color: '#ff0054',
  }
): Cypress.Chainable<Cypress.Response<any>> => {
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
): Cypress.Chainable<Cypress.Response<any>> => {
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
): Cypress.Chainable<Cypress.Response<any>> => {
  return cy.request({
    method: 'POST',
    url: `/api/v2/${resource}/${resourceID}/labels`,
    body: {labelID},
  })
}

export const createSource = (
  orgID?: string
): Cypress.Chainable<Cypress.Response<any>> => {
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
): Cypress.Chainable<Cypress.Response<any>> => {
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
): Cypress.Chainable<Cypress.Response<any>> => {
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
): Cypress.Chainable<Cypress.Response<any>> => {
  return cy.request('POST', 'api/v2/authorizations', {
    orgID: orgId,
    description: description,
    status: status,
    permissions: permissions,
  })
}

export const setupUser = (useIox: boolean = false): Cypress.Chainable<any> => {
  useIox = Cypress.env('useIox') || useIox
  const defaultUser = Cypress.env('defaultUser')
  const params = new URLSearchParams()
  if (defaultUser) {
    params.set('user', defaultUser)
  }
  if (useIox) {
    params.set('orgSuffix', 'ioxlighthouse')
  }
  return cy
    .request({
      method: 'GET',
      url: `/debug/provision?${params.toString()}`,
    })
    .then(response => {
      if (response.status === 200) {
        Cypress.env('defaultUser', response.body.user.name)
        if (defaultUser) {
          return cy
            .log(`re-provsioned user ${defaultUser} successfully`)
            .then(() => response)
        } else {
          return cy
            .log(`provisioned new user ${response.body.user.name} successfully`)
            .then(() => response)
        }
      } else {
        // if for some reason the user wasn't flushed, do it now
        return cy
          .log('retrying the /flush because /provision failed')
          .then(() =>
            cy.flush().then(_ => cy.setupUser(useIox).then(res => res))
          )
      }
    })
}

export const flush = (): Cypress.Chainable<Cypress.Response<any>> => {
  const defaultUser = Cypress.env('defaultUser')
  if (defaultUser) {
    return cy
      .request({method: 'POST', url: `/debug/flush?user=${defaultUser}`})
      .then(response => {
        expect(response.status).to.eq(200)
        return cy
          .log(`flushed user ${defaultUser} successfully`)
          .then(() => response)
      })
  } else {
    // this isn't really needed - just need to return a chainable cypress obj
    return cy.request({method: 'GET', url: '/debug/flush'}).then(response => {
      expect(response.status).to.eq(200)
      return response
    })
  }
}

/**
 * numAccounts: this is the number of accounts that a particular user has.
 * (if there is more than one account, then show the switch button,
 * if only one account don't show the switch button)
 *
 * if this number is not supplied, then quartz-mock has a default value of 1 (1 account)
 *
 *  this is for the new multi-user/multi-account capability (adding to the UI in early 2022)
 * */
export type ProvisionData = {
  accountType?: AccountType
  hasData?: boolean
  hasUsers?: boolean
  isOperator?: boolean
  operatorRole?: string
  isRegionBeta?: boolean
  numAccounts?: number
}

/*
  This step provisions some meta data for the quartz mock API and allows the UI
  to create different states with which to test the API. More specifically, this
  allows us to test scenarios when a user is:
  - pay_as_you_go vs free
  - is an operator
  - has users
  - is in a beta region
  - has usage data vs has no usage data

  Defaults for these are set in memory on the server when requests are made. The defaults are:

  - accountType = free
  - hasData = false
  - hasUsers = false
  - isOperator = false
  - isRegionBeta = false

  In order to update any of these properties for testing purposes, all you need to do is
  pass in the data you want to set and let the server take care of the rest.

  For example:

  cy.quartzProvision({accountType: 'pay_as_you_go'})

  Will set the server session in memory to allow for tests to be run within the context of
  a pay as you go user.
*/

export const quartzProvision = (
  data: ProvisionData
): Cypress.Chainable<Cypress.Response<any>> => {
  return cy.request('/api/v2/quartz/provision', data).then(response => {
    expect(response.status).to.eq(200)
  })
}

export const points = (numPoints = 3, offsetMilliseconds = 10_000) => {
  // each point is 10 seconds (10,000ms) before the previous point by default
  // the offset can be changed with the second argument
  const now = Date.now()
  const nanos_per_ms = '000000'

  const decendingValues = Array(numPoints)
    .fill(0)
    .map((_, i) => i)
    .reverse()

  const incrementingTimes = decendingValues.map(val => {
    return now - offsetMilliseconds * val
  })

  return incrementingTimes.map((tm, i) => {
    return `m,tk1=tv1 v=${i + 1} ${tm}${nanos_per_ms}`
  })
}

export const writeData = (
  lines: string[],
  namedBucket?: string
): Cypress.Chainable<Cypress.Response<any>> => {
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

export interface WriteLPDataConf {
  lines: string[]
  offset: string
  stagger?: boolean | string
  namedBucket?: string
}

export const writeLPData = (args: WriteLPDataConf): Cypress.Chainable => {
  args.stagger = args.stagger ?? true
  const oe = parseTime(args.offset)
  if (oe.measure >= 0) {
    args.offset = `-${args.offset}`
    oe.measure *= -1
  }

  let interval = ''
  if (args.stagger && typeof args.stagger === 'boolean') {
    interval = `${(oe.measure / args.lines.length) * -1}${oe.unit}`
  } else if (typeof args.stagger === 'string') {
    interval = args.stagger
  }

  if (args.stagger) {
    return addStaggerTimestampToRecs(args.lines, args.offset, interval).then(
      stampedLines => {
        if (args.namedBucket) {
          return writeData(stampedLines, args.namedBucket).then(response => {
            if (response.status !== 204) {
              throw `Problem writing data. Status: ${response.status} ${response.statusText}`
            }
            return cy.wrap('success')
          })
        } else {
          return writeData(stampedLines).then(response => {
            if (response.status !== 204) {
              throw `Problem writing data. Status: ${response.status} ${response.statusText}`
            }
            return cy.wrap('success')
          })
        }
      }
    )
  } else {
    return addTimestampToRecs(args.lines, args.offset).then(stampedLines => {
      if (args.namedBucket) {
        return writeData(stampedLines, args.namedBucket).then(response => {
          if (response.status !== 204) {
            throw `Problem writing data. Status: ${response.status} ${response.statusText}`
          }
          return cy.wrap('success')
        })
      } else {
        return writeData(stampedLines).then(response => {
          if (response.status !== 204) {
            throw `Problem writing data. Status: ${response.status} ${response.statusText}`
          }
          return cy.wrap('success')
        })
      }
    })
  }
}

export interface WriteLPFileDataConf {
  filename: string
  offset: string
  stagger?: boolean | string
  namedBucket?: string
}

/*
 *  Force datafile to reside in directory cypress/fixtures
 * */
export const writeLPDataFromFile = (
  args: WriteLPFileDataConf
): Cypress.Chainable => {
  // check for file paths starting with relative or absolute chars
  if (args.filename.match(/.*\.\..*|^\//)) {
    throw `${args.filename} unhandled path. Filename path must be in or relative to the cypress/fixtures directory`
  }

  // prepend './cypress/fixtures' if not already in path
  if (!args.filename.match(/^(.\/)?cypress\/fixtures/)) {
    args.filename = './cypress/fixtures/' + args.filename
  }
  return cy.readFile(args.filename).then(contents => {
    const data: string[] = contents.split('\n')
    return cy.writeLPData({
      lines: data,
      offset: args.offset,
      stagger: args.stagger,
      namedBucket: args.namedBucket,
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

export const getByTestIDHead = (
  dataTest: string,
  options?: Partial<
    Cypress.Loggable & Cypress.Timeoutable & Cypress.Withinable & Cypress.Shadow
  >
): Cypress.Chainable => {
  return cy.get(`[data-testid^="${dataTest}"]`, options)
}

export const getByTestIDAndSetInputValue = (
  testId: string,
  value: string | number
): Cypress.Chainable => {
  const val = `${value}`
  cy.getByTestID(testId).clear()
  cy.getByTestID(testId).focus().type(val)

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
): Cypress.Chainable<Cypress.Response<any>> => {
  return cy.request('POST', 'api/v2/notificationEndpoints', endpoint)
}

// checks
export const createCheck = (
  check: GenCheck
): Cypress.Chainable<Cypress.Response<any>> => {
  return cy.request('POST', 'api/v2/checks', check)
}

// rules
export const createRule = (
  rule: NotificationRule
): Cypress.Chainable<Cypress.Response<any>> => {
  return cy.request('POST', 'api/v2/notificationRules', rule)
}

// alertGroup
export const createAlertGroup = (
  checks: GenCheck[],
  endps: GenEndpoint[],
  rules: GenRule[]
): Cypress.Chainable => {
  return cy.get<Organization>('@org').then((org: Organization) => {
    cy.get<Bucket>('@bucket').then((bucket: Bucket) => {
      cy.log('=== get default org and bucket')
      checks.forEach((check, index) => {
        cy.log(`=== create check ${check.name}`)
        cy.createCheck({
          ...check,
          orgID: org.id,
          query: {
            ...check.query,
            text: check.query.text.replace('%BUCKET_NAME%', bucket.name),
            builderConfig: {
              ...check.query.builderConfig,
              buckets: [bucket.id],
            },
          },
        }).then((resp: any) => {
          cy.wrap(resp.body).as(`check${index}`)
        })
      })

      endps.forEach((endp, index) => {
        cy.log(`=== create endpoint ${endp.name}`)
        cy.createEndpoint({
          ...(endp as NotificationEndpoint),
          orgID: org.id,
        }).then(resp => {
          cy.log(`DEBUG wrapping endp as "endp${index}"`)
          cy.wrap(resp.body).as(`endp${index}`)
        })
      })
      cy.get<NotificationEndpoint>('@endp0').then(endp => {
        rules.forEach((rule, index) => {
          cy.log(`=== create rule ${rule.name}`)
          cy.createRule({...rule, orgID: org.id, endpointID: endp.id}).then(
            resp => {
              cy.wrap(resp.body).as(`rule${index}`)
            }
          )
        })
      })
    })
  })
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

type GraphSnapshot = {
  shouldBeSameAs: (
    other: GraphSnapshot,
    same?: boolean,
    part?: 'axes' | 'layer' | 'both'
  ) => void
  name: string
}

export const makeGraphSnapshot = (() => {
  // local properties for makeGraphSnapshot function
  let lastGraphSnapsotIndex = 0
  const getNameAxes = (name: string) => `${name}-axes`
  const getNameLayer = (name: string) => `${name}-layer`

  return (): GraphSnapshot => {
    // generate unique name for snapshot for saving as cy var
    const name = `graph-snapshot-${lastGraphSnapsotIndex++}`

    // wait for drawing done
    cy.wait(500)
    cy.get('[data-testid|=giraffe-layer]')
      .then($layer => ($layer[0] as HTMLCanvasElement).toDataURL('image/jpeg'))
      .as(getNameLayer(name))

    cy.getByTestID('giraffe-axes')
      .then($axes => ($axes[0] as HTMLCanvasElement).toDataURL('image/jpeg'))
      .as(getNameAxes(name))

    return {
      name,
      shouldBeSameAs: ({name: nameOther}, same = true, part = 'both') => {
        const assert = (str: any, str2: any, same: boolean) => {
          if (same) {
            expect(str).to.eq(str2)
          } else {
            expect(str).to.not.eq(str2)
          }
        }

        if (part === 'both' || part === 'axes') {
          cy.get(`@${getNameAxes(name)}`).then(axes => {
            cy.get(`@${getNameAxes(nameOther)}`).then(axesOther => {
              assert(axes, axesOther, same)
            })
          })
        }

        if (part === 'both' || part === 'layer') {
          cy.get(`@${getNameLayer(name)}`).then(layer => {
            cy.get(`@${getNameLayer(nameOther)}`).then(layerOther => {
              assert(layer, layerOther, same)
            })
          })
        }
      },
    }
  }
})()

export const setFeatureFlags = (flags: FlagMap): Cypress.Chainable => {
  // Need to refresh page so that flags responses can be overwritten
  return cy.setFeatureFlagsNoNav(flags).reload().getByTestID('tree-nav')
}

export const setFeatureFlagsNoNav = (flags: FlagMap): Cypress.Chainable => {
  // use in lieu of setFeatureFlags when no left nav bar is expected.
  const flagsURIs = ['/api/v2private/flags', '/api/v2/flags']
  flagsURIs.forEach(url => {
    cy.intercept(url, req => {
      req.continue(res => {
        res.send({...res.body, ...flags})
      })
    }).as('setFeatureFlagsResponse')
  })

  return cy.wait(0)
}

export const createTaskFromEmpty = (
  name: string,
  flux: (bucket: Bucket) => string,
  interval: string = '24h',
  offset: string = '20m',
  force: boolean = true,
  delay: number = 0
) => {
  cy.getByTestID('create-task--button').first().click()

  cy.get<Bucket>('@bucket').then(bucket => {
    cy.getByTestID('flux-editor').monacoType(flux(bucket), force, delay)
  })

  cy.getByInputName('name').type(name)
  cy.getByTestID('task-form-schedule-input').type(interval)
  cy.getByTestID('task-form-offset-input').type(offset)
}

/* eslint-disable */
// notification endpoints
Cypress.Commands.add('createEndpoint', createEndpoint)
// notification rules
Cypress.Commands.add('createRule', createRule)
// checks
Cypress.Commands.add('createCheck', createCheck)
// alert group
Cypress.Commands.add('createAlertGroup', createAlertGroup)

// assertions
Cypress.Commands.add('fluxEqual', fluxEqual)

// getters
Cypress.Commands.add('getByTestID', getByTestID)
Cypress.Commands.add('getByInputName', getByInputName)
Cypress.Commands.add('getByInputValue', getByInputValue)
Cypress.Commands.add('getByTitle', getByTitle)
Cypress.Commands.add('getByTestIDSubStr', getByTestIDSubStr)
Cypress.Commands.add('getByTestIDHead', getByTestIDHead)

// auth flow
Cypress.Commands.add('signin', signin)
Cypress.Commands.add(
  'signinWithoutUserReprovision',
  signinWithoutUserReprovision
)

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

// navigation bar
Cypress.Commands.add('clickNavBarItem', clickNavBarItem)

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
Cypress.Commands.add('quartzProvision', quartzProvision)

// tasks
Cypress.Commands.add('createTask', createTask)

// tokens
Cypress.Commands.add('createToken', createToken)

// variables
Cypress.Commands.add('createQueryVariable', createQueryVariable)
Cypress.Commands.add('createCSVVariable', createCSVVariable)
Cypress.Commands.add('createMapVariable', createMapVariable)
Cypress.Commands.add(
  'createMapVariableFromFixture',
  createMapVariableFromFixture
)

// labels
Cypress.Commands.add('createLabel', createLabel)
Cypress.Commands.add('createAndAddLabel', createAndAddLabel)

// secrets
Cypress.Commands.add('upsertSecret', upsertSecret)

// test
Cypress.Commands.add('writeData', writeData)
Cypress.Commands.add(`writeLPData`, writeLPData)
Cypress.Commands.add(`writeLPDataFromFile`, writeLPDataFromFile)

// helpers
Cypress.Commands.add('clickAttached', {prevSubject: 'element'}, clickAttached)
Cypress.Commands.add(
  'fillInOSSLoginFormWithDefaults',
  fillInOSSLoginFormWithDefaults
)
Cypress.Commands.add('getByTestIDAndSetInputValue', getByTestIDAndSetInputValue)
Cypress.Commands.add('setFeatureFlags', setFeatureFlags)
Cypress.Commands.add('setFeatureFlagsNoNav', setFeatureFlagsNoNav)
Cypress.Commands.add('createTaskFromEmpty', createTaskFromEmpty)
/* eslint-enable */
