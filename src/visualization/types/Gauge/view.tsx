// Libraries
import React, {FC, useContext} from 'react'

// Components
import {Config, Plot} from '@influxdata/giraffe'
import {latestValues as getLatestValues} from '../../../shared/utils/latestValues'
// Types
import {GaugeViewProperties} from 'src/types/dashboards'
import {VisualizationProps} from 'src/visualization'

// Constants
import {GAUGE_THEME_LIGHT, GAUGE_THEME_DARK} from './constants'
import {AppSettingContext} from 'src/shared/contexts/app'

interface Props extends VisualizationProps {
  properties: GaugeViewProperties
}

const GaugeChart: FC<Props> = ({result, properties}) => {
  const {theme} = useContext(AppSettingContext)
  const {
    colors,
    prefix,
    tickPrefix,
    suffix,
    tickSuffix,
    decimalPlaces,
  } = properties

  const currentTheme = theme === 'light' ? GAUGE_THEME_LIGHT : GAUGE_THEME_DARK

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
