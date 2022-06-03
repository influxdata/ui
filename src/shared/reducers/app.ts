import {combineReducers} from 'redux'

// Types
import {ActionTypes, Action} from 'src/shared/actions/app'
import {AUTOREFRESH_DEFAULT_INTERVAL} from 'src/shared/constants'
import {TimeZone, NavBarState, Theme, VersionInfo, FlowsCTA} from 'src/types'

export interface AppState {
  ephemeral: {
    inPresentationMode: boolean
    hasUpdatedTimeRangeInVEO: boolean
  }
  persisted: {
    autoRefresh: number
    showTemplateControlBar: boolean
    timeZone: TimeZone
    navBarState: NavBarState
    newDataExplorer: boolean
    theme: Theme
    versionInfo: VersionInfo
    flowsCTA: FlowsCTA
  }
}

const initialState: AppState = {
  ephemeral: {
    inPresentationMode: false,
    hasUpdatedTimeRangeInVEO: false,
  },
  persisted: {
    theme: 'dark',
    autoRefresh: AUTOREFRESH_DEFAULT_INTERVAL,
    showTemplateControlBar: false,
    timeZone: 'Local',
    navBarState: 'collapsed',
    newDataExplorer: false,
    versionInfo: {version: '', commit: ''},
    flowsCTA: {explorer: true, tasks: true, alerts: true},
  },
}

const {
  ephemeral: initialAppEphemeralState,
  persisted: initialAppPersistedState,
} = initialState

const appEphemeralReducer = (
  state = initialAppEphemeralState,
  action: Action
): AppState['ephemeral'] => {
  switch (action.type) {
    case ActionTypes.EnablePresentationMode: {
      return {
        ...state,
        inPresentationMode: true,
      }
    }

    case ActionTypes.DisablePresentationMode: {
      return {
        ...state,
        inPresentationMode: false,
      }
    }

    case ActionTypes.EnableUpdatedTimeRangeInVEO: {
      return {
        ...state,
        hasUpdatedTimeRangeInVEO: true,
      }
    }

    case ActionTypes.DisableUpdatedTimeRangeInVEO: {
      return {
        ...state,
        hasUpdatedTimeRangeInVEO: false,
      }
    }

    default:
      return state
  }
}

const appPersistedReducer = (
  state = initialAppPersistedState,
  action: Action
): AppState['persisted'] => {
  switch (action.type) {
    case 'SET_THEME': {
      return {...state, theme: action.theme}
    }

    case ActionTypes.SetAutoRefresh: {
      return {
        ...state,
        autoRefresh: action.payload.milliseconds,
      }
    }

    case ActionTypes.SetVersionInfo: {
      return {
        ...state,
        versionInfo: action.payload.versionInfo,
      }
    }

    case ActionTypes.SetTimeZone: {
      const {timeZone} = action.payload

      return {...state, timeZone}
    }

    case ActionTypes.SetFluxQueryBuilder: {
      return {...state, newDataExplorer: action.active}
    }

    case ActionTypes.SetNavBarState: {
      const navBarState = action.navBarState
      return {
        ...state,
        navBarState,
      }
    }

    case ActionTypes.SetFlowsCTA: {
      return {
        ...state,
        flowsCTA: {
          ...state.flowsCTA,
          ...action.payload.flowsCTA,
        },
      }
    }

    default:
      return state
  }
}

const appReducer = combineReducers<AppState>({
  ephemeral: appEphemeralReducer,
  persisted: appPersistedReducer,
})

export default appReducer
