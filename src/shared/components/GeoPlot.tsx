// Libraries
import {FunctionComponent} from 'react'
import {Config, Table} from '@influxdata/giraffe'

// Types
import {GeoViewProperties} from 'src/types'
import {getLatLon} from '../utils/vis'

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
    tileServerUrl: 'someurlhere',
    bingKey: '',
  }

  const {lat, lon} = getLatLon(table, 0)

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
