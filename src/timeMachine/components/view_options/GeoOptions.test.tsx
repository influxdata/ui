import React from 'react'
import {fireEvent, waitFor} from '@testing-library/react'
import {renderWithRedux} from 'src/mockState'
import * as redux from 'react-redux'
import GeoOptions from 'src/timeMachine/components/view_options/GeoOptions'
import {GeoViewProperties} from 'src/types'
import {initialStateHelper} from 'src/timeMachine/reducers'
import {createView} from 'src/views/helpers'
import {mockAppState} from 'src/mockAppState'
import * as timeMachineActions from 'src/timeMachine/actions'

/* 
switch (mapType) {
        case 'pointMap':
          mapTypeLayer[0] = {
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
          return setViewProperties(state, {
            layers: mapTypeLayer,
          })
        case 'heatmap':
          mapTypeLayer[0] = {
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
          return setViewProperties(state, {
            layers: mapTypeLayer,
          })
        case 'trackMap':
          mapTypeLayer[0] = {
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
          return setViewProperties(state, {
            layers: mapTypeLayer,
          })
        case 'circleMap':
          mapTypeLayer[0] = {
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
          return setViewProperties(state, {
            layers: mapTypeLayer,
          })
        default:
          return state
      }
*/
const setup = (override = {}) => {
  const geoStateView = createView('geo')

  const props: GeoViewProperties = {
    type: 'geo',
    queries: [],
    shape: 'chronograf-v2',
    center: {
      lat: 0,
      lon: 0,
    },
    zoom: 6,
    allowPanAndZoom: true,
    detectCoordinateFields: true,
    mapStyle: '',
    note: '',
    showNoteWhenEmpty: true,
    colors: [],
    layers: [
      {
        type: 'pointMap',
        colorDimension: {label: 'Duration'},
        colorField: 'duration',
        colors: [
          {type: 'min', hex: '#ff0000'},
          {value: 50, hex: '#343aeb'},
          {type: 'max', hex: '#343aeb'},
        ],
        isClustered: false,
      },
    ],
    ...override,
  }

  return renderWithRedux(<GeoOptions {...props} />, initialState => {
    const appState = {...mockAppState} as any
    appState.timeMachines.timeMachines.de.view = geoStateView
    return appState
  })
}

describe('GeoOptions Geo Customization Options', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('changes the lat, lon, allowPanAndZoom, and zoom properties for the selected map type', () => {
    const {getByTestId, store} = setup()
    const latitude = getByTestId('geoLatitude')
    const longitude = getByTestId('geoLongitude')
    const zoom = getByTestId('geoZoom')
    const allowPanAndZoom = getByTestId('geoAllowPanZoom')
    const spyLatitudeAction = jest.spyOn(timeMachineActions, 'setLatitude')
    const spyLongitudeAction = jest.spyOn(timeMachineActions, 'setLongitude')
    const spyZoomAction = jest.spyOn(timeMachineActions, 'setZoomValue')

    fireEvent.change(latitude, {target: {value: 40}})
    fireEvent.change(longitude, {target: {value: 39}})
    fireEvent.change(zoom, {target: {value: 12}})
    fireEvent.click(allowPanAndZoom)
    expect(spyLatitudeAction).toHaveBeenCalledWith(40)
    expect(spyLongitudeAction).toHaveBeenCalledWith(39)
    expect(spyZoomAction).toHaveBeenCalledWith(12)

    const storeProps = store.getState().timeMachines.timeMachines.de.view
      .properties as GeoViewProperties
    expect(storeProps.allowPanAndZoom).toEqual(false)
    expect(storeProps.center).toEqual({lat: 40, lon: 39})
    expect(storeProps.zoom).toEqual(12)
  })

  it('fires the correct action to set the map type to the selected option', () => {
    const {getByTestId, findByTestId, store} = setup()
    const spyOnAction = jest.spyOn(timeMachineActions, 'setMapType')
    const heatmapOption = getByTestId('Heat-option')

    fireEvent.click(heatmapOption)
    expect(spyOnAction).toHaveBeenCalledWith('heatmap')
    waitFor(() => {
      expect(findByTestId('heatmapradiusslider')).toBeInTheDocument()
      const storeProps = store.getState().timeMachines.timeMachines.de.view
        .properties as GeoViewProperties
      expect(storeProps.layers[0]).toEqual({
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
      })
    })
  })

  /* This test will have to be removed when we add the trackmap feature, but is currently necessary. */
  it('does not currently allow for selecting the trackmap type', () => {
    const {getByTestId} = setup()
    const spyOnAction = jest.spyOn(timeMachineActions, 'setMapType')

    const trackMapOption = getByTestId('Track-option')
    fireEvent.click(trackMapOption)

    expect(spyOnAction).not.toHaveBeenCalled()
  })
})
