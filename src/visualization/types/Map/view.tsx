// Libraries
import React, {FC, useEffect, useState} from 'react'
import {Plot} from '@influxdata/giraffe'

// Types
import {GeoViewProperties} from 'src/types'
import {VisualizationProps} from 'src/visualization'

// Utils
import {getGeoCoordinates} from 'src/shared/utils/vis'
import {getMapToken} from './api'

interface Props extends VisualizationProps {
  properties: GeoViewProperties
}

enum MapErrorStates {
  MapServiceUnavailable = 'MapServiceUnavailable',
  InvalidCoordinates = 'InvalidCoordinates',
}

const GeoPlot: FC<Props> = ({result, properties}) => {
  const {
    layers,
    zoom,
    allowPanAndZoom,
    detectCoordinateFields,
    mapStyle,
  } = properties

  const [errorCode, setErrorCode] = useState<string>('')
  const [mapToken, setMapToken] = useState<string>('')

  useEffect(() => {
    const getToken = async () => {
      try {
        const {token} = await getMapToken()
        setMapToken(token)
      } catch (err) {
        setErrorCode(MapErrorStates.MapServiceUnavailable)
      }
    }
    getToken()
  })

  let error = ''

  const {lat, lon} = properties.center

  let calculatedGeoCoordinates = {
    lat,
    lon,
  }
  try {
    calculatedGeoCoordinates = getGeoCoordinates(result.table, 0)
  } catch (err) {
    setErrorCode(MapErrorStates.InvalidCoordinates)
  }

  const getMapboxUrl = () => {
    if (mapToken) {
      return `https://api.mapbox.com/styles/v1/influxdata/cklspghhd1opp17mmz0yk7rcy/tiles/256/{z}/{x}/{y}@2x?access_token=${mapToken}`
    }
    return ''
  }

  switch (errorCode) {
    case MapErrorStates.MapServiceUnavailable:
      error =
        'Map type is having issues connecting to the server. Please try again later.'

      return (
        <div className="panel-resizer--error" data-testid="geoplot-error">
          {error}
        </div>
      )
    case MapErrorStates.InvalidCoordinates:
      error =
        'Map type is not supported with the data provided: Missing latitude/longitude values'

      return (
        <div className="panel-resizer--error" data-testid="geoplot-error">
          {error}
        </div>
      )
    default:
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
                lat: calculatedGeoCoordinates.lat,
                lon: calculatedGeoCoordinates.lon,
                zoom,
                allowPanAndZoom,
                detectCoordinateFields,
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
