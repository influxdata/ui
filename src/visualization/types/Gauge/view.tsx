// Libraries
import React, {PureComponent} from 'react'
import {AutoSizer} from 'react-virtualized'

// Components
import Gauge from './Gauge'
import LatestValueTransform from 'src/visualization/components/LatestValueTransform'

// Types
import {GaugeViewProperties} from 'src/types/dashboards'
import {VisualizationProps} from 'src/visualization'

// Constants
import {GAUGE_THEME_LIGHT, GAUGE_THEME_DARK} from './constants'

import {ErrorHandling} from 'src/shared/decorators/errors'

interface Props extends VisualizationProps {
  properties: GaugeViewProperties
}

@ErrorHandling
class GaugeChart extends PureComponent<Props> {
  public render() {
    const {result, theme} = this.props
    const {
      colors,
      prefix,
      tickPrefix,
      suffix,
      tickSuffix,
      decimalPlaces,
    } = this.props.properties

    const currentTheme =
      theme === 'light' ? GAUGE_THEME_LIGHT : GAUGE_THEME_DARK

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
}

export default GaugeChart
