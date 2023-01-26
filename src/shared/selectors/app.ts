import {
  AppState,
  TimeZone,
  Theme,
  NavBarState,
  VersionInfo,
  FlowsCTA,
  FluxFunction,
} from 'src/types'

import {CLOUD, IOX_SWITCHOVER_CREATION_DATE} from 'src/shared/constants'

import {selectOrgCreationDate, isOrgIOx} from 'src/organizations/selectors'

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

export const selectShouldShowResource = (state: AppState): boolean => {
  if (!CLOUD) {
    return true
  }

  const orgCreationDate = new Date(selectOrgCreationDate(state)).valueOf()
  const ioxCutoffDate = new Date(IOX_SWITCHOVER_CREATION_DATE).valueOf()
  const isIOxEnabled = isOrgIOx(state)

  const wasCreatedBeforeIOxCutoff = orgCreationDate < ioxCutoffDate

  // In cloud, don't show resource if org is IOx enabled && org is created after iox cutoff date
  if (!wasCreatedBeforeIOxCutoff && isIOxEnabled) {
    return false
  }

  return true
}
