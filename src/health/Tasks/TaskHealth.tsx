import React from 'react'

import {HealthTask} from 'src/types'

type TaskHealthProps = {
  task: HealthTask
}

import {Table} from '@influxdata/clockface'

const TaskHealth = (props: TaskHealthProps) => {
  return (
    <>
      <Table.Row>
        <Table.Cell>{props.task.name}</Table.Cell>
        <Table.Cell>{props.task.missingBuckets.join(', ')}</Table.Cell>
        <Table.Cell style={{color: 'red'}}>error</Table.Cell>
      </Table.Row>
    </>
  )
}

export default TaskHealth
