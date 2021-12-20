import {Authorization} from 'src/types'

export const authorization: Authorization = {
  links: {
    self: '/api/v2/authorizations/030444b11fb10000',
    user: '/api/v2/users/030444b10a710000',
  },
  id: '030444b11fb10000',
  token:
    'ohEmfY80A9UsW_cicNXgOMIPIsUvU6K9YcpTfCPQE3NV8Y6nTsCwVghczATBPyQh96CoZkOW5DIKldya6Y84KA==',
  status: 'active',
  user: 'watts',
  userID: '030444b10a710000',
  orgID: '030444b10a713000',
  description: 'im a token',
  permissions: [
    {action: 'write', resource: {type: 'orgs'}},
    {action: 'write', resource: {type: 'buckets'}},
  ],
}
