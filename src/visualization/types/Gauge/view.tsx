// Libraries
import React, {FC} from 'react'

// Components
import {Config, Plot} from '@influxdata/giraffe'
// Types
import {GaugeViewProperties} from 'src/types/dashboards'
import {VisualizationProps} from 'src/visualization'

interface Props extends VisualizationProps {
  properties: GaugeViewProperties
}

const GaugeChart: FC<Props> = ({result, properties}) => {
  const {
    colors,
    prefix,
    tickPrefix,
    suffix,
    tickSuffix,
    decimalPlaces,
  } = properties

  const config: Config = {
    table: result.table,
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
  return <Plot config={config} />
}

export default GaugeChart
