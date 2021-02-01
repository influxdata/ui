import {
  SET_MAP_TYPE,
  SET_ALLOW_PAN_AND_ZOOM,
  SET_ZOOM_VALUE,
  SET_LONGITUDE,
  SET_LATITUDE,
  SET_RADIUS,
} from 'src/timeMachine/actions/geoOptionsCreators'

import {
  TimeMachineAction,
  TimeMachineState,
  setViewProperties,
} from 'src/timeMachine/reducers'
import {
  defaultHeatmap,
  defaultPointMap,
  defaultTrackMap,
  defaultCircleMap,
} from 'src/timeMachine/utils/geoMapTypeDefaults'

export const geoOptionsReducer = (
  state: TimeMachineState,
  action: TimeMachineAction
): TimeMachineState => {
  switch (action.type) {
    case SET_MAP_TYPE: {
      const {mapType} = action

      switch (mapType) {
        case 'pointMap': {
          return setViewProperties(state, {
            layers: [defaultPointMap],
          })
        }
        case 'heatmap': {
          return setViewProperties(state, {
            layers: [defaultHeatmap],
          })
        }
        case 'trackMap': {
          return setViewProperties(state, {
            layers: [defaultTrackMap],
          })
        }
        case 'circleMap': {
          return setViewProperties(state, {
            layers: [defaultCircleMap],
          })
        }
        default:
          return state
      }
    }
    case SET_ZOOM_VALUE: {
      const {zoom} = action
      return setViewProperties(state, {
        zoom,
      })
    }
    case SET_LATITUDE: {
      const {lat} = action
      switch (state.view.properties.type) {
        case 'geo':
          return setViewProperties(state, {
            center: {...state.view.properties.center, lat},
          })
        default:
          return state
      }
    }
    case SET_ALLOW_PAN_AND_ZOOM: {
      const {allowPanAndZoom} = action
      return setViewProperties(state, {allowPanAndZoom})
    }
    case SET_LONGITUDE: {
      const {lon} = action
      switch (state.view.properties.type) {
        case 'geo':
          return setViewProperties(state, {
            center: {...state.view.properties.center, lon},
          })
        default:
          return state
      }
    }
    case SET_RADIUS: {
      const {radius} = action

      switch (state.view.properties.type) {
        case 'geo':
          return setViewProperties(state, {
            layers: [{...state.view.properties.layers[0], radius}],
          })
      }
    }
  }
  return state
}
