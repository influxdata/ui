// Libraries
import React, {FC, useEffect, useState} from 'react'
import {Config, Plot} from '@influxdata/giraffe'
import {RemoteDataState} from '@influxdata/clockface'
import {isEmpty} from 'lodash'

// Types
import {GeoViewProperties} from 'src/types'
import {VisualizationProps} from 'src/visualization'
// Utils
import {
  getDetectCoordinatingFields,
  getDetectCoordinatingFieldsFlagged,
  getGeoCoordinates,
  getGeoCoordinatesFlagged,
} from 'src/shared/utils/vis'
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {CLOUD} from 'src/shared/constants'

let getMapToken = null

if (CLOUD) {
  getMapToken = require('src/client/mapsdRoutes').getMapToken
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

  const isBehindFlag = isFlagEnabled('mapGeoOptions') && CLOUD

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
    if (CLOUD) {
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
  }, [])

  useEffect(() => {
    try {
      setCoordinateError(RemoteDataState.Loading)
      if (isBehindFlag) {
        const coordinates = getGeoCoordinatesFlagged(
          result.table,
          0,
          useS2CellID,
          s2Column,
          latLonColumns
        )
        const coordinateFlag = getDetectCoordinatingFieldsFlagged(
          result.table,
          useS2CellID,
          s2Column,
          latLonColumns
        )
        setCoordinateFlag(coordinateFlag)
        setGeoCoordinates(coordinates)
      } else {
        const coordinates = getGeoCoordinates(result.table, 0)
        const coordinateFlag = getDetectCoordinatingFields(result.table)
        setCoordinateFlag(coordinateFlag)
        setGeoCoordinates(coordinates)
      }
      setCoordinateError(RemoteDataState.Done)
      event('mapplot.get_geo_coordinates.success')
    } catch (err) {
      setCoordinateError(RemoteDataState.Error)
      event('mapplot.get_geo_coordinates.failure')
    }
  }, [useS2CellID, s2Column, latLonColumns, result.table, isBehindFlag])

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
    if (isBehindFlag) {
      error =
        'Map type is not supported with the data provided. Please use customization options to select correct fields to use for lat/lon'
    } else {
      error =
        'Map type is not supported with the data provided. Map type only supports latitude/longitude values (field values must be specified to either lat or lon)'
    }

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

  if (isBehindFlag) {
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
  } else {
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
          detectCoordinateFields: coordinateFieldsFlag,
          mapStyle,
          layers: layersOpts,
          tileServerConfiguration: tileServerConfiguration,
        },
      ],
    }
  }

  return <Plot config={config} />
}

export default GeoPlot
