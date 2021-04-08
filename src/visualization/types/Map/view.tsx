// Libraries
import React, {FC, useEffect, useState} from 'react'
import {Plot} from '@influxdata/giraffe'

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

enum MapErrorStates {
  MapServiceUnavailable = 'MapServiceUnavailable',
  InvalidCoordinates = 'InvalidCoordinates',
}

type GeoCoordinates = {
  lat: number
  lon: number
}

const GeoPlot: FC<Props> = ({result, properties}) => {
  const {layers, zoom, allowPanAndZoom, mapStyle} = properties
  const {lat, lon} = properties.center

  const [mapServiceError, setMapServiceError] = useState<string>('')
  const [mapToken, setMapToken] = useState<string>('')
  const [coordinateError, setCoordinateError] = useState<string>('')
  const [geoCoordinates, setGeoCoordinates] = useState<GeoCoordinates>({
    lat,
    lon,
  })

  useEffect(() => {
    const getToken = async () => {
      try {
        const {token} = await getMapToken()
        setMapToken(token)
        setMapServiceError('')
      } catch (err) {
        setMapServiceError(MapErrorStates.MapServiceUnavailable)
      }
    }
    getToken()
  }, [])

  useEffect(() => {
    try {
      const coordinates = getGeoCoordinates(result.table, 0)
      setGeoCoordinates(coordinates)
      setCoordinateError('')
    } catch (err) {
      setCoordinateError(MapErrorStates.InvalidCoordinates)
    }
  }, [result.table])

  let error = ''

  const getMapboxUrl = () => {
    if (mapToken) {
      return `https://api.mapbox.com/styles/v1/influxdata/cklspghhd1opp17mmz0yk7rcy/tiles/256/{z}/{x}/{y}@2x?access_token=${mapToken}`
    }
    return ''
  }

  const coordinatingFieldsFlag = getDetectCoordinatingFields(result.table)

  if (mapServiceError === MapErrorStates.MapServiceUnavailable) {
    error =
      'Map type is having issues connecting to the server. Please try again later.'

    return (
      <div className="panel-resizer--error" data-testid="geoplot-error">
        {error}
      </div>
    )
  } else if (coordinateError === MapErrorStates.InvalidCoordinates) {
    error =
      'Map type is not supported with the data provided: Missing latitude/longitude values (field values must be specified to lat or lon)'

    return (
      <div className="panel-resizer--error" data-testid="geoplot-error">
        {error}
      </div>
    )
  } else {
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
              detectCoordinateFields: coordinatingFieldsFlag,
              mapStyle,
              layers,
              tileServerConfiguration: tileServerConfiguration,
            },
          ],
        }}
      />
    )
  }
}

export default GeoPlot
