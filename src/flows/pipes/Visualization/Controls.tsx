import React, {FC, useContext, useEffect} from 'react'
import {
  MultiSelectDropdown,
  ComponentColor,
  ComponentStatus,
  IconFont,
  SquareButton,
} from '@influxdata/clockface'
import {millisecondsToDuration} from 'src/shared/utils/duration'
import {SUPPORTED_VISUALIZATIONS, ViewTypeDropdown} from 'src/visualization'
import {ViewType} from 'src/types'
import {event} from 'src/cloud/utils/reporting'
import {FUNCTIONS} from 'src/timeMachine/constants/queryBuilder'

import {PipeContext} from 'src/flows/context/pipe'

interface Props {
  toggle: () => void
  visible: boolean
}

const Controls: FC<Props> = ({toggle, visible}) => {
  const {data, range, update, results} = useContext(PipeContext)

  const dataExists = results.parsed && Object.entries(results.parsed).length

  const configureButtonStatus = dataExists
    ? ComponentStatus.Default
    : ComponentStatus.Disabled

  const configureButtonTitleText = dataExists
    ? 'Configure Visualization'
    : 'No data to visualize yet'

  const updateType = (type: ViewType) => {
    event('notebook_change_visualization_type', {
      viewType: type,
    })

    update({
      properties: SUPPORTED_VISUALIZATIONS[type].initial,
    })
  }

  const selectFn = (fn: string) => {
    const fns = [...(data.functions || [{name: 'mean'}])]
    let found = false
    let fnIdx = fns.findIndex(f => f.name === fn)

    // NOTE: I had to kill it this way because i had poluted my local state
    while (fnIdx !== -1) {
      found = true
      fns.splice(fnIdx, 1)
      fnIdx = fns.findIndex(f => f.name === fn)
    }

    if (!found) {
      fns.push({name: fn})
    }

    update({
      functions: fns,
    })
  }

  useEffect(() => {
    update({
      period: millisecondsToDuration(range.windowPeriod),
    })
  }, [range])

  return (
    <>
      <MultiSelectDropdown
        emptyText="Select"
        style={{width: '250px'}}
        options={FUNCTIONS.map(f => f.name)}
        selectedOptions={(data.functions || [{name: 'mean'}]).map(
          fn => fn.name
        )}
        onSelect={selectFn}
        buttonColor={ComponentColor.Secondary}
        buttonIcon={IconFont.BarChart}
      />
      <ViewTypeDropdown
        viewType={data.properties.type}
        onUpdateType={updateType as any}
      />
      <SquareButton
        icon={IconFont.CogThick}
        onClick={toggle}
        status={configureButtonStatus}
        color={visible ? ComponentColor.Primary : ComponentColor.Default}
        titleText={configureButtonTitleText}
        className="flows-config-visualization-button"
      />
    </>
  )
}

export default Controls
