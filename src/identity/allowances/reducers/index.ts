// Libraries
import produce from 'immer'

// Actions
import {
  OrgCreationAllowanceActions,
  SET_ORG_CREATION_ALLOWANCE,
  SET_ORG_CREATION_ALLOWANCE_STATUS,
} from 'src/identity/allowances/actions/creators'

// Types
import {OrgCreationAllowance} from 'src/identity/apis/org'
import {RemoteDataState} from 'src/types'

interface AllowanceState {
  orgCreation: OrgCreationAllowanceState
}
export interface OrgCreationAllowanceState extends OrgCreationAllowance {
  loadingStatus: RemoteDataState
}

export const initialState: AllowanceState = {
  orgCreation: {
    allowed: false,
    availableUpgrade: 'none',
    loadingStatus: RemoteDataState.NotStarted,
  },
}

export default (state = initialState, action: OrgCreationAllowanceActions) =>
  produce(state, draftState => {
    switch (action.type) {
      case SET_ORG_CREATION_ALLOWANCE: {
        const {allowed, availableUpgrade} = action.allowances

        draftState.orgCreation.allowed = allowed
        draftState.orgCreation.availableUpgrade = availableUpgrade
        return
      }

      case SET_ORG_CREATION_ALLOWANCE_STATUS: {
        draftState.orgCreation.loadingStatus = action.loadingStatus
        return
      }
    }
  })
