import {Permission, ResourceType} from 'src/types'
import {CLOUD} from 'src/shared/constants'
import {capitalize} from 'lodash'

type PermissionTypes = Permission['resource']['type']

const sharedPermissionTypes: PermissionTypes[] = [
  'annotations',
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

const cloudPermissionTypes = ['flows', 'functions']

const ossPermissionTypes = [
  'notebooks',
  'scrapers',
  'sources',
  'remotes',
  'replications',
]

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

export const formatResources = resourceNames => {
  const resources = resourceNames.filter(
    item => item !== ResourceType.Buckets && item !== ResourceType.Telegrafs
  )
  resources.sort()
  resources.unshift(ResourceType.Telegrafs)
  resources.unshift(ResourceType.Buckets)
  const indexToSplit = resources.indexOf(ResourceType.Telegrafs)
  const first = resources.slice(0, indexToSplit + 1)
  const second = resources.slice(indexToSplit + 1)
  return [first, second]
}

export const formatPermissionsObj = permissions => {
  const newPerms = permissions.reduce((acc, {action, resource}) => {
    const {type, id, orgID, name} = resource
    let accordionPermission

    if (acc.hasOwnProperty(type)) {
      accordionPermission = {...acc[type]}
      if (
        id &&
        (type === ResourceType.Buckets || type === ResourceType.Telegrafs)
      ) {
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
      if (
        id &&
        (type === ResourceType.Buckets || type === ResourceType.Telegrafs)
      ) {
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
      accordionPermission.read = Object.keys(
        accordionPermission.sublevelPermissions
      ).every(
        key =>
          accordionPermission.sublevelPermissions[key].permissions.read === true
      )

      accordionPermission.write = Object.keys(
        accordionPermission.sublevelPermissions
      ).every(
        key =>
          accordionPermission.sublevelPermissions[key].permissions.write ===
          true
      )

      newPerms[resource] = accordionPermission
    }
  })
  return newPerms
}

export const formatApiPermissions = (permissions, orgID, orgName) => {
  const apiPerms = []
  Object.keys(permissions).forEach(key => {
    if (key === 'otherResources') {
      return
    }
    if (permissions[key].read) {
      if (key === 'orgs') {
        apiPerms.push({
          action: 'read',
          resource: {
            id: orgID,
            name: orgName,
            type: key,
          },
        })
      } else {
        apiPerms.push({
          action: 'read',
          resource: {
            orgID: orgID,
            type: key,
          },
        })
      }
    }
    if (permissions[key].write) {
      if (key === 'orgs') {
        apiPerms.push({
          action: 'write',
          resource: {
            id: orgID,
            name: orgName,
            type: key,
          },
        })
      } else {
        apiPerms.push({
          action: 'write',
          resource: {
            orgID: orgID,
            type: key,
          },
        })
      }
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
              name: permissions[key].sublevelPermissions[id].name,
            },
          })
        }
        if (
          permissions[key].sublevelPermissions[id].permissions.write &&
          !permissions[key].write
        ) {
          apiPerms.push({
            action: 'write',
            resource: {
              orgID: permissions[key].sublevelPermissions[id].orgID,
              type: key,
              id: id,
              name: permissions[key].sublevelPermissions[id].name,
            },
          })
        }
      })
    }
  })
  return apiPerms
}

export const generateDescription = apiPermissions => {
  let generatedDescription = ''

  if (apiPermissions.length > 2) {
    const actions = []
    apiPermissions.forEach(perm => {
      actions.push(perm.action)
    })
    const isRead = actions.some(action => action === 'read')
    const isWrite = actions.some(action => action === 'write')

    if (isRead && isWrite) {
      generatedDescription += `Read Multiple Write Multiple`
    } else if (isRead) {
      generatedDescription += `Read Multiple`
    } else if (isWrite) {
      generatedDescription += `Write Multiple`
    }
  } else {
    apiPermissions.forEach(perm => {
      if (perm.resource.type === 'orgs') {
        generatedDescription += `${capitalize(perm.action)} ${
          perm.resource.type
        }  `
      } else {
        if (perm.resource.name) {
          generatedDescription += `${capitalize(perm.action)} ${
            perm.resource.type
          } ${perm.resource.name} `
        } else {
          generatedDescription += `${capitalize(perm.action)} ${
            perm.resource.type
          } `
        }
      }
    })
  }

  return generatedDescription.trim()
}
