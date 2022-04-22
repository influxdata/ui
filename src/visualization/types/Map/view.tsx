// Libraries
import React, {FC, useEffect, useState} from 'react'
import {Config, Plot} from '@influxdata/giraffe'
import {RemoteDataState} from '@influxdata/clockface'
import {isEmpty} from 'lodash'

// Types
import {GeoViewProperties} from 'src/types'
import {VisualizationProps} from 'src/visualization'
// Utils
import {getGeoCoordinates} from 'src/shared/utils/vis'
import {event} from 'src/cloud/utils/reporting'
import {CLOUD} from 'src/shared/constants'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

let getMapToken = null

if (CLOUD) {
  getMapToken = require('src/client/mapsdRoutes').getMapToken
  if (isFlagEnabled('uiproxyd')) {
    getMapToken = require('src/client/uiproxydRoutes').getMapToken
  }
}

interface Props extends VisualizationProps {
  properties: GeoViewProperties
}

type GeoCoordinates = {
  lat: number
  lon: number
}

const GeoPlot: FC<Props> = ({result, properties}) => {
  const {
    layers,
    zoom,
    allowPanAndZoom,
    mapStyle,
    useS2CellID,
    s2Column,
    latLonColumns,
  } = properties
  const {lat, lon} = properties.center

  const [mapServiceError, setMapServiceError] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )
  const [mapToken, setMapToken] = useState<string>('')
  const [coordinateError, setCoordinateError] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )
  const [geoCoordinates, setGeoCoordinates] = useState<GeoCoordinates>({
    lat,
    lon,
  })

  useEffect(() => {
    const token = properties?.layers?.find(
      layer => layer?.tileServerConfiguration?.tileServerUrl
    )
    if (CLOUD && token) {
      setMapServiceError(RemoteDataState.Done)
      setMapToken(token.tileServerConfiguration?.tileServerUrl)
    }
    if (CLOUD && !token) {
      const getToken = async () => {
        try {
          setMapServiceError(RemoteDataState.Loading)
          const resp = await getMapToken({})

          if (resp.status !== 200) {
            throw new Error(resp.data.message)
          }

          setMapToken(resp.data.token)
          setMapServiceError(RemoteDataState.Done)
          event('mapplot.map_token_request.success')
        } catch (err) {
          setMapServiceError(RemoteDataState.Error)
          event('mapplot.map_token_request.failure')
        }
      }
      getToken()
    }
  }, [properties.layers])

  useEffect(() => {
    try {
      setCoordinateError(RemoteDataState.Loading)
      if (CLOUD) {
        const coordinates = getGeoCoordinates(
          result.table,
          0,
          useS2CellID,
          s2Column,
          latLonColumns
        )
        setGeoCoordinates(coordinates)
      }

      setCoordinateError(RemoteDataState.Done)
      event('mapplot.get_geo_coordinates.success')
    } catch (err) {
      setCoordinateError(RemoteDataState.Error)
      event('mapplot.get_geo_coordinates.failure')
    }
  }, [useS2CellID, s2Column, latLonColumns, result.table])

  let error = ''

  const getMapboxUrl = () => {
    if (mapToken) {
      return `https://api.mapbox.com/styles/v1/influxdata/cklspghhd1opp17mmz0yk7rcy/tiles/256/{z}/{x}/{y}@2x?access_token=${mapToken}`
    }
    return ''
  }

  if (
    mapServiceError === RemoteDataState.NotStarted ||
    coordinateError === RemoteDataState.NotStarted ||
    mapServiceError === RemoteDataState.Loading ||
    coordinateError === RemoteDataState.Loading
  ) {
    return null
  }

  if (mapServiceError === RemoteDataState.Error) {
    error =
      'We are having issues connecting to the Maps Server. Please try again later'

    return (
      <div className="panel-resizer--error" data-testid="geoplot-error">
        {error}
      </div>
    )
  } else if (coordinateError === RemoteDataState.Error) {
    error =
      'Map type is not supported with the data provided. Please use customization options to select correct fields to use for lat/lon'

    return (
      <div className="panel-resizer--error" data-testid="geoplot-error">
        {error}
      </div>
    )
  }

  const tileServerConfiguration = {
    tileServerUrl: getMapboxUrl(),
    bingKey: '',
  }

  let layersOpts = layers
  if (!layers.length) {
    layersOpts = [
      {
        type: 'pointMap',
        colorDimension: {label: 'Value'},
        colorField: '_value',
        colors: [],
        isClustered: false,
        tooltipColumns: [],
      },
    ]
  }

  const tooltipColumns = isEmpty(layersOpts[0].tooltipColumns)
    ? result.fluxGroupKeyUnion
    : layersOpts[0].tooltipColumns

  layersOpts[0] = {...layersOpts[0], tooltipColumns}

  let zoomOpt = zoom
  if (zoom === 0) {
    zoomOpt = 6
  }

  let config: Config

  if (CLOUD) {
    config = {
      table: result.table,
      showAxes: false,
      layers: [
        {
          type: 'geo',
          lat: geoCoordinates.lat,
          lon: geoCoordinates.lon,
          zoom: zoomOpt,
          allowPanAndZoom,
          detectCoordinateFields: true,
          mapStyle,
          layers: layersOpts,
          tileServerConfiguration: tileServerConfiguration,
          useS2CellID: useS2CellID,
          s2Column: s2Column,
          latLonColumns: latLonColumns,
        },
      ],
    }
  }

  return <Plot config={config} />
}

export default GeoPlot
