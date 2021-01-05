import {SET_INTEGRATION_TOKEN} from '../actions'

export interface IntegrationsState {
  [integration: string]: string
}

const defaultState: IntegrationsState = {}

export default (state = defaultState, action): IntegrationsState => {
  switch (action.type) {
    case SET_INTEGRATION_TOKEN:
      const {integration, token} = action.payload
      return {...state, [integration]: token}
    default:
      return state
  }
}
