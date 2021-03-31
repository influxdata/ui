import _ from 'lodash'

import linksReducer from 'src/shared/reducers/links'
import {linksGetCompleted} from 'src/shared/actions/links'
import {Links} from 'src/types/links'

const links: Links = {
  authorizations: '/api/v2/authorizations',
  buckets: '/api/v2/buckets',
  dashboards: '/api/v2/dashboards',
  external: {
    statusFeed: 'https://www.influxdata.com/feed/json',
  },
  query: {
    self: '/api/v2/query',
    ast: '/api/v2/query/ast',
    suggestions: '/api/v2/query/suggestions',
  },
  orgs: '/api/v2/orgs',
  setup: '/api/v2/setup',
  signin: '/api/v2/signin',
  signout: '/api/v2/signout',
  sources: '/api/v2/sources',
  system: {
    debug: '/debug/pprof',
    health: '/healthz',
    metrics: '/metrics',
  },
  tasks: '/api/v2/tasks',
  users: '/api/v2/users',
  write: '/api/v2/write',
  variables: '/api/v2/variables',
  views: '/api/v2/views',
  defaultDashboard: '/v2/dashboards/029d13fda9c5b000',
  me: '/api/v2/me',
}

describe('Shared.Reducers.linksReducer', () => {
  it('can handle LINKS_GET_COMPLETED', () => {
    const actual = linksReducer(undefined, linksGetCompleted(links))
    const expected = links
    expect(_.isEqual(actual, expected)).toBe(true)
  })
})
