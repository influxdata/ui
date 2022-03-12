// Types
import {Action} from 'src/timeMachine/actions/scriptEditorThunks'
import {Fluxdocs} from 'src/client/fluxdocsdRoutes'

// Actions
import {GET_FLUX_DOCS} from 'src/timeMachine/actions/scriptEditorThunks'
export interface FluxDocsState {
  fluxDocs: Fluxdocs[]
}

const INITIAL_STATE: FluxDocsState = {
  fluxDocs: [],
}

export default (state = INITIAL_STATE, action: Action): FluxDocsState => {
  switch (action.type) {
    case GET_FLUX_DOCS:
      return {...state, fluxDocs: action.payload.data}
    default:
      return state
  }
}
