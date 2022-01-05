import React from 'react'

import {HealthTask} from 'src/types'
import TaskHealth from './TaskHealth'
import {Table} from '@influxdata/clockface'

type TaskHealthProps = {
  tasks: HealthTask[]
}

const DashboardsHealth = (props: TaskHealthProps) => {
  const {tasks} = props
  return (
    <>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Task</Table.HeaderCell>
            <Table.HeaderCell>Bucket(s) Name</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        {tasks
          .filter(dashboard => !dashboard.healthy)
          .map((task, index) => (
            <Table.Body key={index}>
              <TaskHealth task={task} key={index} />
            </Table.Body>
          ))}
      </Table>
    </>
  )
}

export default DashboardsHealth
