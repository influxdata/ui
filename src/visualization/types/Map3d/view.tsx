// Libraries
import React, {FC, useEffect, useState} from 'react'
import {Config, Plot} from '@influxdata/giraffe'

// Types
import {GeoViewProperties} from 'src/types'
import {VisualizationProps} from 'src/visualization'
// Utils
import {getGeoCoordinates} from 'src/shared/utils/vis'
import {event} from 'src/cloud/utils/reporting'
import {CLOUD} from 'src/shared/constants'

interface Props extends VisualizationProps {
  properties: GeoViewProperties
}

type GeoCoordinates = {
  lat: number
  lon: number
}

const osmTileServerConfiguration = {
  tileServerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
}

const GeoPlot3D: FC<Props> = ({result, properties}) => {
  const {layers, mapStyle} = properties
  const {lat, lon} = properties.center

  const [geoCoordinates, setGeoCoordinates] = useState<GeoCoordinates>({
    lat,
    lon,
  })

  useEffect(() => {
    try {
      if (CLOUD) {
        const coordinates = getGeoCoordinates(
          result.table,
          0,
          false,
          null,
          null
        )
        setGeoCoordinates(coordinates)
      }
      event('mapplot.get_geo_coordinates.success')
    } catch (err) {
      event('mapplot.get_geo_coordinates.failure')
    }
  }, [result.table])

  let layersOpts = layers
  if (!layers.length) {
    layersOpts = [
      {
        type: 'trackMap',
        colorDimension: {label: 'Value'},
        colorField: '_value',
        isClustered: false,
        tooltipColumns: [],
        speed: 0,
        trackWidth: 4,
        randomColors: true,
        endStopMarkers: true,
        endStopMarkerRadius: 4,
        colors: [
          {type: 'min', hex: '#ff0000'},
          {type: 'max', hex: '#343aeb'},
        ],
      },
    ]
  }

  let config: Config

  if (CLOUD) {
    config = {
      table: result.table,
      showAxes: false,
      layers: [
        {
          type: 'geo3D',
          lat: geoCoordinates.lat,
          lon: geoCoordinates.lon,
          hoverInteraction: false,
          dashTime: 30_000,
          dashWeight: 2,
          dashGap: 0.01,
          dashLength: 0.1,
          spinSpeed: 0.5,
          detectCoordinateFields: false,
          mapStyle,
          layers: layersOpts,

          tileServerConfiguration: osmTileServerConfiguration,
        },
      ],
    }
  }

  return <Plot config={config} />
}

export default GeoPlot3D
