import {ResourceOwner} from 'src/client'

export const resouceOwner: ResourceOwner[] = [
  {
    id: '1',
    name: 'John',
    status: 'active',
    links: {
      self: '/api/v2/users/1',
    },
    role: 'owner',
  },
  {
    id: '2',
    name: 'Jane',
    status: 'active',
    links: {
      self: '/api/v2/users/2',
    },
    role: 'owner',
  },
  {
    id: '3',
    name: 'Smith',
    status: 'active',
    links: {
      self: '/api/v2/users/3',
    },
    role: 'owner',
  },
]
