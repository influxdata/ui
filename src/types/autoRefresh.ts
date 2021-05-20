import {CustomTimeRange} from 'src/types'

export enum AutoRefreshStatus {
  Active = 'active',
  Disabled = 'disabled',
  Paused = 'paused',
}

export interface AutoRefresh {
  status: AutoRefreshStatus
  interval: number
  duration?: CustomTimeRange | null
  inactivityTimeout?: number | null
  infiniteDuration: boolean
  refreshInputValue?: string
}
