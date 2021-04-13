// Libraries
import React, {FC, useContext} from 'react'

// Components
import {Config, Plot} from '@influxdata/giraffe'
// Types
import {GaugeViewProperties} from 'src/types/dashboards'
import {VisualizationProps} from 'src/visualization'
import {isFlagEnabled} from '../../../shared/utils/featureFlag'

// delete after testing
import {AutoSizer} from 'react-virtualized'
import {GAUGE_THEME_LIGHT, GAUGE_THEME_DARK} from './constants'
import {AppSettingContext} from 'src/shared/contexts/app'
import Gauge from './Gauge'
import LatestValueTransform from 'src/visualization/components/LatestValueTransform'

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

  // delete after testing code
  const {theme} = useContext(AppSettingContext)
  const currentTheme = theme === 'light' ? GAUGE_THEME_LIGHT : GAUGE_THEME_DARK

  if (isFlagEnabled('useGiraffeGraphs')) {
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
  return (
    <LatestValueTransform table={result.table} allowString={false}>
      {latestValue => (
        <AutoSizer>
          {({width, height}) => (
            <div className="gauge">
              <Gauge
                width={width}
                height={height}
                colors={colors}
                prefix={prefix}
                tickPrefix={tickPrefix}
                suffix={suffix}
                tickSuffix={tickSuffix}
                gaugePosition={latestValue}
                decimalPlaces={decimalPlaces}
                theme={currentTheme}
              />
            </div>
          )}
        </AutoSizer>
      )}
    </LatestValueTransform>
  )
}

export default GaugeChart
