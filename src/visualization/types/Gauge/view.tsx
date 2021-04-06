// Libraries
import React, {FC, useContext} from 'react'
import {AutoSizer} from 'react-virtualized'

// Components
import Gauge from './Gauge'
import LatestValueTransform from 'src/visualization/components/LatestValueTransform'

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
