import React from 'react'

import {HealthTask} from 'src/types'
import TaskHealth from './TaskHealth'
import {EmptyState, EmptyStateText, RemoteDataState, SparkleSpinner, Table} from '@influxdata/clockface'

type TaskHealthProps = {
  tasks: HealthTask[]
}

const TasksHealth = (props: TaskHealthProps) => {
  const {tasks} = props
  return (
    <>
      {Object.values(tasks).every(item => item.healthy === true) ? (
        <EmptyState>
          <div style={{display: 'flex', justifyContent: 'center'}}><SparkleSpinner loading={RemoteDataState.Done}/></div>
          <EmptyStateText>No illegal references found!</EmptyStateText>
        </EmptyState>
      ) : (
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
      )}
    </>
  )
}

export default TasksHealth
