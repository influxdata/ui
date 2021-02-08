// Libraries
import produce from 'immer'

// Actions
import {Actions, SET_ME} from 'src/me/actions/creators'

export interface MeLinks {
  self: string
  log: string
}

export interface MeState {
  id: string
  name: string
  links: MeLinks
}

export const initialState: MeState = {
  id: '',
  name: '',
  links: {
    self: '',
    log: '',
  },
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
    }
  })
