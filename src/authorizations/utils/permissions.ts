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
  'scrapers',
  'sources',
  'tasks',
  'telegrafs',
  'users',
  'variables',
  'views',
]

const cloudPermissionTypes: PermissionTypes[] = [
  'annotations',
  'flows',
  'functions',
]

const ossPermissionTypes: PermissionTypes[] = []

// TODO: replace this with some server side mechanism
const allPermissionTypes: PermissionTypes[] = sharedPermissionTypes.concat(
  CLOUD ? cloudPermissionTypes : ossPermissionTypes
) as const

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

  if (allPermissionTypes.indexOf(t) === -1) {
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
