// Libraries
import React, {FC} from 'react'
import {Plot} from '@influxdata/giraffe'

// Types
import {GeoViewProperties} from 'src/types'
import {VisProps} from 'src/visualization'

interface Props extends VisProps {
  properties: GeoViewProperties
}

const GeoPlot: FC<Props> = ({result, properties}) => {
  const {
    layers,
    zoom,
    allowPanAndZoom,
    detectCoordinateFields,
    mapStyle,
  } = properties
  const tileServerConfiguration = {
    tileServerUrl: '',
    bingKey: '',
  }

  const {lat, lon} = properties.center

  return (
    <Plot
      config={{
        table: result.table,
        showAxes: false,
        layers: [
          {
            type: 'geo',
            lat,
            lon,
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

export default GeoPlot
