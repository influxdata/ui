import React from 'react'

import {HealthNotebookFlow} from 'src/types'

import {Table} from '@influxdata/clockface'

type FlowHealthProps = {
  flow: HealthNotebookFlow
}

const FlowHealth = (props: FlowHealthProps) => {
  return (
    <>
      <Table.Cell>{props.flow.title}</Table.Cell>
      <Table.Cell>{props.flow.missingBuckets.join(', ')}</Table.Cell>
      <Table.Cell style={{color: 'red'}}>error</Table.Cell>
    </>
  )
}

export default FlowHealth
