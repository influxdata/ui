// Libraries
import React, {FunctionComponent} from 'react'
import {Config, Table} from '@influxdata/giraffe'

// Types
import {GaugeViewProperties, Theme} from 'src/types'

interface Props {
  table: Table
  viewProperties: GaugeViewProperties
  children: (config: Config) => JSX.Element
  theme?: Theme
}

const GaugePlot: FunctionComponent<Props> = ({
  table,
  viewProperties: {
    colors,
    prefix,
    suffix,
    tickPrefix,
    tickSuffix,
    decimalPlaces,
  },
  children,
}) => {
  const config: Config = {
    table,
    layers: [
      {
        type: 'gauge',
        prefix: prefix,
        suffix: suffix,
        tickPrefix: tickPrefix,
        tickSuffix: tickSuffix,
        decimalPlaces: decimalPlaces,
        gaugeColors: colors,
      },
    ],
  }

  return children(config)
}

export default GaugePlot
