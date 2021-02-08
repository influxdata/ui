// Libraries
import React, {FC, useContext, useCallback} from 'react'

// Components
import {Dropdown, IconFont, Icon} from '@influxdata/clockface'

// Contexts
import {PipeContext} from 'src/flows/context/pipe'
import {FlowContext} from 'src/flows/context/flow.current'
import {QueryContext} from 'src/flows/context/query'

// Constants
import {FUNCTIONS, QueryFn} from 'src/timeMachine/constants/queryBuilder'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {millisecondsToDuration} from 'src/shared/utils/duration'
const AggregateFunctionSelector: FC = () => {
  const {flow} = useContext(FlowContext)
  const {data, update} = useContext(PipeContext)
  const {queryAll} = useContext(QueryContext)

  const selectedFunction = data?.aggregateFunction || FUNCTIONS[0]

  const windowPeriod = flow?.range?.windowPeriod
  let windowPeriodText = ''
  if (windowPeriod) {
    windowPeriodText = ` (${millisecondsToDuration(windowPeriod)})`
  }

  const updateSelectedFunction = useCallback(
    (aggregateFunction: QueryFn): void => {
      event(`metric_selector_change_aggregate`, {
        function: aggregateFunction.name,
      })
      update({aggregateFunction})
      queryAll()
    },
    [update, queryAll]
  )

  const menuItems = (
    <>
      <div className="data-source--agg-info">
        <p>
          {`The window period ${windowPeriodText} is determined by`}
          <br />
          <Icon glyph={IconFont.Clock} />
          <strong>Time Range</strong>
        </p>
      </div>
      <Dropdown.Divider />
      {FUNCTIONS.map(func => (
        <Dropdown.Item
          key={func.name}
          value={func}
          onClick={updateSelectedFunction}
          selected={func.name === selectedFunction.name}
          title={func.name}
          wrapText={true}
        >
          {func.name}
        </Dropdown.Item>
      ))}
    </>
  )

  const button = (active, onClick) => (
    <Dropdown.Button
      onClick={onClick}
      active={active}
      icon={IconFont.FunnelSolid}
    >
      {`${selectedFunction.name}${windowPeriodText}`}
    </Dropdown.Button>
  )

  const menu = onCollapse => (
    <Dropdown.Menu onCollapse={onCollapse}>{menuItems}</Dropdown.Menu>
  )

  return (
    <Dropdown
      className="data-source--aggregate"
      button={button}
      menu={menu}
      style={{width: '180px', flex: '0 0 180px'}}
    />
  )
}

export default AggregateFunctionSelector
