import React from 'react'

import {HealthDashboard} from 'src/types'
import CellHealth from './CellHealth'
import {Table} from '@influxdata/clockface'

type DashboardHealthProps = {
  dashboard: HealthDashboard
}

const DashboardHealth = (props: DashboardHealthProps) => {
  const {dashboard} = props

  return (
    <>
      <Table.Header>
        <h4>{dashboard.name}</h4>
        <Table.Row>
          <Table.HeaderCell>Cells</Table.HeaderCell>
          <Table.HeaderCell>Bucket(s) Name</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {dashboard.cells
          .filter(cell => cell.missingBuckets.length > 0)
          .map((cell, index) => (
            <Table.Row key={index}>
              <CellHealth cell={cell} key={index} />
            </Table.Row>
          ))}
      </Table.Body>
    </>
  )
}

export default DashboardHealth
