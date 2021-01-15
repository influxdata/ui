import React, {FC} from 'react'
import {Plot, Table, ColumnType, Config} from '@influxdata/giraffe'
import { MosaicLayerConfig } from '@influxdata/giraffe/dist/types'

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

interface OwnProps {
  isGrouped: boolean
  groupColumns: boolean
  column: ColumnType
  table: Table
  yFormatter: Function
}

const SparkLineContents: FC<OwnProps> = ({
  isGrouped,
  groupColumns,
  column,
  table,
  yFormatter,
}) => {
  return (
    <div className="usage--plot">
      <Plot config={getConfig(isGrouped, groupColumns, column, table, yFormatter)} />
    </div>
  )
}

const getConfig = (isGrouped, groupColumns, column, table, yFormatter): Config => {
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
        } as MosaicLayerConfig,
      ],
      // yTickFormatter: yFormatter,
      table,
    }
  }

  return {
    ...DEFAULT_CONFIG,
    layers: [
      {
        ...DEFAULT_LAYER,
        y: column,
      } as MosaicLayerConfig,
    ],
    // yTickFormatter: yFormatter,
    table,
  }
}

export default SparkLineContents
