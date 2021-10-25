import {allAccessPermissions, toggleSelectedBucket} from './permissions'
import {CLOUD} from 'src/shared/constants'
import {generateDescription, formatApiPermissions} from 'src/authorizations/utils/permissions'

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

// test format api perms - the method that converts perm into api style perm 
// perm = { annotations: {read: true, write: false}} --> perm = {{action: read, resource: {orgID: 3432, type: annotations}}}
const orgID = "ba9198e037d35d4d"
const orgName = "blegesse"
const monitoringID = "25a6692ba25d7147"

const allAccessPerms = {
  annotations: {
      read: true, 
      write: false 
   },
  authorizations: {
      read: false, 
      write: true
  },
}

const allAccessApiPerm = [
  {
    action: 'read',
    resource: {
      orgID: orgID,
      type: 'annotations',
    }
  }, 
  {
    action: 'write',
    resource: {
      orgID: orgID,
      type: 'authorizations',
    }
  }
  
]

const nonAllAcessPerms = {
  buckets: {
    read: false, 
    write: false, 
    sublevelPermissions: {
      "25a6692ba25d7147": {
          id: "25a6692ba25d7147",
          name: "_monitoring",
          orgID: "ba9198e037d35d4d",
          permissions: {read: true, write: true}
        },
      "28eccf12e3e4ff8e": {
          id: "28eccf12e3e4ff8e",
          name: "frontendservices",
          orgID: "ba9198e037d35d4d",
          permissions: {read: false, write: false}
        },
        "32b8e84498b27938": {
          id: "32b8e84498b27938",
          name: "devbucket",
          orgID: "ba9198e037d35d4d",
          permissions: {read: false, write: false}
        },
      }   

  }
}

const nonAllAcessApiPerms = [
  {
    action: 'read', 
    resource: { 
      orgID: orgID,
      type: 'buckets',
      id: monitoringID,
      name: "_monitoring"
    }
  },
  {
    action: 'write', 
    resource: { 
      orgID: orgID,
      type: 'buckets',
      id: monitoringID,
      name: "_monitoring"
    }
  }
  
]

const orgsPerm = {
  orgs: {
    read: true, 
    write: true
  }
}

const orgsApiPerm = [
  {
    action: 'read',
    resource: {
      id: orgID,
      name: orgName,
      type: 'orgs',
    },
  },
  {
    action: 'write',
      resource: {
        id: orgID,
        name: orgName,
        type: 'orgs',
      },
  }
]
const permissions = {
  annotations: {
      read: false, 
      write: false 
   },
  authorizations: {
      read: false, 
      write: false
  },
  buckets: {
      read: false, 
      write: false, 
      sublevelPermissions: {
        "25a6692ba25d7147": {
            id: "25a6692ba25d7147",
            name: "_monitoring",
            orgID: "ba9198e037d35d4d",
            permissions: {read: true, write: true}
          },
        "28eccf12e3e4ff8e": {
            id: "28eccf12e3e4ff8e",
            name: "frontendservices",
            orgID: "ba9198e037d35d4d",
            permissions: {read: false, write: false}
          },
          "32b8e84498b27938": {
            id: "32b8e84498b27938",
            name: "devbucket",
            orgID: "ba9198e037d35d4d",
            permissions: {read: false, write: false}
          },
        }   

  },
  checks: {
      read: false, 
      write: false
  },
  dashboards: {
      read: false, 
      write: false
  },
  dbrp: {
      read: false, 
      write: false
  },
  documents: {
      read: false,
      write: false
  },
  flows: {
      read: false, 
      write: false
  },
  functions: {
      read: false, 
      write: false
  },
  labels: {
      read: false, 
      write: false
  },
  notificationEndpoints: {
      read: false, 
      write: false
  },
  notificationRules: {
      read: false, 
      write: false
  },
  orgs: {
      read: false, 
      write: false
  },
  otherResources: {
      read: false, 
      write: false
  },
  scrapers: {
      read: false, 
      write: false
  },
  secrets: {
      read: false, 
      write: false
  },
  sources: {
      read: false, 
      write: false
  },
  tasks: {
      read: false, 
      write: false
  },
  telegrafs: {
      read: false, 
      write: false, 
      sublevelPermissions: {}
  },
  users: {
      read: false, 
      write: false
  },
  variables: {
      read: false, 
      write: false
  }

} 

describe('formatApiPermissions method', () => {
  test('does it convert all access permission object into api permission', () => {
    expect(formatApiPermissions(allAccessPerms, orgID, orgName)).toEqual(allAccessApiPerm)
  })
  test('does it convert non-all access permission object into api permission', () => {
    expect(formatApiPermissions(nonAllAcessPerms, orgID, orgName)).toEqual(nonAllAcessApiPerms)
  })
  test('does it convert orgs permission object into api permission', () => {
    expect(formatApiPermissions(orgsPerm, orgID, orgName)).toEqual(orgsApiPerm)
  })
  
})