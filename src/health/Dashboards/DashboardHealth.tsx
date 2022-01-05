import React from 'react'

import {Dashboard as GenDashboard} from 'src/client'
import CellHealth from './CellHealth'

type DashboardHealthProps = {
  dashboard: GenDashboard
}

import {Table} from '@influxdata/clockface'

const DashboardHealth = (props: DashboardHealthProps) => {
  const {dashboard} = props

  return (
    <>
      <Table.Header>
        <h4>{dashboard.name}</h4>
        <Table.Row>
          <Table.HeaderCell>
            <>Cells</>
          </Table.HeaderCell>
          <Table.HeaderCell>
            <>Bucket(s) Name</>
          </Table.HeaderCell>
          <Table.HeaderCell>
            <>Status</>
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {dashboard.cells.map((cell, index) => (
          <Table.Row key={index}>
            <CellHealth cell={cell} key={index} />
          </Table.Row>
        ))}
      </Table.Body>
    </>
  )
}

export default DashboardHealth
