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
    let accordionPermission

    if (acc.hasOwnProperty(type)) {
      accordionPermission = {...acc[type]}
      if (id && (type === 'buckets' || type === 'telegrafs')) {
        if (accordionPermission.sublevelPermissions.hasOwnProperty(id)) {
          accordionPermission.sublevelPermissions[id].permissions[action] = true
        } else {
          accordionPermission.sublevelPermissions[id] = {
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
        accordionPermission[action] = true
      }
    } else {
      if (id && (type === 'buckets' || type === 'telegrafs')) {
        accordionPermission = {
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
        accordionPermission = {
          read: action === 'read',
          write: action === 'write',
        }
      }
    }

    return {...acc, [type]: accordionPermission}
  }, {})

  Object.keys(newPerms).forEach(resource => {
    const accordionPermission = {...newPerms[resource]}
    if (accordionPermission.sublevelPermissions) {
      accordionPermission.read = !Object.keys(
        accordionPermission.sublevelPermissions
      ).some(
        key =>
          accordionPermission.sublevelPermissions[key].permissions.read ===
          false
      )

      accordionPermission.write = !Object.keys(
        accordionPermission.sublevelPermissions
      ).some(
        key =>
          accordionPermission.sublevelPermissions[key].permissions.write ===
          false
      )

      newPerms[resource] = accordionPermission
    }
  })
  return newPerms
}

export const formatApiPermissions = (permissions, orgID) => {
  const apiPerms = []
  Object.keys(permissions).forEach((key) => {
    if(permissions[key].read) {
        apiPerms.push({
          action: 'read',
          resource: {
            orgID: orgID,
            type: key
          }
        })
      
    }
    if(permissions[key].write) {
      apiPerms.push({
        action: 'write',
        resource: {
          orgID: orgID,
          type: key
        }
      })
    }
    if (permissions[key].sublevelPermissions) {
      Object.keys(permissions[key].sublevelPermissions).forEach(id => {
        if (
          permissions[key].sublevelPermissions[id].permissions.read &&
          !permissions[key].read
        ) {
          apiPerms.push({
            action: 'read',
            resource: {
              orgID: permissions[key].sublevelPermissions[id].orgID,
              type: key,
              id: id, 
              name: permissions[key].sublevelPermissions[id].name
            }
          })
        }
        if (permissions[key].sublevelPermissions[id].permissions.write 
          && !permissions[key].write) {
          apiPerms.push({
            action: 'write',
            resource: {
              orgID: permissions[key].sublevelPermissions[id].orgID,
              type: key,
              id: id, 
              name: permissions[key].sublevelPermissions[id].name
            }
          })
        }
      })
    }
  })
  return apiPerms


}
