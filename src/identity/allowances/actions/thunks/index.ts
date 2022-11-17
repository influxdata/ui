// Libraries
import {Dispatch} from 'react'

// Actions
import {
  Actions as AllowancesActions,
  setAllowances,
  setAllowancesLoadingStatus,
} from 'src/identity/allowances/actions/creators'

// API
import {fetchOrgCreationAllowance} from 'src/identity/apis/org'

// Types
import {GetState, RemoteDataState} from 'src/types'

// Utils
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'

type Actions = AllowancesActions

export const getAllowancesThunk =
  () => async (dispatch: Dispatch<Actions>, getState: GetState) => {
    try {
      dispatch(setAllowancesLoadingStatus(RemoteDataState.Loading))

      const allowances = await fetchOrgCreationAllowance()

      dispatch(setAllowances(allowances))

      dispatch(setAllowancesLoadingStatus(RemoteDataState.Done))
    } catch (error) {
      reportErrorThroughHoneyBadger(error, {
        name: 'Failed to fetch org creation Allowances',
        context: {state: getState()},
      })
    }
  }
