// Libraries
import React, {FC, useEffect, useState} from 'react'
import {Plot} from '@influxdata/giraffe'
import {RemoteDataState} from '@influxdata/clockface'

// Types
import {GeoViewProperties} from 'src/types'
import {VisualizationProps} from 'src/visualization'

// Utils
import {
  getDetectCoordinatingFields,
  getGeoCoordinates,
} from 'src/shared/utils/vis'
import {getMapToken} from './api'

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
      } catch (err) {
        setMapServiceError(RemoteDataState.Error)
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
    } catch (err) {
      setCoordinateError(RemoteDataState.Error)
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
      'Map type is having issues connecting to the server. Please try again later.'

    return (
      <div className="panel-resizer--error" data-testid="geoplot-error">
        {error}
      </div>
    )
  } else if (coordinateError === RemoteDataState.Error) {
    error =
      'Map type is not supported with the data provided: Missing latitude/longitude values (field values must be specified to lat or lon)'

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
            zoom,
            allowPanAndZoom,
            detectCoordinateFields: coordinateFieldsFlag,
            mapStyle,
            layers,
            tileServerConfiguration: tileServerConfiguration,
          },
        ],
      }}
    />
  )
}

export default GeoPlot
