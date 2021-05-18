// Libraries
import React, {FC, useEffect, useState} from 'react'
import {Plot} from '@influxdata/giraffe'
import {RemoteDataState, InfluxColors} from '@influxdata/clockface'

// Types
import {GeoViewProperties} from 'src/types'
import {VisualizationProps} from 'src/visualization'

// Utils
import {
  getDetectCoordinatingFields,
  getGeoCoordinates,
} from 'src/shared/utils/vis'
import {getMapToken} from './api'
import {event} from 'src/cloud/utils/reporting'

interface Props extends VisualizationProps {
  properties: GeoViewProperties
}

type GeoCoordinates = {
  lat: number
  lon: number
}

const GeoPlot: FC<Props> = ({result, properties}) => {
  const {layers, zoom, allowPanAndZoom, mapStyle} = properties
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
  const [coordinateFieldsFlag, setCoordinateFlag] = useState<boolean>(false)

  useEffect(() => {
    const getToken = async () => {
      try {
        setMapServiceError(RemoteDataState.Loading)
        const {token} = await getMapToken()
        setMapToken(token)
        setMapServiceError(RemoteDataState.Done)
        event('mapplot.map_token_request.success')
      } catch (err) {
        setMapServiceError(RemoteDataState.Error)
        event('mapplot.map_token_request.failure')
      }
    }
    getToken()
  }, [])

  useEffect(() => {
    try {
      setCoordinateError(RemoteDataState.Loading)
      const coordinates = getGeoCoordinates(result.table, 0)
      const coordinateFlag = getDetectCoordinatingFields(result.table)
      setCoordinateFlag(coordinateFlag)
      setGeoCoordinates(coordinates)
      setCoordinateError(RemoteDataState.Done)
      event('mapplot.get_geo_coordinates.success')
    } catch (err) {
      setCoordinateError(RemoteDataState.Error)
      event('mapplot.get_geo_coordinates.failure')
    }
  }, [result.table])

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
      'Map type is not supported with the data provided. Map type only supports latitude/longitude values (field values must be specified to either lat or lon)'

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
        colors: [
          {type: 'min', hex: InfluxColors.Star},
          {value: 50, hex: InfluxColors.Star},
          {type: 'max', hex: InfluxColors.Star},
        ],
        isClustered: false,
      },
    ]
  }

  let zoomOpt = zoom
  if (zoom === 0) {
    zoomOpt = 6
  }

  return (
    <Plot
      config={{
        table: result.table,
        showAxes: false,
        layers: [
          {
            type: 'geo',
            lat: geoCoordinates.lat,
            lon: geoCoordinates.lon,
            zoom: zoomOpt,
            allowPanAndZoom,
            detectCoordinateFields: coordinateFieldsFlag,
            mapStyle,
            layers: layersOpts,
            tileServerConfiguration: tileServerConfiguration,
          },
        ],
      }}
    />
  )
}

export default GeoPlot
