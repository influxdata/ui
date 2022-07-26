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

// Types
import {GetState, RemoteDataState} from 'src/types'
import {OrganizationSummaries} from 'src/client/unityRoutes'

type Actions = QuartzOrganizationActions | PublishNotificationAction
type DefaultOrg = OrganizationSummaries[number]

interface UpdateOrgParams {
  accountId: number
  newDefaultOrg: DefaultOrg
}

class OrgNotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = 'DefaultOrgNotFoundError'
  }
}

// Error Reporting
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'

// Both of these thunks need to take the current account ID as an argument.
export const getQuartzOrganizationsThunk = (accountId: number) => async (
  dispatch: Dispatch<Actions>,
  getState: GetState
) => {
  try {
    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Loading))
    const quartzOrganizations = await fetchOrgsByAccountID(accountId)

    dispatch(setQuartzOrganizations(quartzOrganizations))
  } catch (err) {
    console.log('failed to retrieve organizaitons')
    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Error))

    reportErrorThroughHoneyBadger(err, {
      name: 'Failed to fetch /quartz/orgs/',
      context: {state: getState()},
    })
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
    console.log('successfully updated default org')

    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Loading))

    await updateDefaultOrgByAccountID({
      accountNum: accountId,
      orgId: newDefaultOrg.id,
    })

    dispatch(setQuartzDefaultOrg(newDefaultOrg.id))
    const state = getState()
    const orgStatus = state.identity.currentIdentity.status

    if (orgStatus === RemoteDataState.Error) {
      const defaultOrgErrMsg =
        'quartzOrganizations state does not contain requested default organization'

      reportErrorThroughHoneyBadger(new OrgNotFoundError(defaultOrgErrMsg), {
        name: defaultOrgErrMsg,
        context: {
          org: newDefaultOrg,
          state: getState(),
        },
      })
    }
  } catch (err) {
    console.log('failed to update org')
    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Error))

    reportErrorThroughHoneyBadger(err, {
      name: 'Failed to update /quartz/orgs/default',
      context: {state: getState()},
    })
  }
}
