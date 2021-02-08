// Libraries
import React, {FC} from 'react'
import {Plot} from '@influxdata/giraffe'

// Types
import {GeoViewProperties} from 'src/types'
import {VisualizationProps} from 'src/visualization'

// Utils
import {getLatLon} from 'src/shared/utils/vis'

interface Props extends VisualizationProps {
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

  if (!getLatLon(result.table, 0)) {
    const error =
      'Map type is not supported with the data provided: Missing latitude/longitude values'

    return (
      <div className="panel-resizer--error" data-testid="geoplot-error">
        {error}
      </div>
    )
  }

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
