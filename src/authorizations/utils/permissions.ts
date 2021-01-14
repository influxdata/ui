import {Bucket, Permission} from 'src/types'

type PermissionTypes = Permission['resource']['type']

function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x)
}

const allPermissionTypes: PermissionTypes[] = [
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
  'scrapers',
  'sources',
  'tasks',
  'telegrafs',
  'users',
  'variables',
  'views',
]

// The switch statement below will cause a TS error
// if all allowable PermissionTypes generated in the client
// generatedRoutes are not included in the switch statement BUT
// they will need to be added to both the switch statement AND the allPermissionTypes array.
const ensureT = (orgID: string, userID: string) => (
  t: PermissionTypes
): Permission[] => {
  switch (t) {
    case 'authorizations':
    case 'buckets':
    case 'checks':
    case 'dashboards':
    case 'dbrp':
    case 'documents':
    case 'labels':
    case 'notificationRules':
    case 'notificationEndpoints':
    case 'secrets':
    case 'scrapers':
    case 'sources':
    case 'tasks':
    case 'telegrafs':
    case 'variables':
    case 'views':
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
    case 'orgs':
      // 'orgs' used to only have read permissions so that's all we'll give again.
      // In production, orgs with an orgID returns a permissions error.
      return [
        {
          action: 'read' as 'read',
          resource: {type: t, id: orgID},
        },
      ]
    case 'users':
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
    default:
      return assertNever(t)
  }
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
