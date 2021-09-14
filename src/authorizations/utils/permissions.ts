import {Bucket, Permission} from 'src/types'
import {CLOUD} from 'src/shared/constants'

type PermissionTypes = Permission['resource']['type']

const sharedPermissionTypes: PermissionTypes[] = [
  'authorizations',
  'buckets',
  'checks',
  'dashboards',
  'dbrp',
  'documents',
  'labels',
  'notificationRules',
  'notificationEndpoints',
  'orgs',
  'secrets',
  'tasks',
  'telegrafs',
  'users',
  'variables',
  'views',
]

const cloudPermissionTypes = ['annotations', 'flows', 'functions']

const ossPermissionTypes = ['scrapers', 'sources']

// TODO: replace this with some server side mechanism
const allPermissionTypes: PermissionTypes[] = sharedPermissionTypes.concat(
  (CLOUD ? cloudPermissionTypes : ossPermissionTypes) as PermissionTypes[]
)

allPermissionTypes.sort((a, b) =>
  a.toLowerCase().localeCompare(b.toLowerCase())
)

const ensureT = (orgID: string, userID: string) => (
  t: PermissionTypes
): Permission[] => {
  if (t === 'orgs') {
    // 'orgs' used to only have read permissions so that's all we'll give again.
    // In production, orgs with an orgID returns a permissions error.
    return [
      {
        action: 'read' as 'read',
        resource: {type: t, id: orgID},
      },
    ]
  }

  if (t === 'users') {
    return [
      {
        action: 'read' as 'read',
        resource: {type: t, id: userID},
      },
      {
        action: 'write' as 'write',
        resource: {type: t, id: userID},
      },
    ]
  }

  if (!allPermissionTypes.includes(t)) {
    throw new Error('Unexpected object: ' + t)
  }

  return [
    {
      action: 'read' as 'read',
      resource: {type: t, orgID},
    },
    {
      action: 'write' as 'write',
      resource: {type: t, orgID},
    },
  ]
}

export const allAccessPermissions = (
  orgID: string,
  userID: string
): Permission[] => {
  const withOrgID = ensureT(orgID, userID)
  return allPermissionTypes.flatMap(withOrgID)
}

// add a permission string ('read' or 'write' is the second argument)
// to a list of buckets (the first argument)
export const specificBucketsPermissions = (
  buckets: Bucket[],
  permission: Permission['action']
): Permission[] => {
  return buckets.map(b => {
    return {
      action: permission,
      resource: {
        type: 'buckets' as 'buckets',
        orgID: b.orgID,
        id: b.id,
      },
    }
  })
}

// assign permission string ('read' or 'write' is the second argument)
// to all the buckets that have a particular orgID (the first argument)
export const allBucketsPermissions = (
  orgID: string,
  permission: Permission['action']
): Permission[] => {
  return [
    {
      action: permission,
      resource: {type: 'buckets', orgID},
    },
  ]
}

export const toggleSelectedBucket = (
  bucketName: string,
  selectedBuckets: string[]
): string[] => {
  const isSelected = selectedBuckets.find(n => n === bucketName)

  if (isSelected) {
    return selectedBuckets.filter(n => n !== bucketName)
  }

  return [...selectedBuckets, bucketName]
}

export enum BucketTab {
  AllBuckets = 'All Buckets',
  Scoped = 'Scoped',
}

export const formatPermissionsObj = permissions => {
  const newPerms = permissions.reduce((acc, {action, resource}) => {
    const {type, id, orgID, name} = resource
    let p

    if (acc.hasOwnProperty(type)) {
      p = {...acc[type]}
      if (id && (type === 'buckets' || type === 'telegrafs')) {
        if (p.sublevelPermissions.hasOwnProperty(id)) {
          p.sublevelPermissions[id].permissions[action] = true
        } else {
          p.sublevelPermissions[id] = {
            id: id,
            orgID: orgID,
            name: name,
            permissions: {
              read: action === 'read',
              write: action === 'write',
            },
          }
        }
      } else {
        p[action] = true
      }
    } else {
      if (id && (type === 'buckets' || type === 'telegrafs')) {
        p = {
          read: false,
          write: false,
          sublevelPermissions: {
            [id]: {
              id: id,
              orgID: orgID,
              name: name,
              permissions: {
                read: action === 'read',
                write: action === 'write',
              },
            },
          },
        }
      } else {
        p = {
          read: action === 'read',
          write: action === 'write',
        }
      }
    }

    return {...acc, [type]: p}
  }, {})

  Object.keys(newPerms).map(resource => {
    const p = {...newPerms[resource]}
    if (p.sublevelPermissions) {
      p.read = !Object.keys(p.sublevelPermissions).some(
        key => p.sublevelPermissions[key].permissions.read === false
      )

      p.write = !Object.keys(p.sublevelPermissions).some(
        key => p.sublevelPermissions[key].permissions.write === false
      )

      newPerms[resource] = p
    }
  })
  return newPerms
}
