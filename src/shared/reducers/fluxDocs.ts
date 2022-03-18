// Libraries
import {produce} from 'immer'

// Types
import {FluxDocs, ResourceState, RemoteDataState, ResourceType} from 'src/types'
import {Action, SET_FLUX_DOCS} from 'src/shared/actions/fluxDocs'

// Utils
import {setResource} from 'src/resources/reducers/helpers'

type FluxDocsState = ResourceState['fluxDocs']

export const initialState = (): FluxDocsState => ({
  status: RemoteDataState.NotStarted,
  byID: {},
  allIDs: [],
})

const fluxDocsReducer = (
  state: FluxDocsState = initialState(),
  action: Action
): FluxDocsState =>
  produce(state, draftState => {
    switch (action.type) {
      case SET_FLUX_DOCS: {
        setResource<FluxDocs>(draftState, action, ResourceType.FluxDocs)

        return
      }
    }
  })

export default fluxDocsReducer
