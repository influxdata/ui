import {
  createStore,
  applyMiddleware,
  compose,
  combineReducers,
  Store,
} from 'redux'
import {History} from 'history'
import {connectRouter, routerMiddleware} from 'connected-react-router'
import thunkMiddleware from 'redux-thunk'

import {resizeLayout} from 'src/shared/middleware/resizeLayout'
import {queryStringConfig} from 'src/shared/middleware/queryStringConfig'
import sharedReducers from 'src/shared/reducers'
import persistStateEnhancer from './persistStateEnhancer'

import {loadLocalStorage} from 'src/localStorage'

// v2 reducers
import meReducer from 'src/me/reducers'
import flagReducer from 'src/shared/reducers/flags'
import currentDashboardReducer from 'src/shared/reducers/currentDashboard'
import currentExplorerReducer from 'src/shared/reducers/currentExplorer'
import currentPageReducer from 'src/shared/reducers/currentPage'
import tasksReducer from 'src/tasks/reducers'
import rangesReducer from 'src/dashboards/reducers/ranges'
import {dashboardsReducer} from 'src/dashboards/reducers/dashboards'
import {cellsReducer} from 'src/cells/reducers'
import viewsReducer from 'src/views/reducers'
import {timeMachinesReducer} from 'src/timeMachine/reducers'
import {orgsReducer} from 'src/organizations/reducers'
import overlaysReducer from 'src/overlays/reducers/overlays'
import onboardingReducer from 'src/onboarding/reducers'
import noteEditorReducer from 'src/dashboards/reducers/notes'
import dataLoadingReducer from 'src/dataLoaders/reducers'
import {variablesReducer, variableEditorReducer} from 'src/variables/reducers'
import {labelsReducer} from 'src/labels/reducers'
import {bucketsReducer} from 'src/buckets/reducers'
import {telegrafsReducer} from 'src/telegrafs/reducers'
import {authsReducer} from 'src/authorizations/reducers'
import templatesReducer from 'src/templates/reducers'
import {scrapersReducer} from 'src/scrapers/reducers'
import {userSettingsReducer} from 'src/userSettings/reducers'
import {annotationsReducer} from 'src/annotations/reducers'
import {membersReducer} from 'src/members/reducers'
import {autoRefreshReducer} from 'src/shared/reducers/autoRefresh'
import {limitsReducer, LimitsState} from 'src/cloud/reducers/limits'
import {demoDataReducer, DemoDataState} from 'src/cloud/reducers/demodata'
import {
  orgSettingsReducer,
  OrgSettingsState,
} from 'src/cloud/reducers/orgsettings'
import checksReducer from 'src/checks/reducers'
import rulesReducer from 'src/notifications/rules/reducers'
import endpointsReducer from 'src/notifications/endpoints/reducers'
import {
  pluginsReducer,
  activePluginsReducer,
  editorReducer,
  pluginsResourceReducer,
} from 'src/dataLoaders/reducers/telegrafEditor'
import {predicatesReducer} from 'src/shared/reducers/predicates'
import alertBuilderReducer from 'src/alerting/reducers/alertBuilder'
import perfReducer from 'src/perf/reducers'
import {schemaReducer} from 'src/shared/reducers/schema'

// Types
import {AppState, LocalStorage} from 'src/types'

type ReducerState = Pick<AppState, Exclude<keyof AppState, 'timeRange'>>

import {history} from 'src/store/history'

export const rootReducer = (history: History) => (state, action) => {
  if (action.type === 'USER_LOGGED_OUT') {
    state = undefined
  }

  return combineReducers<ReducerState>({
    router: connectRouter(history),
    ...sharedReducers,
    autoRefresh: autoRefreshReducer,
    alertBuilder: alertBuilderReducer,
    cloud: combineReducers<{
      limits: LimitsState
      demoData: DemoDataState
      orgSettings: OrgSettingsState
    }>({
      limits: limitsReducer,
      demoData: demoDataReducer,
      orgSettings: orgSettingsReducer,
    }),
    currentPage: currentPageReducer,
    currentDashboard: currentDashboardReducer,
    currentExplorer: currentExplorerReducer,
    dataLoading: dataLoadingReducer,
    me: meReducer,
    flags: flagReducer,
    flow: schemaReducer,
    noteEditor: noteEditorReducer,
    onboarding: onboardingReducer,
    overlays: overlaysReducer,
    perf: perfReducer,
    plugins: pluginsResourceReducer,
    predicates: predicatesReducer,
    ranges: rangesReducer,
    resources: combineReducers({
      buckets: bucketsReducer,
      cells: cellsReducer,
      checks: checksReducer,
      dashboards: dashboardsReducer,
      endpoints: endpointsReducer,
      labels: labelsReducer,
      members: membersReducer,
      orgs: orgsReducer,
      rules: rulesReducer,
      scrapers: scrapersReducer,
      tasks: tasksReducer,
      telegrafs: telegrafsReducer,
      templates: templatesReducer,
      tokens: authsReducer,
      variables: variablesReducer,
      views: viewsReducer,
    }),
    telegrafEditor: editorReducer,
    telegrafEditorActivePlugins: activePluginsReducer,
    telegrafEditorPlugins: pluginsReducer,
    timeMachines: timeMachinesReducer,
    userSettings: userSettingsReducer,
    variableEditor: variableEditorReducer,
    VERSION: () => '',
    annotations: annotationsReducer,
  })(state, action)
}

const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

function configureStore(
  initialState: LocalStorage = loadLocalStorage()
): Store<AppState & LocalStorage> {
  const routingMiddleware = routerMiddleware(history)
  const createPersistentStore = composeEnhancers(
    persistStateEnhancer(),
    applyMiddleware(
      thunkMiddleware,
      routingMiddleware,
      resizeLayout,
      queryStringConfig
    )
  )(createStore)

  // https://github.com/elgerlambert/redux-localstorage/issues/42
  // createPersistentStore should ONLY take reducer and initialState
  // any store enhancers must be added to the compose() function.
  return createPersistentStore(rootReducer(history), initialState)
}

let storeSingleton
export const getStore = () => {
  if (!storeSingleton) {
    storeSingleton = configureStore()
  }

  return storeSingleton
}

export const configureStoreForTests = (initialState: LocalStorage) => {
  return configureStore(initialState)
}
