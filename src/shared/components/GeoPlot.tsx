// Libraries
import React, {FunctionComponent} from 'react'
import {Config, Table} from '@influxdata/giraffe'

// Types
import {GeoViewProperties} from 'src/types'

// Utils
import {getLatLon} from 'src/shared/utils/vis'

interface Props {
  children: (config: Config) => JSX.Element
  fluxGroupKeyUnion?: string[]
  table: Table
  viewProperties: GeoViewProperties
}

const GeoPlot: FunctionComponent<Props> = ({
  children,
  table,
  viewProperties,
}) => {
  const {
    layers,
    zoom,
    allowPanAndZoom,
    detectCoordinateFields,
    mapStyle,
  } = viewProperties
  const tileServerConfiguration = {
    tileServerUrl: '',
    bingKey: '',
  }

  const {lat, lon} = viewProperties.center

  if (!getLatLon(table, 0)) {
    const error =
      'Map type is not supported with the data provided: Missing latitude/longitude values'

    return (
      <div className="panel-resizer--error" data-testid="geoplot-error">
        {error}
      </div>
    )
  }

  const config: Config = {
    table,
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
  }
  return children(config)
}

export default GeoPlot
