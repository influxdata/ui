import React, {Component} from 'react'

import {Panel, ComponentSize, InfluxColors} from '@influxdata/clockface'
import SparkLineContents from 'src/usage/SparkLineContents'

class SparkLine extends Component {
  render() {
    const {table, title, status, column, groupColumns, isGrouped} = this.props

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
            yFormatter={this.formatYValue}
            status={status}
            isGrouped={isGrouped}
          />
        </Panel.Body>
      </Panel>
    )
  }

  formatYValue = value => {
    return `${value} ${this.props.units}`
  }
}

export default SparkLine
