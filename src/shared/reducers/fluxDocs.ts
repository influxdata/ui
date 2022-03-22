// Types
import {RemoteDataState} from 'src/types'
import {Fluxdocs} from 'src/client/fluxdocsdRoutes'
import {Action, GET_FLUX_DOCS} from 'src/shared/actions/fluxDocs'

export interface FluxDocsState {
  status: string
  fluxDocs: Fluxdocs[]
}

const INITIAL_STATE: FluxDocsState = {
  status: RemoteDataState.NotStarted,
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
