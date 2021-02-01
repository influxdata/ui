import React from 'react'
import {fireEvent, waitFor} from '@testing-library/react'
import {renderWithRedux} from 'src/mockState'
import {GeoOptions} from 'src/timeMachine/components/view_options/GeoOptions'
import {GeoViewProperties} from 'src/types'
import {createView} from 'src/views/helpers'
import {mockAppState} from 'src/mockAppState'
import * as geoTimeMachineActions from 'src/timeMachine/actions/geoOptionsCreators'
import {
  defaultHeatmap,
  defaultPointMap,
} from 'src/timeMachine/utils/geoMapTypeDefaults'
const setup = (override = {}) => {
  const geoStateView = createView('geo')

  const geoViewProperties: GeoViewProperties = {
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
    layers: [defaultPointMap],
    ...override,
  }

  return renderWithRedux(<GeoOptions {...geoViewProperties} />, () => {
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
    const latitude = getByTestId('geo-latitude')
    const longitude = getByTestId('geo-longitude')
    const zoom = getByTestId('geo-zoom')
    const allowPanAndZoom = getByTestId('geo-toggle-pan-zoom')

    fireEvent.change(latitude, {target: {value: 40}})
    fireEvent.change(longitude, {target: {value: 39}})
    fireEvent.change(zoom, {target: {value: 12}})
    fireEvent.click(allowPanAndZoom)

    const storeProps = store.getState().timeMachines.timeMachines.de.view
      .properties as GeoViewProperties
    expect(storeProps.allowPanAndZoom).toEqual(false)
    expect(storeProps.center).toEqual({lat: 40, lon: 39})
    expect(storeProps.zoom).toEqual(12)
  })

  it('fires the correct action to set the map type to the selected option', () => {
    const {getByTestId, findByTestId, store} = setup()
    const heatmapOption = getByTestId('Heat-option')

    fireEvent.click(heatmapOption)

    waitFor(() => {
      expect(findByTestId('heatmapradiusslider')).toBeInTheDocument()
      const storeProps = store.getState().timeMachines.timeMachines.de.view
        .properties as GeoViewProperties
      expect(storeProps.layers[0]).toEqual(defaultHeatmap)
    })
  })

  /* This test will have to be removed when we add the trackmap feature, but is currently necessary. */
  it('does not currently allow for selecting the trackmap type', () => {
    const {getByTestId} = setup()
    const spyOnAction = jest.spyOn(geoTimeMachineActions, 'setMapType')

    const trackMapOption = getByTestId('Track-option')
    fireEvent.click(trackMapOption)

    expect(spyOnAction).not.toHaveBeenCalled()
  })
})
