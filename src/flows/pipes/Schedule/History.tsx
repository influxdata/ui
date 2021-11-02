import React, {FC, useEffect, useState} from 'react'
import {
  getTask,
  patchTask,
  getTasksRuns,
  postTasksRun,
} from 'src/client/generatedRoutes'
import {
  EmptyState,
  Button,
  ComponentSize,
  ComponentColor,
  SlideToggle,
} from '@influxdata/clockface'
import {createDateTimeFormatter} from 'src/utils/datetime/formatters'

interface Props {
  task: any
}

const duration = (start: string, finish: string): string => {
  let timeTag = 'seconds'
  const _start = Date.parse(start)
  const _finish = Date.parse(finish)

  if (isNaN(_finish) || isNaN(_start)) {
    return ''
  }

  let diff = (_finish - _start) / 1000

  if (diff > 60) {
    diff = Math.round(diff / 60)
    timeTag = 'minutes'
  }

  return `${diff} ${timeTag}`
}

const History: FC<Props> = ({task}) => {
  const [runs, setRuns] = useState<any[]>([])
  const [status, setStatus] = useState<string>('inactive')
  const formatter = createDateTimeFormatter('YYYY-MM-DD HH:mm:ss')

  useEffect(() => {
    if (!task.id) {
      return
    }

    getTasksRuns({taskID: task.id}).then(resp => {
      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      setRuns(resp.data.runs)
    })
    getTask({taskID: task.id}).then(resp => {
      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }
      setStatus(resp.data.status)
    })
  }, [task.id])

  const toggleStatus = () => {
    const _status = status === 'active' ? 'inactive' : 'active'
    setStatus(_status)
    patchTask({
      taskID: task.id,
      data: {
        status: _status,
      },
    })
  }

  const run = () => {
    postTasksRun({
      taskID: task.id,
    }).then(resp => {
      if (resp.status !== 201) {
        throw new Error(resp.data.message)
      }
      setRuns([resp.data, ...runs])
    })
  }

  const _runs = runs.map(r => (
    <div className="run" key={`run-id==${r.id}`}>
      <div className={`run--row ${r.status}`}>
        <label>status</label>
        <span>{r.status}</span>
      </div>
      <div className="run--row">
        <label>started</label>
        <span>{formatter.format(new Date(r.scheduledFor))}</span>
      </div>
      <div className="run--row">
        <label>waited</label>
        <span>{duration(r.scheduledFor, r.startedAt)}</span>
      </div>
      <div className="run--row">
        <label>duration</label>
        <span>{duration(r.startedAt, r.finishedAt)}</span>
      </div>
      <div className="run--buttons">
        <Button
          key={`logs-${r.id}`}
          size={ComponentSize.ExtraSmall}
          color={ComponentColor.Default}
          text="View Logs"
          onClick={() => {}}
        />
      </div>
    </div>
  ))

  return (
    <div className={`flow-task-history ${status}`}>
      <h1>{task.name}</h1>
      <div className="interaction">
        <div className="toggle">
          <SlideToggle
            active={status === 'active'}
            size={ComponentSize.ExtraSmall}
            onChange={toggleStatus}
            testID="task-card--slide-toggle"
          />
          <label>{status}</label>
        </div>
        <Button
          size={ComponentSize.ExtraSmall}
          color={ComponentColor.Default}
          text="Run Manually"
          onClick={run}
        />
      </div>
      <div>
        {_runs.length ? (
          _runs
        ) : (
          <EmptyState size={ComponentSize.Large}>
            <EmptyState.Text>
              Looks like this Task doesn't have any <b>Runs</b>
            </EmptyState.Text>
          </EmptyState>
        )}
      </div>
    </div>
  )
}

export default History
