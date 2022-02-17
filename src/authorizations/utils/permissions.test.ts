import {allAccessPermissions, PermissionTypes} from './permissions'
import {CLOUD} from 'src/shared/constants'
import {
  generateDescription,
  formatApiPermissions,
  formatPermissionsObj,
} from 'src/authorizations/utils/permissions'

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
      type: 'remotes',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'remotes',
    },
  },
  {
    action: 'read',
    resource: {
      orgID: 'bulldogs',
      type: 'replications',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: 'bulldogs',
      type: 'replications',
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
  const allPermissions = new Set<PermissionTypes>()

  if (CLOUD) {
    cloudHvhs.forEach(permission => {
      allPermissions.add(permission.resource.type as PermissionTypes)
    })
    const sortedPermissions = Array.from(allPermissions).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    )
    expect(
      allAccessPermissions(sortedPermissions, 'bulldogs', 'mario')
    ).toMatchObject(
      cloudHvhs.sort((a, b) =>
        a.resource.type
          .toLowerCase()
          .localeCompare(b.resource.type.toLowerCase())
      )
    )
  } else {
    ossHvhs.forEach(permission => {
      allPermissions.add(permission.resource.type as PermissionTypes)
    })
    const sortedPermissions = Array.from(allPermissions).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    )
    expect(
      allAccessPermissions(sortedPermissions, 'bulldogs', 'mario')
    ).toMatchObject(
      ossHvhs.sort((a, b) =>
        a.resource.type
          .toLowerCase()
          .localeCompare(b.resource.type.toLowerCase())
      )
    )
  }
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

const orgID = 'ba9198e037d35d4d'
const orgName = 'dev'
const monitoringID = '25a6692ba25d7147'

const allAccessAccordionPerms = {
  annotations: {
    read: true,
    write: false,
  },
  authorizations: {
    read: false,
    write: true,
  },
}

const allAccessApiPerm = [
  {
    action: 'read',
    resource: {
      orgID: orgID,
      type: 'annotations',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: orgID,
      type: 'authorizations',
    },
  },
]

const nonAllAcessAccordionPerms = {
  buckets: {
    read: false,
    write: false,
    sublevelPermissions: {
      '25a6692ba25d7147': {
        id: '25a6692ba25d7147',
        name: '_monitoring',
        orgID: 'ba9198e037d35d4d',
        permissions: {read: true, write: true},
      },
      '28eccf12e3e4ff8e': {
        id: '28eccf12e3e4ff8e',
        name: 'frontendservices',
        orgID: 'ba9198e037d35d4d',
        permissions: {read: false, write: false},
      },
      '32b8e84498b27938': {
        id: '32b8e84498b27938',
        name: 'devbucket',
        orgID: 'ba9198e037d35d4d',
        permissions: {read: false, write: false},
      },
    },
  },
}

const nonAllAcessAccordionPerms2 = {
  buckets: {
    read: false,
    write: false,
    sublevelPermissions: {
      '25a6692ba25d7147': {
        id: '25a6692ba25d7147',
        name: '_monitoring',
        orgID: 'ba9198e037d35d4d',
        permissions: {read: true, write: true},
      },
    },
  },
}

const nonAllAcessApiPerms = [
  {
    action: 'read',
    resource: {
      orgID: orgID,
      type: 'buckets',
      id: monitoringID,
      name: '_monitoring',
    },
  },
  {
    action: 'write',
    resource: {
      orgID: orgID,
      type: 'buckets',
      id: monitoringID,
      name: '_monitoring',
    },
  },
]

const orgsAccordionPerm = {
  orgs: {
    read: true,
    write: true,
  },
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
  },
]

describe('Testing formatApiPermissions function', () => {
  test('does it convert all access permission object into api permission', () => {
    expect(
      formatApiPermissions(allAccessAccordionPerms, orgID, orgName)
    ).toMatchObject(allAccessApiPerm)
  })
  test('does it convert non-all access permission object into api permission', () => {
    expect(
      formatApiPermissions(nonAllAcessAccordionPerms, orgID, orgName)
    ).toMatchObject(nonAllAcessApiPerms)
  })
  test('does it convert orgs permission object into api permission', () => {
    expect(
      formatApiPermissions(orgsAccordionPerm, orgID, orgName)
    ).toMatchObject(orgsApiPerm)
  })
})
describe('Testing formatPermissionsObj function', () => {
  test('for api permissions with IDs, it creates perms with sublevel permissions', () => {
    expect(formatPermissionsObj(nonAllAcessApiPerms)).toMatchObject(
      nonAllAcessAccordionPerms2
    )
  })
  test('for all access permissions, it creates an all access accordion api permission', () => {
    expect(formatPermissionsObj(orgsApiPerm)).toMatchObject(orgsAccordionPerm)
  })
})
