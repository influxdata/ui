// Libraries
import {Dispatch} from 'react'

// Actions
import {
  OrgCreationAllowanceActions,
  setOrgCreationAllowance,
  setOrgCreationAllowanceStatus,
} from 'src/identity/allowances/actions/creators'

// API
import {fetchOrgCreationAllowance} from 'src/identity/apis/org'

// Types
import {GetState, RemoteDataState} from 'src/types'

// Utils
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'

export const getOrgCreationAllowancesThunk =
  () =>
  async (
    dispatch: Dispatch<OrgCreationAllowanceActions>,
    getState: GetState
  ) => {
    try {
      dispatch(setOrgCreationAllowanceStatus(RemoteDataState.Loading))

      const allowances = await fetchOrgCreationAllowance()

      dispatch(setOrgCreationAllowance(allowances))

      dispatch(setOrgCreationAllowanceStatus(RemoteDataState.Done))

      return allowances.allowed
    } catch (error) {
      reportErrorThroughHoneyBadger(error, {
        name: 'Failed to fetch org creation allowance',
        context: {state: getState().identity},
      })
      return false
    }
  }
