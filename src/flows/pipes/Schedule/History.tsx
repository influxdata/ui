import React, {FC, useEffect, useState, useContext} from 'react'
import {
  getTask,
  patchTask,
  getTasksRuns,
  postTasksRun,
  getTasksRunsLogs,
} from 'src/client/generatedRoutes'
import {
  EmptyState,
  Button,
  ComponentSize,
  ComponentColor,
  SlideToggle,
  IndexList,
  DapperScrollbars,
  Overlay,
} from '@influxdata/clockface'
import {createDateTimeFormatter} from 'src/utils/datetime/formatters'
import {PopupContext} from 'src/flows/context/popup'

import {event} from 'src/cloud/utils/reporting'

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
                <IndexList.HeaderCell columnName="Time" />
                <IndexList.HeaderCell columnName="Message" />
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

const History: FC<Props> = ({task}) => {
  const [runs, setRuns] = useState<any[]>([])
  const [status, setStatus] = useState<string>('inactive')
  const {launch} = useContext(PopupContext)

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

  const viewLogs = (taskID, runID) => {
    launch(<RunLogs taskID={taskID} runID={runID} />)
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
          onClick={() => viewLogs(task.id, r.id)}
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
