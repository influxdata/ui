import {Actions, SET_ME} from 'src/me/actions'

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

export default (state = initialState, action: Actions): MeState => {
  switch (action.type) {
    case SET_ME:
      return {
        ...state,
        ...action.payload.me,
      }
    default:
      return state
  }
}
