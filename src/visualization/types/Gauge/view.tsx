// Libraries
import React, {FC} from 'react'

// Components
import {Config, Plot} from '@influxdata/giraffe'
// Types
import {GaugeViewProperties} from 'src/types/dashboards'
import {VisualizationProps} from 'src/visualization'

import {
  GAUGE_ARC_LENGTH_DEFAULT,
  GAUGE_VALUE_POSITION_X_OFFSET_DEFAULT,
  GAUGE_VALUE_POSITION_Y_OFFSET_DEFAULT,
} from './constants'

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
        gaugeSize: GAUGE_ARC_LENGTH_DEFAULT,
        gaugeTheme: {
          valuePositionXOffset: GAUGE_VALUE_POSITION_X_OFFSET_DEFAULT,
          valuePositionYOffset: GAUGE_VALUE_POSITION_Y_OFFSET_DEFAULT,
        },
      },
    ],
  }
  return <Plot config={config} />
}

export default GaugeChart
