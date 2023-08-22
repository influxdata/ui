import {combineReducers} from 'redux'

// Types
import {ActionTypes, Action} from 'src/shared/actions/app'
import {AUTOREFRESH_DEFAULT_INTERVAL} from 'src/shared/constants'
import {TimeZone, NavBarState, Theme, VersionInfo, FlowsCTA} from 'src/types'

export interface AppState {
  ephemeral: {
    inPresentationMode: boolean
  }
  persisted: {
    autoRefresh: number
    showTemplateControlBar: boolean
    timeZone: TimeZone
    navBarState: NavBarState
    scriptQueryBuilder: boolean
    theme: Theme
    versionInfo: VersionInfo
    flowsCTA: FlowsCTA
    subscriptionsCertificateInterest: boolean
    workerRegistration: Promise<ServiceWorkerRegistration>
    workerRegistrationInfluxQL: Promise<ServiceWorkerRegistration>
    workerRegisterationSQL: Promise<ServiceWorkerRegistration>
  }
}

const initialState: AppState = {
  ephemeral: {
    inPresentationMode: false,
  },
  persisted: {
    theme: 'dark',
    autoRefresh: AUTOREFRESH_DEFAULT_INTERVAL,
    showTemplateControlBar: false,
    timeZone: 'Local',
    navBarState: 'collapsed',
    scriptQueryBuilder: true,
    versionInfo: {version: '', commit: ''},
    flowsCTA: {explorer: true, tasks: true, alerts: true},
    subscriptionsCertificateInterest: false,
    workerRegistration: null,
    workerRegistrationInfluxQL: null,
    workerRegisterationSQL: null,
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

    case ActionTypes.SetScriptQueryBuilder: {
      return {...state, scriptQueryBuilder: action.active}
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

    case ActionTypes.SetSubscriptionsCertificateInterest: {
      return {
        ...state,
        subscriptionsCertificateInterest: true,
      }
    }

    case ActionTypes.SetWorkerRegistration: {
      return {
        ...state,
        workerRegistration: action.payload.workerRegistration,
      }
    }

    case ActionTypes.SetWorkerRegistrationInfluxQL: {
      return {
        ...state,
        workerRegistrationInfluxQL: action.payload.workerRegistrationInfluxQL,
      }
    }

    case ActionTypes.SetWorkerRegistrationSQL: {
      return {
        ...state,
        workerRegisterationSQL: action.payload.workerRegistrationSQL,
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
