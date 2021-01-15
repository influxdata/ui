import React, {FC} from 'react'

import {Panel, ComponentSize, InfluxColors} from '@influxdata/clockface'
import SparkLineContents from 'src/usage/SparkLineContents'
import {ColumnType, Table} from '@influxdata/giraffe'

interface OwnProps {
  table: Table
  title: string
  status: string
  column: ColumnType
  groupColumns: boolean
  isGrouped: boolean
  units: string
}

const SparkLine: FC<OwnProps> = ({
  table,
  title,
  status,
  column,
  groupColumns,
  isGrouped,
  units
}) => {
  return (
    <Panel backgroundColor={InfluxColors.Onyx}>
      <Panel.Header size={ComponentSize.ExtraSmall}>
        <h5>{title}</h5>
      </Panel.Header>
      <Panel.Body size={ComponentSize.ExtraSmall}>
        <SparkLineContents
          table={table}
          column={column}
          groupColumns={groupColumns}
          yFormatter={(value) => formatYValue(value, units)}
          status={status}
          isGrouped={isGrouped}
        />
      </Panel.Body>
    </Panel>
  )
}

const formatYValue = (value, units) => {
  return `${value} ${units}`
}

export default SparkLine
