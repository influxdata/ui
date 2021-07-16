import {LimitStatus, Limit as GeneratedLimit} from 'src/client/cloudPrivRoutes'
export {LimitStatus, LimitStatuses} from 'src/client/cloudPrivRoutes'

export interface Limits extends GeneratedLimit {}

export interface Limit {
  maxAllowed: number
  limitStatus: LimitStatus['status']
}
