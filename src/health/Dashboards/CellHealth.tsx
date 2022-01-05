import React from 'react'

import {HealthDashboardCell} from 'src/types'

import {Table} from '@influxdata/clockface'

type CellHealthProps = {
  cell: HealthDashboardCell
}

const CellHealth = (props: CellHealthProps) => {
  return (
    <>
      <Table.Cell>{props.cell.name}</Table.Cell>
      <Table.Cell>{props.cell.missingBuckets.join(', ')}</Table.Cell>
      <Table.Cell style={{color: 'red'}}>error</Table.Cell>
    </>
  )
}

export default CellHealth
