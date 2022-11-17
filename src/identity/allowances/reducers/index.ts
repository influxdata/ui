// Libraries
import produce from 'immer'

// Actions
import {
  Actions,
  SET_ALLOWANCES,
  SET_ALLOWANCES_LOADING_STATUS,
} from 'src/identity/allowances/actions/creators'

// Types
import {RemoteDataState} from 'src/types'

export const initialState = {
  orgCreation: {
    allowed: false,
    availableUpgrade: 'none',
    loadingStatus: RemoteDataState.NotStarted,
  },
}

export default (state = initialState, action: Actions) =>
  produce(state, draftState => {
    switch (action.type) {
      case SET_ALLOWANCES: {
        const {allowed, availableUpgrade} = action.allowances

        draftState.orgCreation.allowed = allowed
        draftState.orgCreation.availableUpgrade = availableUpgrade
        return
      }

      case SET_ALLOWANCES_LOADING_STATUS: {
        draftState.orgCreation.loadingStatus = action.loadingStatus
        return
      }
    }
  })
