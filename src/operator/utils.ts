import {
  hoursToNs,
  nsToHours,
  nsToSeconds,
  secondsToNs,
} from 'src/billing/utils/timeHelpers'

// Types
import {OperatorOrgLimits, OperatorRegions} from 'src/types'
import {IdentityUser} from 'src/client/unityRoutes'

type OperatorRole = IdentityUser['operatorRole'] | null

export const isUserOperator = (operatorRole: OperatorRole): boolean =>
  operatorRole === 'read-only' || operatorRole === 'read-write'

const updateMaxRetentionWithCallback = (
  limits: OperatorOrgLimits,
  cb: typeof nsToHours | typeof hoursToNs
): OperatorOrgLimits => ({
  ...limits,
  bucket: {
    ...limits?.bucket,
    maxRetentionDuration: cb(limits?.bucket?.maxRetentionDuration),
  },
})

const updateQueryTimeWithCallback = (
  limits: OperatorOrgLimits,
  cb: typeof nsToSeconds | typeof secondsToNs
): OperatorOrgLimits => ({
  ...limits,
  rate: {
    ...limits?.rate,
    queryTime: cb(limits?.rate?.queryTime),
  },
})

export const toDisplayLimits = (
  limits: OperatorOrgLimits
): OperatorOrgLimits => {
  const newLimits = updateMaxRetentionWithCallback(limits, nsToHours)
  return updateQueryTimeWithCallback(newLimits, nsToSeconds)
}

export const fromDisplayLimits = (
  displayLimits: OperatorOrgLimits
): OperatorOrgLimits => {
  const newLimits = updateMaxRetentionWithCallback(displayLimits, hoursToNs)
  return updateQueryTimeWithCallback(newLimits, secondsToNs)
}

export const getRegions = (
  provider: string,
  regions: {
    Azure?: OperatorRegions
    AWS?: OperatorRegions
    GCP?: OperatorRegions
  }
) => {
  switch (provider) {
    case 'Azure':
      return regions.Azure
    case 'AWS':
      return regions.AWS
    case 'GCP':
      return regions.GCP
    default:
      return []
  }
}
