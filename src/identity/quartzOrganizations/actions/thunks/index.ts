import {Dispatch} from 'react'

// API
import {fetchQuartzOrgs, updateDefaultQuartzOrg} from 'src/identity/apis/auth'

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

class OrgNotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = 'DefaultOrgNotFoundError'
  }
}

// Error Reporting
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'

export const getQuartzOrganizationsThunk = () => async (
  dispatch: Dispatch<Actions>,
  getState: GetState
) => {
  try {
    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Loading))
    const quartzOrganizations = await fetchQuartzOrgs()

    dispatch(setQuartzOrganizations(quartzOrganizations))
  } catch (err) {
    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Error))

    reportErrorThroughHoneyBadger(err, {
      name: 'Failed to fetch /quartz/orgs/',
      context: {state: getState()},
    })
  }
}

export const updateDefaultOrgThunk = (newDefaultOrg: DefaultOrg) => async (
  dispatch: Dispatch<Actions>,
  getState: GetState
) => {
  try {
    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Loading))

    await updateDefaultQuartzOrg(newDefaultOrg.id)

    dispatch(setQuartzDefaultOrg(newDefaultOrg.id))

    // const state = getState()
    // const orgStatus = state.identity.currentIdentity.status

    // if (orgStatus === RemoteDataState.Error) {
    //   const defaultOrgErrMsg =
    //     'quartzOrganizations state does not contain requested default organization'
    //   const defaultOrgErr = new OrgNotFoundError(defaultOrgErrMsg)

    //   reportErrorThroughHoneyBadger(defaultOrgErr, {
    //     name: defaultOrgErrMsg,
    //     context: {
    //       org: newDefaultOrg,
    //       state: getState(),
    //     },
    //   })
    // }
  } catch (err) {
    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Error))

    reportErrorThroughHoneyBadger(err, {
      name: 'Failed to update /quartz/orgs/default',
      context: {state: getState()},
    })
  }
}
