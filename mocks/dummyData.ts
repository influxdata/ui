import {match} from 'react-router'
import {RouteComponentProps} from 'react-router-dom'
import {AuthorizationUpdateRequest, Organization} from 'src/types'

export const orgs: Organization[] = [
  {
    links: {
      buckets: '/api/v2/buckets?org=RadicalOrganization',
      dashboards: '/api/v2/dashboards?org=RadicalOrganization',
      self: '/api/v2/orgs/02ee9e2a29d73000',
      tasks: '/api/v2/tasks?org=RadicalOrganization',
    },
    id: '02ee9e2a29d73000',
    name: 'RadicalOrganization',
  },
]

const match: match<{orgID: string}> = {
  isExact: false,
  path: '',
  url: '',
  params: {
    orgID: '1',
  },
}

export const withRouterProps: RouteComponentProps<{orgID: string}> = {
  match,
  location: null,
  history: null,
}

export const auth2 = {
  id: '03c03a8a64728000',
  token:
    'RcW2uWiD-vfxujKyJCirK8un3lJsWPfiA6ulmWY_SlSITUal7Z180OwExiKKfrO98X8W6qGrd5hSGdag-hEpWw==',
  status: AuthorizationUpdateRequest.StatusEnum.Active,
  description: 'My token',
  orgID: '039edab314789000',
  org: 'a',
  createdAt: '2020-08-19T23:13:44.514Z',
  updatedAt: '2020-08-19T23:13:44.514Z',
  userID: '039edab303789000',
  user: 'adminuser',
  permissions: [
    {
      action: 'read',
      resource: {
        type: 'orgs',
        id: '039edab314789000',
        name: 'a',
      },
    },
    {
      action: 'read',
      resource: {
        type: 'authorizations',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'write',
      resource: {
        type: 'authorizations',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'read',
      resource: {
        type: 'buckets',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'write',
      resource: {
        type: 'buckets',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'read',
      resource: {
        type: 'dashboards',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'write',
      resource: {
        type: 'dashboards',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'read',
      resource: {
        type: 'sources',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'write',
      resource: {
        type: 'sources',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'read',
      resource: {
        type: 'tasks',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'write',
      resource: {
        type: 'tasks',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'read',
      resource: {
        type: 'telegrafs',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'write',
      resource: {
        type: 'telegrafs',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'read',
      resource: {
        type: 'users',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'write',
      resource: {
        type: 'users',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'read',
      resource: {
        type: 'variables',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'write',
      resource: {
        type: 'variables',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'read',
      resource: {
        type: 'scrapers',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'write',
      resource: {
        type: 'scrapers',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'read',
      resource: {
        type: 'secrets',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'write',
      resource: {
        type: 'secrets',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'read',
      resource: {
        type: 'labels',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'write',
      resource: {
        type: 'labels',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'read',
      resource: {
        type: 'views',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'write',
      resource: {
        type: 'views',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'read',
      resource: {
        type: 'documents',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
    {
      action: 'write',
      resource: {
        type: 'documents',
        orgID: '039edab314789000',
        org: 'a',
      },
    },
  ],
  links: {
    self: '/api/v2/authorizations/03c03a8a64728000',
    user: '/api/v2/users/039edab303789000',
  },
}
