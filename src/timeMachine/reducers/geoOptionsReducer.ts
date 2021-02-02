import {
  SET_MAP_TYPE,
  SET_ALLOW_PAN_AND_ZOOM,
  SET_ZOOM_VALUE,
  SET_LONGITUDE,
  SET_LATITUDE,
  SET_RADIUS,
} from 'src/timeMachine/actions/geoOptionsCreators'

import {
  TimeMachinesAction,
  TimeMachineState,
  setViewProperties,
} from 'src/timeMachine/reducers'

export const defaultHeatmap = {
  type: 'heatmap',
  radius: 20,
  blur: 10,
  intensityDimension: {label: 'Value'},
  intensityField: '_value',
  colors: [
    {type: 'min', hex: '#00ff00'},
    {value: 50, hex: '#ffae42'},
    {value: 60, hex: '#ff0000'},
    {type: 'max', hex: '#ff0000'},
  ],
}

export const defaultPointMap = {
  type: 'pointMap',
  colorDimension: {label: 'Duration'},
  colorField: 'duration',
  colors: [
    {type: 'min', hex: '#ff0000'},
    {value: 50, hex: '#343aeb'},
    {type: 'max', hex: '#343aeb'},
  ],
  isClustered: false,
}

export const defaultTrackMap = {
  type: 'trackMap',
  speed: 200,
  trackWidth: 4,
  randomColors: false,
  endStopMarkers: true,
  endStopMarkerRadius: 4,
  colors: [
    {type: 'min', hex: '#0000FF'},
    {type: 'max', hex: '#F0F0FF'},
  ],
}

export const defaultCircleMap = {
  type: 'circleMap',
  radiusField: 'magnitude',
  radiusDimension: {label: 'Magnitude'},
  colorDimension: {label: 'Duration'},
  colorField: 'duration',
  colors: [
    {type: 'min', hex: '#ff00b3'},
    {value: 50, hex: '#343aeb'},
    {type: 'max', hex: '#343aeb'},
  ],
}

export const geoOptionsReducer = (
  state: TimeMachineState,
  action: TimeMachinesAction
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
