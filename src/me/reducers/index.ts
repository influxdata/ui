// Libraries
import produce from 'immer'

// Actions
import {
  Actions,
  SET_ME,
  SET_QUARTZ_ME,
  SET_QUARTZ_ME_STATUS,
} from 'src/me/actions/creators'

// Types
import {Me} from 'src/client/unityRoutes'
import {RemoteDataState} from 'src/types'
export interface MeLinks {
  self: string
  log: string
}

export interface MeState {
  id: string
  name: string
  links: MeLinks
  quartzMe?: Me
  quartzMeStatus: RemoteDataState
}

export const initialState: MeState = {
  id: '',
  name: '',
  links: {
    self: '',
    log: '',
  },
  quartzMe: null,
  quartzMeStatus: RemoteDataState.NotStarted,
}

export default (state = initialState, action: Actions): MeState =>
  produce(state, draftState => {
    switch (action.type) {
      case SET_ME: {
        draftState.id = action.me.id
        draftState.name = action.me.name
        draftState.links = action.me.links

        return
      }
      case SET_QUARTZ_ME: {
        draftState.quartzMe = action.quartzMe
        draftState.quartzMeStatus = action.status

        return
      }
      case SET_QUARTZ_ME_STATUS: {
        draftState.quartzMeStatus = action.status

        return
      }
    }
  })
