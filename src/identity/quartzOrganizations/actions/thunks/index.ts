import {Dispatch} from 'react'

// API
import {
  fetchOrgsByAccountID,
  updateDefaultOrgByAccountID,
} from 'src/identity/apis/org'

// Actions
import {
  Actions as QuartzOrganizationActions,
  setQuartzDefaultOrg,
  setQuartzOrganizations,
  setQuartzOrganizationsStatus,
} from 'src/identity/quartzOrganizations/actions/creators'
import {PublishNotificationAction} from 'src/shared/actions/notifications'

// Types
import {AppThunk, GetState, RemoteDataState} from 'src/types'
import {OrganizationSummaries} from 'src/client/unityRoutes'
type Actions = QuartzOrganizationActions | PublishNotificationAction
type DefaultOrg = OrganizationSummaries[number]

interface UpdateOrgParams {
  accountId: number
  newDefaultOrg: DefaultOrg
}

// Utils
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'

export enum OrganizationThunkErrors {
  DefaultOrgStateError = 'DefaultOrgStateError',
  DefaultOrgNetworkError = 'DefaultOrgNetworkError',
}

export class DefaultOrgStateError extends Error {
  constructor(message) {
    super(message)
    this.name = OrganizationThunkErrors.DefaultOrgStateError
  }
}

export class DefaultOrgNetworkError extends Error {
  constructor(message) {
    super(message)
    this.name = OrganizationThunkErrors.DefaultOrgNetworkError
  }
}

// Thunks
export const getQuartzOrganizationsThunk =
  (accountId: number) =>
  async (dispatch: Dispatch<Actions>, getState: GetState) => {
    try {
      dispatch(setQuartzOrganizationsStatus(RemoteDataState.Loading))

      const quartzOrganizations = await fetchOrgsByAccountID(accountId)

      dispatch(setQuartzOrganizations(quartzOrganizations))

      dispatch(setQuartzOrganizationsStatus(RemoteDataState.Done))

      return quartzOrganizations
    } catch (err) {
      reportErrorThroughHoneyBadger(err, {
        name: 'Failed to fetch /quartz/orgs/',
        context: {state: getState()},
      })

      return []
    }
  }

export const updateDefaultOrgThunk =
  ({accountId, newDefaultOrg}: UpdateOrgParams): AppThunk<Promise<void>> =>
  async (dispatch: Dispatch<Actions>, getState: GetState): Promise<void> => {
    try {
      dispatch(setQuartzOrganizationsStatus(RemoteDataState.Loading))

      await updateDefaultOrgByAccountID({
        accountNum: accountId,
        orgId: newDefaultOrg.id,
      })

      dispatch(setQuartzDefaultOrg(newDefaultOrg.id))

      const state = getState()
      const orgStatus = state.identity.quartzOrganizations.status

      if (orgStatus === RemoteDataState.Error) {
        throw new DefaultOrgStateError(
          OrganizationThunkErrors.DefaultOrgStateError
        )
      }

      dispatch(setQuartzOrganizationsStatus(RemoteDataState.Done))
    } catch (err) {
      reportErrorThroughHoneyBadger(err, {
        name: err.name,
        context: {
          message: err.message,
          org: newDefaultOrg,
          state: getState(),
        },
      })

      throw Error(err)
    }
  }
