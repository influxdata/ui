import {allAccessPermissions, toggleSelectedBucket} from './permissions'
import {CLOUD} from 'src/shared/constants'
import {generateDescription} from 'src/authorizations/utils/permissions'

// TODO remove all of this when we move to server side authority
const ossHvhs = [
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'annotations',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'annotations',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'authorizations',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'authorizations',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'buckets',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'buckets',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'checks',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'checks',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'dashboards',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'dashboards',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'dbrp',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'dbrp',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'documents',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'documents',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'labels',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'labels',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'notebooks',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'notebooks',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'notificationEndpoints',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'notificationEndpoints',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'notificationRules',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'notificationRules',
    },
  },
  {
    action: 'read',
    resource: {
      id: 'bulldogs',
      type: 'orgs',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'scrapers',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'scrapers',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'secrets',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'secrets',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'sources',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'sources',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'tasks',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'tasks',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'telegrafs',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'telegrafs',
    },
  },
  {
    action: 'read',
    resource: {
      id: 'mario',
      type: 'users',
    },
  },
  {
    action: 'write',
    resource: {
      id: 'mario',
      type: 'users',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'variables',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'variables',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'views',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'views',
    },
  },
]
const cloudHvhs = [
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'annotations',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'annotations',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'authorizations',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'authorizations',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'buckets',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'buckets',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'checks',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'checks',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'dashboards',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'dashboards',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'dbrp',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'dbrp',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'documents',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'documents',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'flows',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'flows',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'functions',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'functions',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'labels',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'labels',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'notificationEndpoints',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'notificationEndpoints',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'notificationRules',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'notificationRules',
    },
  },
  {
    action: 'read',
    resource: {
      id: 'bulldogs',
      type: 'orgs',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'secrets',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'secrets',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'tasks',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'tasks',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'telegrafs',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'telegrafs',
    },
  },
  {
    action: 'read',
    resource: {
      id: 'mario',
      type: 'users',
    },
  },
  {
    action: 'write',
    resource: {
      id: 'mario',
      type: 'users',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'variables',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'variables',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'views',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'views',
    },
  },
]

const apiPermission1 = [
  {
    action: 'read',
    resource: {
      id: '34234532',
      name: '_monitoring',
      orgID: 'd34323',
      type: 'buckets',
    },
  },
  {
    action: 'write',
    resource: {
      id: '34233432',
      name: '_monitoring',
      orgID: 'd34323',
      type: 'buckets',
    },
  },
  {
    action: 'read',
    resource: {
      id: '34234532',
      name: 'devbucket',
      orgID: 'd34323',
      type: 'buckets',
    },
  },
  {
    action: 'write',
    resource: {
      id: '34234532',
      name: 'devbucket',
      orgID: 'd34323',
      type: 'buckets',
    },
  },
]

const apiPermission2 = [
  {
    action: 'read',
    resource: {
      orgID: 'd34323',
      type: 'telegraf',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'd34323',
      type: 'telegraf',
    },
  },
]

const apiPermission3 = [
  {
    action: 'read',
    resource: {
      id: '34234532',
      name: '_monitoring',
      orgID: 'd34323',
      type: 'buckets',
    },
  },
  {
    action: 'read',
    resource: {
      id: '34233432',
      name: '_monitoring',
      orgID: 'd34323',
      type: 'buckets',
    },
  },
  {
    action: 'read',
    resource: {
      id: '34234532',
      name: 'devbucket',
      orgID: 'd34323',
      type: 'buckets',
    },
  },
]

const apiPermission4 = [
  {
    action: 'write',
    resource: {
      id: '34234532',
      name: '_monitoring',
      orgID: 'd34323',
      type: 'buckets',
    },
  },
  {
    action: 'write',
    resource: {
      id: '34233432',
      name: '_monitoring',
      orgID: 'd34323',
      type: 'buckets',
    },
  },
  {
    action: 'write',
    resource: {
      id: '34234532',
      name: 'devbucket',
      orgID: 'd34323',
      type: 'buckets',
    },
  },
]

const apiPermission5 = [
  {
    action: 'read',
    resource: {
      id: '34234532',
      name: '_monitoring',
      orgID: 'd34323',
      type: 'buckets',
    },
  },
  {
    action: 'write',
    resource: {
      id: '34233432',
      name: '_monitoring',
      orgID: 'd34323',
      type: 'buckets',
    },
  },
]
test('all-access tokens/authorizations production test', () => {
  if (CLOUD) {
    expect(allAccessPermissions('bulldogs', 'mario')).toMatchObject(cloudHvhs)
  } else {
    expect(allAccessPermissions('bulldogs', 'mario')).toMatchObject(ossHvhs)
  }
})

test('toggleSelectedBucket test', () => {
  const myBuckets: string[] = ['bucket1', 'bucket2', 'bucket3']

  expect(toggleSelectedBucket('bucket4', myBuckets)).toEqual([
    ...myBuckets,
    'bucket4',
  ])

  expect(toggleSelectedBucket('bucket2', myBuckets)).toEqual([
    'bucket1',
    'bucket3',
  ])
})

describe('generateDescription method', () => {
  test('creates a description for token with mutiple permissions', () => {
    expect(generateDescription(apiPermission1)).toBe(
      'Read Multiple Write Multiple'
    )
  })

  test('creates a read multiple description for token with mutiple read only permissions', () => {
    expect(generateDescription(apiPermission3)).toBe('Read Multiple')
  })

  test('creates a write multiple description for token with mutiple write only permissions', () => {
    expect(generateDescription(apiPermission4)).toBe('Write Multiple')
  })

  test('creates a description for token with less than 2 permissions', () => {
    expect(generateDescription(apiPermission2)).toBe(
      'Read telegraf Write telegraf'
    )
  })

  test('creates a description for token with less than 2 permissions', () => {
    expect(generateDescription(apiPermission5)).toBe(
      'Read buckets _monitoring Write buckets _monitoring'
    )
  })
})
