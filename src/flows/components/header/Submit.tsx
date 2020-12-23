// Libraries
import React, {FC, MouseEvent, useContext, useEffect, useMemo} from 'react'
import {
  Dropdown,
  IconFont,
  ComponentColor,
  Gradients,
  SquareButton,
  List,
  ButtonGroup,
} from '@influxdata/clockface'

import {SubmitQueryButton} from 'src/timeMachine/components/SubmitQueryButton'
import {QueryContext} from 'src/flows/context/query'
import {RunModeContext, RunMode} from 'src/flows/context/runMode'
import {notify} from 'src/shared/actions/notifications'
import {FlowContext} from 'src/flows/context/flow.current'

// Utils
import {cancelAllRunningQueries} from 'src/timeMachine/actions/queries'
import {PIPE_DEFINITIONS} from 'src/flows'

// Styles
import 'src/flows/components/header/Submit.scss'

const fakeNotify = notify

export const Submit: FC = () => {
  const {flow} = useContext(FlowContext)
  const {runMode, setRunMode} = useContext(RunModeContext)
  const {isLoading, queryAll} = useContext(QueryContext)

  const _range = useMemo(
    () => `${flow.range.lower} to ${flow.range.upper || 'now'}`,
    [flow.range]
  )

  const hasQueries = useMemo(() => {
    return !!flow.data.all
      .filter(p => {
        // this condition ensures that empty metric selectors are filtered out
        if (p?.type === 'metricSelector') {
          return !!p?.bucket
        }
        return true
      })
      .map(p => PIPE_DEFINITIONS[p.type])
      .filter(p => p && (p.family === 'transform' || p.family === 'inputs'))
      .length
  }, [flow.data])

  useEffect(() => {
    if (hasQueries) {
      queryAll()
    }
  }, [_range, hasQueries]) // eslint-disable-line react-hooks/exhaustive-deps

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
          submitButtonDisabled={hasQueries === false}
          queryStatus={isLoading}
          onSubmit={queryAll}
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
