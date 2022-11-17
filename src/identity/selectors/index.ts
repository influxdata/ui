// Types
import {AppState} from 'src/types'
import {RemoteDataState} from '@influxdata/clockface'

export const selectQuartzIdentity = (state: AppState): AppState['identity'] => {
  return state.identity
}

export const selectCurrentIdentity = (
  state: AppState
): AppState['identity']['currentIdentity'] => {
  return state.identity.currentIdentity
}

export const selectCurrentAccountId = (
  state: AppState
): AppState['identity']['currentIdentity']['account']['id'] => {
  return state.identity.currentIdentity.account.id
}

export const selectCurrentAccountType = (
  state: AppState
): AppState['identity']['currentIdentity']['account']['type'] => {
  return state.identity.currentIdentity.account.type
}

export const selectCurrentOrgId = (
  state: AppState
): AppState['identity']['currentIdentity']['org']['id'] => {
  return state.identity.currentIdentity.org.id
}

export const selectOperatorRole = (
  state: AppState
): AppState['identity']['currentIdentity']['user']['operatorRole'] => {
  return state.identity.currentIdentity.user.operatorRole
}

export const selectQuartzIdentityStatus = (state: AppState): RemoteDataState =>
  state.identity.currentIdentity.loadingStatus.identityStatus

export const selectQuartzBillingStatus = (state: AppState): RemoteDataState =>
  state.identity.currentIdentity.loadingStatus.billingStatus

export const selectQuartzOrgDetailsStatus = (
  state: AppState
): RemoteDataState =>
  state.identity.currentIdentity.loadingStatus.orgDetailsStatus

export const selectQuartzOrgs = (
  state: AppState
): AppState['identity']['quartzOrganizations'] => {
  return state.identity.quartzOrganizations
}

export const selectQuartzOrgsContents = (
  state: AppState
): AppState['identity']['quartzOrganizations']['orgs'] => {
  return state.identity.quartzOrganizations.orgs
}

export const selectQuartzOrgsStatus = (
  state: AppState
): AppState['identity']['quartzOrganizations']['status'] => {
  return state.identity.quartzOrganizations.status
}

export const selectOrgCreationAllowances = (
  state: AppState
): AppState['identity']['allowances']['orgCreation'] => {
  return state.identity.allowances.orgCreation
}

export const selectOrgCreationAllowancesStatus = (
  state: AppState
): RemoteDataState => state.identity.allowances.orgCreation.loadingStatus
