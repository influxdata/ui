import {
  AppState,
  TimeZone,
  Theme,
  NavBarState,
  VersionInfo,
  FlowsCTA,
  FluxFunction,
} from 'src/types'

export const timeZone = (state: AppState): TimeZone =>
  state.app.persisted.timeZone || ('Local' as TimeZone)

export const theme = (state: AppState): Theme =>
  state.app.persisted.theme || ('dark' as Theme)

export const navbarMode = (state: AppState): NavBarState =>
  state.app.persisted.navBarState || ('collapsed' as NavBarState)

export const scriptQueryBuilder = (state: AppState): boolean =>
  state.app.persisted.scriptQueryBuilder || false

export const getVersionInfo = (state: AppState): VersionInfo =>
  state.app.persisted.versionInfo || ({} as VersionInfo)

export const getPresentationMode = (state: AppState): boolean =>
  state.app.ephemeral.inPresentationMode || false

export const getFlowsCTA = (state: AppState): FlowsCTA =>
  state.app.persisted.flowsCTA ||
  ({explorer: true, tasks: true, alerts: true} as FlowsCTA)

export const getAllFluxFunctions = (state: AppState): FluxFunction[] =>
  state.fluxDocs.fluxDocs

export const getSubscriptionsCertificateInterest = (state: AppState): boolean =>
  state.app.persisted.subscriptionsCertificateInterest || false
