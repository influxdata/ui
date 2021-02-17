// Libraries
import React, {FC} from 'react'
import {Plot} from '@influxdata/giraffe'

// Types
import {GeoViewProperties} from 'src/types'
import {VisualizationProps} from 'src/visualization'

// Utils
import {getGeoCoordinates} from 'src/shared/utils/vis'

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

  let calculatedGeoCoordinates = {
    lat,
    lon,
  }
  try {
    calculatedGeoCoordinates = getGeoCoordinates(result.table, 0)
  } catch (err) {
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

export default GeoPlot
