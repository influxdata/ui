import React, {Component} from 'react'
// import {Plot} from '@influxdata/vis'

const DEFAULT_CONFIG = {
  axisColor: '#545667',
  gridColor: '#545667',
  gridOpacity: 0.5,
  legendFont: '12px Rubik',
  legendFontColor: '#8e91a1',
  legendFontBrightColor: '#c6cad3',
  legendBackgroundColor: '#181820',
  legendBorder: '1px solid #202028',
  legendCrosshairColor: '#434453',
  table: null,
  showAxes: true,
  yTickFormatter: x => x,
  layers: [],
}

const DEFAULT_LAYER = {
  type: 'line',
  x: '_time',
  y: '_value',
}

class SparkLineContents extends Component {
  render() {
    return (
      <div className="usage--plot">
        Hello world
        {/* <Plot config={this.getConfig()} /> */}
      </div>
    )
  }

  getConfig() {
    const {isGrouped, groupColumns, column, table, yFormatter} = this.props
    if (isGrouped && groupColumns) {
      const legendColumns = ['_time', column, ...groupColumns]

      return {
        ...DEFAULT_CONFIG,
        legendColumns,
        layers: [
          {
            ...DEFAULT_LAYER,
            y: column,
            fill: groupColumns,
          },
        ],
        yTickFormatter: yFormatter,
        table,
      }
    }

    return {
      ...DEFAULT_CONFIG,
      layers: [
        {
          ...DEFAULT_LAYER,
          y: column,
        },
      ],
      yTickFormatter: yFormatter,
      table,
    }
  }
}

export default SparkLineContents
