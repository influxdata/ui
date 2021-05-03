// Libraries
import {produce} from 'immer'

// Constants
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'

// Types
import {Action} from 'src/shared/actions/autoRefresh'
import {AutoRefresh} from 'src/types'

export interface AutoRefreshState {
  [dashboardID: string]: AutoRefresh
}

export const initialState = (): AutoRefreshState => {
  return {}
}

export const autoRefreshReducer = (state = initialState(), action: Action) =>
  produce(state, draftState => {
    switch (action.type) {
      case 'SET_AUTO_REFRESH_INTERVAL': {
        const {dashboardID, milliseconds} = action.payload

        if (!draftState[dashboardID]) {
          draftState[dashboardID] = AUTOREFRESH_DEFAULT
        }

        draftState[dashboardID].interval = milliseconds

        return
      }

      case 'SET_AUTO_REFRESH_STATUS': {
        const {dashboardID, status} = action.payload

        if (!draftState[dashboardID]) {
          draftState[dashboardID] = AUTOREFRESH_DEFAULT
        }

        draftState[dashboardID].status = status

        return
      }

      case 'SET_AUTO_REFRESH_DURATION': {
        const {duration, dashboardID} = action

        if (!draftState[dashboardID]) {
          draftState[dashboardID] = AUTOREFRESH_DEFAULT
        }

        draftState[dashboardID].duration = duration
        return
      }

      case 'SET_INACTIVITY_TIMEOUT': {
        const {dashboardID, inactivityTimeout} = action

        if (!draftState[dashboardID]) {
          draftState[dashboardID] = AUTOREFRESH_DEFAULT
        }

        draftState[dashboardID].inactivityTimeout = inactivityTimeout
        return
      }
      case 'RESET_DASHBOARD_AUTO_REFRESH': {
        const {dashboardID} = action
        draftState[dashboardID] = AUTOREFRESH_DEFAULT
        return
      }
    }
  })
