import React, {FC, useContext, useCallback, useEffect, useMemo} from 'react'
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

const AVAILABLE_FUNCTIONS = FUNCTIONS.map(f => f.name)

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

  const options = useMemo(() => {
    if (!data.functions || !data.functions.length) {
      return []
    }
    return data.functions.map(f => f.name)
  }, [data.functions])

  const selectFn = useCallback(
    (fn: string) => {
      const fns = options.map(f => ({name: f}))
      let found = false
      let fnIdx = fns.findIndex(f => f.name === fn)

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
    },
    [options, update]
  )

  useEffect(() => {
    if (range.type === 'custom') {
      update({
        period: millisecondsToDuration(
          Math.round((Date.parse(range.upper) - Date.parse(range.lower)) / 360)
        ),
      })
    } else if (range.type === 'selectable-duration') {
      update({
        period: millisecondsToDuration(range.windowPeriod),
      })
    }
  }, [range, options])

  return (
    <>
      <MultiSelectDropdown
        emptyText="Select"
        style={{width: '250px'}}
        options={AVAILABLE_FUNCTIONS}
        selectedOptions={options}
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
