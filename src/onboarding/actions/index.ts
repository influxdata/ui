// Libraries
import {get} from 'lodash'

// Constants
import {StepStatus} from 'src/shared/constants/wizard'
import {SetupSuccess, SetupError} from 'src/shared/copy/notifications'

import {CLOUD} from 'src/shared/constants'

// Actions
import {notify} from 'src/shared/actions/notifications'

// APIs
import * as api from 'src/client'

// Types
import {AppThunk} from 'src/types'
import {OnboardingRequest} from 'src/client'

export type Action =
  | SetSetupParams
  | SetStepStatus
  | SetOrganizationID
  | SetBucketID
  | SetToken

interface SetSetupParams {
  type: 'SET_SETUP_PARAMS'
  payload: {setupParams: OnboardingRequest}
}

export const setSetupParams = (
  setupParams: OnboardingRequest
): SetSetupParams => ({
  type: 'SET_SETUP_PARAMS',
  payload: {setupParams},
})

interface SetStepStatus {
  type: 'SET_STEP_STATUS'
  payload: {index: number; status: StepStatus}
}

export const setStepStatus = (
  index: number,
  status: StepStatus
): SetStepStatus => ({
  type: 'SET_STEP_STATUS',
  payload: {
    index,
    status,
  },
})

interface SetOrganizationID {
  type: 'SET_ORG_ID'
  payload: {orgID: string}
}

const setOrganizationID = (orgID: string): SetOrganizationID => ({
  type: 'SET_ORG_ID',
  payload: {orgID},
})

interface SetBucketID {
  type: 'SET_ONBOARDING_BUCKET_ID'
  payload: {bucketID: string}
}

export const setBucketID = (bucketID: string): SetBucketID => ({
  type: 'SET_ONBOARDING_BUCKET_ID',
  payload: {bucketID},
})

interface SetToken {
  type: 'SET_OPERATOR_TOKEN'
  payload: {token: string}
}

export const setToken = (token: string): SetToken => ({
  type: 'SET_OPERATOR_TOKEN',
  payload: {token},
})

export const setupAdmin =
  (params: OnboardingRequest): AppThunk<Promise<boolean>> =>
  async dispatch => {
    try {
      dispatch(setSetupParams(params))
      const response = await api.postSetup({data: params})

      if (response.status !== 201) {
        throw new Error(response.data.message)
      }

      if (!CLOUD) {
        dispatch(setToken(response.data.auth.token))
      }

      const {id: orgID} = response.data.org
      const {id: bucketID} = response.data.bucket

      dispatch(setOrganizationID(orgID))
      dispatch(setBucketID(bucketID))

      const {username, password} = params

      const resp = await api.postSignin({auth: {username, password}})

      if (resp.status !== 204) {
        throw new Error(resp.data.message)
      }

      dispatch(notify(SetupSuccess))
      dispatch(setStepStatus(1, StepStatus.Complete))
      return true
    } catch (err) {
      console.error(err)
      const message = get(err, 'response.data.message', '')
      dispatch(notify(SetupError(message)))
      dispatch(setStepStatus(1, StepStatus.Error))
    }
  }
