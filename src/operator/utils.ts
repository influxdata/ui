// import {OrgLimit} from 'src/types/billing'
import {hoursToNs, nsToHours} from 'src/billing/utils/timeHelpers'
import {update} from 'lodash/fp'

export const toDisplayLimits = (limits: any) =>
  update('bucket.maxRetentionDuration', nsToHours, limits)

export const fromDisplayLimits = (displayLimits: any) =>
  update('bucket.maxRetentionDuration', hoursToNs, displayLimits)
