// Libraries
import {produce} from 'immer'

// Constants
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'

// Types
import {Action} from 'src/shared/actions/autoRefresh'
import {AutoRefresh} from 'src/types'

export interface AutoRefreshState {
  [id: string]: AutoRefresh
}

export const initialState = (): AutoRefreshState => {
  return {}
}

export const autoRefreshReducer = (state = initialState(), action: Action) =>
  produce(state, draftState => {
    switch (action.type) {
      case 'SET_AUTO_REFRESH_INTERVAL': {
        const {id, milliseconds, label} = action.payload

        if (!draftState[id]) {
          draftState[id] = AUTOREFRESH_DEFAULT
        }

        draftState[id].interval = milliseconds
        draftState[id].label = label

        return
      }

      case 'SET_AUTO_REFRESH_STATUS': {
        const {id, status} = action.payload

        if (!draftState[id]) {
          draftState[id] = {...AUTOREFRESH_DEFAULT, status}
        } else {
          draftState[id].status = status
        }

        return
      }

      case 'SET_AUTO_REFRESH_DURATION': {
        const {duration, id} = action

        if (!draftState[id]) {
          draftState[id] = AUTOREFRESH_DEFAULT
        }

        draftState[id].duration = duration
        return
      }

      case 'SET_INACTIVITY_TIMEOUT': {
        const {id, inactivityTimeout} = action

        if (!draftState[id]) {
          draftState[id] = AUTOREFRESH_DEFAULT
        }

        draftState[id].inactivityTimeout = inactivityTimeout
        return
      }

      case 'RESET_AUTO_REFRESH': {
        const {id} = action
        draftState[id] = AUTOREFRESH_DEFAULT
        return
      }
    }
  })
