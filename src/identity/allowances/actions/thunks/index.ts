// Libraries
import {Dispatch} from 'react'

// Actions
import {
  Actions as OrgCreationAllowancesActions,
  setOrgCreationAllowances,
  setOrgCreationAllowancesStatus,
} from 'src/identity/allowances/actions/creators'

// API
import {fetchOrgCreationAllowance} from 'src/identity/apis/org'

// Types
import {GetState, RemoteDataState} from 'src/types'

// Utils
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'

type Actions = OrgCreationAllowancesActions

export const getOrgCreationAllowancesThunk =
  () => async (dispatch: Dispatch<Actions>, getState: GetState) => {
    try {
      dispatch(setOrgCreationAllowancesStatus(RemoteDataState.Loading))

      const allowances = await fetchOrgCreationAllowance()

      dispatch(setOrgCreationAllowances(allowances))

      dispatch(setOrgCreationAllowancesStatus(RemoteDataState.Done))
    } catch (error) {
      reportErrorThroughHoneyBadger(error, {
        name: 'Failed to fetch org creation Allowances',
        context: {state: getState().identity},
      })
    }
  }
