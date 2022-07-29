import {Dispatch} from 'react'

// API
import {
  fetchOrgsByAccountID,
  updateDefaultOrgByAccountID,
} from 'src/identity/apis/auth'

// Actions
import {
  Actions as QuartzOrganizationActions,
  setQuartzDefaultOrg,
  setQuartzOrganizations,
  setQuartzOrganizationsStatus,
} from 'src/identity/quartzOrganizations/actions/creators'
import {PublishNotificationAction} from 'src/shared/actions/notifications'

// Notifications
import {
  orgDefaultSettingError,
  orgDefaultSettingSuccess,
} from 'src/shared/copy/notifications'

// Types
import {GetState, RemoteDataState} from 'src/types'
import {OrganizationSummaries} from 'src/client/unityRoutes'
type Actions = QuartzOrganizationActions | PublishNotificationAction
type DefaultOrg = OrganizationSummaries[number]

interface UpdateOrgParams {
  accountId: number
  newDefaultOrg: DefaultOrg
}

// Utils
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'

// Errors
import {NetworkErrorTypes} from 'src/identity/apis/auth.ts'

export enum ThunkErrorNames {
  CannotSetDefaultOrg = 'CannotSetDefaultOrg',
  NetworkError = 'NetworkError',
}

export class DefaultOrgReduxError extends Error {
  constructor(message) {
    super(message)
    this.message = message
      ? message
      : 'Failed to set new default organization in state'
    this.name = ThunkErrorNames.CannotSetDefaultOrg
  }
}

export class DefaultOrgNetworkError extends Error {
  constructor(message) {
    super(message)
    this.name = ThunkErrorNames.NetworkError
  }
}

export class FetchOrgsNetworkError extends Error {
  constructor(message) {
    super(message)
    this.name = ThunkErrorNames.NetworkError
  }
}

// Thunks
export const getQuartzOrganizationsThunk = (accountId: number) => async (
  dispatch: Dispatch<Actions>,
  getState: GetState
) => {
  try {
    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Loading))

    const quartzOrganizations = await fetchOrgsByAccountID(accountId)

    dispatch(setQuartzOrganizations(quartzOrganizations))
  } catch (err) {
    reportErrorThroughHoneyBadger(err, {
      name: 'Failed to fetch /quartz/orgs/',
      context: {state: getState()},
    })

    throw new FetchOrgsNetworkError(err)
  }
}

export const updateDefaultOrgThunk = ({
  accountId,
  newDefaultOrg,
}: UpdateOrgParams) => async (
  dispatch: Dispatch<Actions>,
  getState: GetState
) => {
  try {
    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Loading))

    await updateDefaultOrgByAccountID({
      accountNum: accountId,
      orgId: newDefaultOrg.id,
    })

    dispatch(setQuartzDefaultOrg(newDefaultOrg.id))

    const state = getState()
    const orgStatus = state.identity.currentIdentity.status

    if (orgStatus === RemoteDataState.Error) {
      throw new DefaultOrgReduxError()
    }
  } catch (err) {
    reportErrorThroughHoneyBadger(err, {
      name: err.name,
      context: {
        message: err.message,
        org: newDefaultOrg,
        state: getState(),
      },
    })

    switch (err.name) {
      case ThunkErrorNames.CannotSetDefaultOrg:
        throw new DefaultOrgReduxError(err)
      default:
        throw new DefaultOrgNetworkError(err)
    }
  }
}
