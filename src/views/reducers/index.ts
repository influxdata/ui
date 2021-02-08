// Libraries
import {produce} from 'immer'

// Types
import {
  REMOVE_VIEW,
  RESET_VIEWS,
  SET_VIEW,
  SET_VIEWS,
  SET_VIEWS_AND_CELLS,
  Action,
} from 'src/views/actions/creators'
import {SET_DASHBOARD} from 'src/dashboards/actions/creators'
import {View, RemoteDataState, ResourceState, ResourceType} from 'src/types'

// Helpers
import {
  setResource,
  setResourceAtID,
  removeResource,
} from 'src/resources/reducers/helpers'

export type ViewsState = ResourceState['views']

const initialState = (): ViewsState => ({
  status: RemoteDataState.NotStarted,
  byID: {},
  allIDs: [],
})

const viewsReducer = (
  state: ViewsState = initialState(),
  action: Action
): ViewsState =>
  produce(state, draftState => {
    switch (action.type) {
      case SET_DASHBOARD: {
        setResource<View>(draftState, action, ResourceType.Views)
      }

      case SET_VIEWS: {
        setResource<View>(draftState, action, ResourceType.Views)

        return
      }
      case SET_VIEWS_AND_CELLS: {
        const {viewsArray} = action
        viewsArray.forEach(view => {
          setResource<View>(draftState, view, ResourceType.Views)
        })

        return
      }
      case SET_VIEW: {
        setResourceAtID<View>(draftState, action, ResourceType.Views)

        return
      }
      case RESET_VIEWS: {
        return initialState()
      }
      case REMOVE_VIEW: {
        removeResource<View>(draftState, action)

        return
      }
    }
  })

export default viewsReducer
