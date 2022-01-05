import React from 'react'

import {HealthTask} from 'src/types'

type TaskHealthProps = {
  task: HealthTask
}

import {InfluxColors, Table} from '@influxdata/clockface'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {getOrg} from '../../organizations/selectors'

const TaskHealth = (props: TaskHealthProps) => {
  const history = useHistory()
  const org = useSelector(getOrg)

  const openTask = () => {
    history.push(`/orgs/${org.id}/tasks/${props.task.id}/runs`)
  }

  return (
    <>
      <Table.Row>
        <Table.Cell>
          <span
            onClick={openTask}
            style={{cursor: 'pointer', color: InfluxColors.Pool}}
          >
            {props.task.name}
          </span>
        </Table.Cell>
        <Table.Cell>{props.task.missingBuckets.join(', ')}</Table.Cell>
        <Table.Cell style={{color: 'red'}}>error</Table.Cell>
      </Table.Row>
    </>
  )
}

export default TaskHealth
