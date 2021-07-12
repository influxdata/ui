import {hoursToNs, nsToHours} from 'src/billing/utils/timeHelpers'

// Types
import {OrgLimits} from 'src/types'

const updateMaxRetentionWithCallback = (
  limits: OrgLimits,
  cb: typeof nsToHours | typeof hoursToNs
): OrgLimits => ({
  ...limits,
  bucket: {
    ...limits?.bucket,
    maxRetentionDuration: cb(limits?.bucket?.maxRetentionDuration),
  },
})

export const toDisplayLimits = (limits: OrgLimits): OrgLimits =>
  updateMaxRetentionWithCallback(limits, nsToHours)

export const fromDisplayLimits = (displayLimits: OrgLimits): OrgLimits =>
  updateMaxRetentionWithCallback(displayLimits, hoursToNs)
