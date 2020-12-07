// Libraries
import React, {
  FC,
  MouseEvent,
  useMemo,
  useContext,
  useState,
  useEffect,
} from 'react'
import {
  Dropdown,
  IconFont,
  ComponentColor,
  Gradients,
  SquareButton,
  List,
  ButtonGroup,
} from '@influxdata/clockface'
import {useDispatch} from 'react-redux'

import {SubmitQueryButton} from 'src/timeMachine/components/SubmitQueryButton'
import {QueryContext} from 'src/flows/context/query'
import {FlowContext} from 'src/flows/context/flow.current'
import {RunModeContext, RunMode} from 'src/flows/context/runMode'
import {ResultsContext} from 'src/flows/context/results'
import {notify} from 'src/shared/actions/notifications'
import {PIPE_DEFINITIONS} from 'src/flows'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {cancelAllRunningQueries} from 'src/timeMachine/actions/queries'

// Constants
import {
  notebookRunSuccess,
  notebookRunFail,
} from 'src/shared/copy/notifications'
import {PROJECT_NAME} from 'src/flows'

// Types
import {RemoteDataState} from 'src/types'

// Styles
import 'src/flows/components/header/Submit.scss'

const fakeNotify = notify

export const Submit: FC = () => {
  const dispatch = useDispatch()
  const {query, generateMap} = useContext(QueryContext)
  const {runMode, setRunMode} = useContext(RunModeContext)
  const {flow} = useContext(FlowContext)
  const {add, update} = useContext(ResultsContext)
  const [isLoading, setLoading] = useState(RemoteDataState.NotStarted)

  const hasQueries = useMemo(() => {
    return !!flow.data.all
      .map(p => PIPE_DEFINITIONS[p.type])
      .filter(p => p && (p.family === 'transform' || p.family === 'inputs'))
      .length
  }, [flow.data])

  // Returns a string to avoid array deep comparison woes
  // Triggers a re-run any time any aggregate function is changed
  const aggregateOfAggregates = useMemo(() => {
    return flow.data.all
      .map(p => p.aggregateFunction?.name)
      .filter(p => !!p)
      .join('')
  }, [flow.data])

  useEffect(() => {
    if (hasQueries) {
      submit()
    }
  }, [flow.range, hasQueries, aggregateOfAggregates]) // eslint-disable-line react-hooks/exhaustive-deps

  const forceUpdate = (id, data) => {
    try {
      update(id, data)
    } catch (_e) {
      add(id, data)
    }
  }

  const submit = () => {
    const map = generateMap(runMode === RunMode.Run)

    if (!map.length) {
      return
    }

    event('Flow Submit Button Clicked')
    setLoading(RemoteDataState.Loading)

    flow.data.allIDs.forEach(pipeID => {
      flow.meta.update(pipeID, {loading: RemoteDataState.Loading})
    })

    Promise.all(
      map.map(stage => {
        return query(stage.text)
          .then(response => {
            stage.instances.forEach(pipeID => {
              forceUpdate(pipeID, response)
              flow.meta.update(pipeID, {loading: RemoteDataState.Done})
            })
          })
          .catch(e => {
            stage.instances.forEach(pipeID => {
              forceUpdate(pipeID, {
                error: e.message,
              })
              flow.meta.update(pipeID, {loading: RemoteDataState.Error})
            })
          })
      })
    )
      .then(() => {
        event('run_notebook_success', {runMode})
        dispatch(notify(notebookRunSuccess(runMode, PROJECT_NAME)))

        setLoading(RemoteDataState.Done)
      })
      .catch(e => {
        event('run_notebook_fail', {runMode})
        dispatch(notify(notebookRunFail(runMode, PROJECT_NAME)))

        // NOTE: this shouldn't fire, but lets wrap it for completeness
        setLoading(RemoteDataState.Error)
        throw e
      })
  }

  const DropdownButton = (
    active: boolean,
    onClick: (e: MouseEvent<HTMLButtonElement>) => void
  ) => {
    return (
      <ButtonGroup>
        <SubmitQueryButton
          text={runMode}
          className="flows--submit-button"
          icon={IconFont.Play}
          submitButtonDisabled={!hasQueries}
          queryStatus={isLoading}
          onSubmit={submit}
          onNotify={fakeNotify}
          queryID=""
          cancelAllRunningQueries={cancelAllRunningQueries}
        />
        <SquareButton
          active={active}
          onClick={onClick}
          icon={IconFont.CaretDown}
          color={ComponentColor.Primary}
        />
      </ButtonGroup>
    )
  }

  const DropdownMenu = (onCollapse: () => void) => (
    <Dropdown.Menu onCollapse={onCollapse}>
      <List.Item
        key="Preview"
        value="Preview"
        onClick={() => setRunMode(RunMode.Preview)}
        className="submit-btn--item"
        testID="flow-preview-button"
        selected={runMode === RunMode.Preview}
        gradient={Gradients.PolarExpress}
      >
        <div className="submit-btn--item-details">
          <span className="submit-btn--item-name">Preview</span>
          <span className="submit-btn--item-desc">
            See results of each cell, no data will be written
          </span>
        </div>
      </List.Item>
      <List.Item
        key="Run"
        value="Run"
        onClick={() => setRunMode(RunMode.Run)}
        className="submit-btn--item"
        testID="flow-run-button"
        selected={runMode === RunMode.Run}
        gradient={Gradients.PolarExpress}
      >
        <div className="submit-btn--item-details">
          <span className="submit-btn--item-name">Run</span>
          <span className="submit-btn--item-desc">
            See results of each cell, outputs will write data to buckets
          </span>
        </div>
      </List.Item>
    </Dropdown.Menu>
  )

  return (
    <Dropdown
      button={DropdownButton}
      menu={DropdownMenu}
      style={{width: '205px'}}
    />
  )
}

export default Submit
