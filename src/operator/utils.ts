import {hoursToNs, nsToHours} from 'src/billing/utils/timeHelpers'

// Types
import {OrgLimits} from 'src/types/operator'

const updateMaxRetentionWithCallback = (
  limits: OrgLimits,
  cb: typeof nsToHours | typeof hoursToNs
) => ({
  ...limits,
  bucket: {
    ...limits?.bucket,
    maxRetentionDuration: cb(limits?.bucket?.maxRetentionDuration),
  },
})

export const toDisplayLimits = (limits: OrgLimits) =>
  updateMaxRetentionWithCallback(limits, nsToHours)

export const fromDisplayLimits = (displayLimits: OrgLimits) =>
  updateMaxRetentionWithCallback(displayLimits, hoursToNs)
