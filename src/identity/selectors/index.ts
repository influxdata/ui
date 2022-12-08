// Types
import {AppState} from 'src/types'
import {RemoteDataState} from '@influxdata/clockface'

export const selectCurrentAccount = (
  state: AppState
): AppState['identity']['currentIdentity']['account'] => {
  return state.identity.currentIdentity.account
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

export const selectCurrentIdentity = (
  state: AppState
): AppState['identity']['currentIdentity'] => {
  return state.identity.currentIdentity
}

export const selectCurrentOrg = (
  state: AppState
): AppState['identity']['currentIdentity']['org'] => {
  return state.identity.currentIdentity.org
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

export const selectOrgCreationAllowance = (
  state: AppState
): AppState['identity']['allowances']['orgCreation']['allowed'] => {
  return state.identity.allowances.orgCreation.allowed
}

export const selectOrgCreationAllowanceStatus = (
  state: AppState
): RemoteDataState => state.identity.allowances.orgCreation.loadingStatus

export const selectOrgCreationAvailableUpgrade = (
  state: AppState
): AppState['identity']['allowances']['orgCreation']['availableUpgrade'] => {
  return state.identity.allowances.orgCreation.availableUpgrade
}

export const selectQuartzActiveOrgs = (
  state: AppState
): AppState['identity']['quartzOrganizations']['orgs'] => {
  return state.identity.quartzOrganizations.orgs.filter(
    org => !org.provisioningStatus || org.provisioningStatus === 'provisioned'
  )
}

export const selectQuartzIdentity = (state: AppState): AppState['identity'] => {
  return state.identity
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
): AppState['identity']['quartzOrganizations']['orgs'] => {
  return state.identity.quartzOrganizations.orgs
}

export const selectQuartzOrgsStatus = (
  state: AppState
): AppState['identity']['quartzOrganizations']['status'] => {
  return state.identity.quartzOrganizations.status
}

export const selectUser = (
  state: AppState
): AppState['identity']['currentIdentity']['user'] => {
  return state.identity.currentIdentity.user
}
