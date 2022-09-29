import React, {FC, useEffect, useState, useRef, useContext} from 'react'
import {
  getTask,
  patchTask,
  getTasksRuns,
  getTasksRun,
  postTasksRun,
  getTasksRunsLogs,
  Task,
  Run as RunType,
} from 'src/client/generatedRoutes'
import {
  EmptyState,
  Button,
  ComponentSize,
  ComponentColor,
  ComponentStatus,
  SlideToggle,
  IndexList,
  DapperScrollbars,
  Overlay,
} from '@influxdata/clockface'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import {createDateTimeFormatter} from 'src/utils/datetime/formatters'
import {PopupContext} from 'src/flows/context/popup'

import {event} from 'src/cloud/utils/reporting'

interface ListProps {
  tasks: Task[]
}

interface Props {
  task: Task
}

interface LogProps {
  taskID: string
  runID: string
}

interface RunProps {
  task: Task
  run: RunType
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

const RunLogs: FC<LogProps> = ({taskID, runID}) => {
  const {closeFn} = useContext(PopupContext)
  const [logs, setLogs] = useState<any[]>([])

  const formatter = createDateTimeFormatter('YYYY-MM-DD HH:mm:ss')

  useEffect(() => {
    getTasksRunsLogs({taskID, runID}).then(resp => {
      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      setLogs(resp.data.events)
    })
  }, [taskID, runID])

  const closer = () => {
    event('Task Run Log Overlay Closed')

    closeFn()
  }

  const _logs = logs.map((l, idx) => (
    <IndexList.Row key={`run-log--${idx}`} className="flow-task-run--log">
      <IndexList.Cell>
        <span className="time">{formatter.format(new Date(l.time))}</span>
      </IndexList.Cell>
      <IndexList.Cell>
        <span className="message">
          <pre>{l.message}</pre>
        </span>
      </IndexList.Cell>
    </IndexList.Row>
  ))

  return (
    <Overlay visible={true}>
      <Overlay.Container>
        <Overlay.Header title="Task Run Log" onDismiss={closer} />
        <Overlay.Body>
          <DapperScrollbars autoSizeHeight={true} style={{maxHeight: '700px'}}>
            <IndexList>
              <IndexList.Header>
                <IndexList.HeaderCell columnName="Time" width="auto" />
                <IndexList.HeaderCell columnName="Message" width="auto" />
              </IndexList.Header>
              <IndexList.Body emptyState={<></>} columnCount={2}>
                {_logs}
              </IndexList.Body>
            </IndexList>
          </DapperScrollbars>
        </Overlay.Body>
      </Overlay.Container>
    </Overlay>
  )
}

const UPDATE_INTERVAL = 3 * 1000

const Run: FC<RunProps> = ({task, run}) => {
  const {launch} = useContext(PopupContext)
  const timer = useRef<ReturnType<typeof setInterval>>()
  const [runOverride, setRunOverride] = useState<Partial<RunType>>({})
  const formatter = createDateTimeFormatter('YYYY-MM-DD HH:mm:ss')
  const viewLogs = () => {
    launch(<RunLogs taskID={task.id} runID={run.id} />, {})
  }
  const _run = {
    ...run,
    ...runOverride,
  }

  useEffect(() => {
    // no need to update as we are in a final state
    if (run.status === 'success' || run.status === 'failed') {
      return
    }

    // shouldnt happen, but lets not risk the memory leak
    if (timer.current) {
      return
    }

    timer.current = setInterval(() => {
      getTasksRun({
        taskID: task.id,
        runID: run.id,
      }).then(resp => {
        if (resp.status !== 200) {
          return
        }

        setRunOverride(resp.data)

        if (
          (resp.data.status === 'success' || resp.data.status === 'failed') &&
          timer.current
        ) {
          clearInterval(timer.current)
        }
      })
    }, UPDATE_INTERVAL)

    return () => {
      if (timer.current) {
        clearInterval(timer.current)
      }
    }
  }, [])

  const format = (date: string) => {
    try {
      return formatter.format(new Date(date))
    } catch {
      return null
    }
  }

  return (
    <div className="run">
      <div className={`run--row ${_run.status}`}>
        <label>status</label>
        <span>{_run.status}</span>
      </div>
      <div className="run--row">
        <label>started</label>
        <span>{format(_run.scheduledFor)}</span>
      </div>
      <div className="run--row">
        <label>waited</label>
        <span>{duration(_run.scheduledFor, _run.startedAt)}</span>
      </div>
      <div className="run--row">
        <label>duration</label>
        <span>{duration(_run.startedAt, _run.finishedAt)}</span>
      </div>
      <div className="run--buttons">
        <Button
          key={`logs-${run.id}`}
          size={ComponentSize.ExtraSmall}
          color={ComponentColor.Default}
          text="View Logs"
          onClick={viewLogs}
        />
      </div>
    </div>
  )
}

const History: FC<Props> = ({task}) => {
  const [runs, setRuns] = useState<any[]>([])
  const [status, setStatus] = useState<string>('inactive')

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
    <Run key={`run-id--${r.id}`} task={task} run={r} />
  ))
  let runsView

  if (_runs.length) {
    runsView = _runs
  } else if (status === 'active') {
    runsView = (
      <EmptyState size={ComponentSize.Large}>
        <EmptyState.Text>
          Looks like this Task doesn't have any <b>Runs</b>
        </EmptyState.Text>
      </EmptyState>
    )
  }

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
          status={
            status === 'inactive'
              ? ComponentStatus.Disabled
              : ComponentStatus.Default
          }
          text="Run Manually"
          onClick={run}
        />
      </div>
      <div>{runsView}</div>
    </div>
  )
}

const WrappedHistory: FC<ListProps> = ({tasks}) => (
  <ErrorBoundary>
    {tasks.map(task => (
      <History key={task.id} task={task} />
    ))}
  </ErrorBoundary>
)
export default WrappedHistory
