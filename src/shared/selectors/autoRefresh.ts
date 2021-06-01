import {AppState} from 'src/types'

export const getAutoRefreshForDashboard = (state: AppState) => {
  return state.autoRefresh[state.currentDashboard.id]
}
