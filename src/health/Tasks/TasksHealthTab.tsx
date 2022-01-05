import TasksHealth from './TasksHealth'
import {EmptyState, EmptyStateText, RemoteDataState, SparkleSpinner} from '@influxdata/clockface'
import React, {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {getOrg} from '../../organizations/selectors'
import * as api from '../../client'
import {Task as GenTask} from '../../client'
import {parseASTIM} from '../../buckets/utils/astim'

const TasksHealthTab = () => {
  const [tasks, setTasks] = useState([])
  const [tasksLoaded, setTasksLoaded] = useState(false)

  const org = useSelector(getOrg)

  useEffect(() => {
    // get all buckets
    api
      .getBuckets({
        query: {
          orgID: org.id,
        },
      })
      .then(result => {
        const buckets = result.data['buckets'].reduce((o, bucket) => ({
          ...o,
          [bucket.name]: true,
        }))

        // get all dashboards
        api
          .getTasks({
            query: {
              orgID: org.id,
            },
          })
          .then(result => {
            console.log(result)
            parseTasks(buckets, result.data['tasks'])
            setTasksLoaded(true)
          })
      })
  }, [org.id])

  const parseTasks = (buckets: {}, tasks: GenTask[]) => {
    const results = []
    for (const task of tasks) {
      const taskDetails = {
        name: task.name,
        query: task.flux,
        missingBuckets: [],
        healthy: true,
      }

      const query = task.flux as any

      const {bucketNames: names} = parseASTIM(query)
      const missingBucketsInQuery = names.filter(
        name => buckets[name] === undefined
      )
      const uniqueMissingBuckets = [...new Set(missingBucketsInQuery)]

      taskDetails.healthy =
        taskDetails.healthy && uniqueMissingBuckets.length === 0

      taskDetails.missingBuckets = uniqueMissingBuckets

      results.push(taskDetails)
    }
    setTasks(results)
  }

  return (
    <>
      {tasks.length > 0 ? <TasksHealth tasks={tasks} /> : null}
      {!tasksLoaded ?
        <EmptyState>
          <div style={{display: 'flex', justifyContent: 'center'}}><SparkleSpinner loading={RemoteDataState.Loading}/></div>
          <EmptyStateText>Analyzing ... </EmptyStateText>
        </EmptyState> : null}
    </>
  )
}

export default TasksHealthTab
