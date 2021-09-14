import React, {FC, useContext, useCallback, useEffect, useMemo} from 'react'
import {
  MultiSelectDropdown,
  ComponentColor,
  ComponentStatus,
  IconFont,
  Button,
} from '@influxdata/clockface'
import {millisecondsToDuration} from 'src/shared/utils/duration'
import {
  SUPPORTED_VISUALIZATIONS,
  ViewTypeDropdown,
  ViewOptions,
} from 'src/visualization'
import {ViewType} from 'src/types'
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {FUNCTIONS} from 'src/timeMachine/constants/queryBuilder'

import {SidebarContext} from 'src/flows/context/sidebar'
import {PipeContext, PipeProvider} from 'src/flows/context/pipe'

const AVAILABLE_FUNCTIONS = FUNCTIONS.map(f => f.name)

interface Props {
  toggle: () => void
  visible: boolean
}

const WrappedViewOptions: FC = () => {
  const {data, update, results} = useContext(PipeContext)

  const updateProperties = useCallback(
    properties => {
      update({
        properties: {
          ...data.properties,
          ...properties,
        },
      })
    },
    [data.properties, update]
  )

  return (
    <ViewOptions
      properties={data.properties}
      results={results.parsed}
      update={updateProperties}
    />
  )
}

const Controls: FC<Props> = ({toggle, visible}) => {
  const {id, data, range, update, results} = useContext(PipeContext)
  const {hideSub, id: showId, show, showSub} = useContext(SidebarContext)

  const updateType = (type: ViewType) => {
    event('notebook_change_visualization_type', {
      viewType: type,
    })

    update({
      properties: SUPPORTED_VISUALIZATIONS[type].initial,
    })
  }

  const launcher = () => {
    if (id === showId) {
      hideSub()
    } else {
      show(id)
      showSub(
        <PipeProvider id={id}>
          <WrappedViewOptions />
        </PipeProvider>
      )
    }
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
    let period
    if (range.type === 'custom') {
      period = millisecondsToDuration(
        Math.round((Date.parse(range.upper) - Date.parse(range.lower)) / 360)
      )
    } else if (range.type === 'selectable-duration') {
      period = millisecondsToDuration(range.windowPeriod)
    }

    if (period && period !== data.period) {
      update({
        period,
      })
    }
  }, [range, update, data.period])

  const dataExists = results.parsed && Object.entries(results.parsed).length

  const toggler = (
    <Button
      text="Configure"
      icon={IconFont.CogThick}
      onClick={launcher}
      status={dataExists ? ComponentStatus.Default : ComponentStatus.Disabled}
      color={ComponentColor.Default}
      titleText={
        dataExists ? 'Configure Visualization' : 'No data to visualize yet'
      }
      className="flows-config-visualization-button"
    />
  )

  if (data.properties.type === 'simple-table') {
    return (
      <>
        <label style={{alignSelf: 'center', marginRight: '12px'}}>
          Limited to most recent 100 results per series
        </label>
        <ViewTypeDropdown
          viewType={data.properties.type}
          onUpdateType={updateType as any}
        />
        {toggler}
      </>
    )
  }

  if (
    data.properties.type === 'single-stat' ||
    data.properties.type === 'gauge'
  ) {
    return (
      <>
        <ViewTypeDropdown
          viewType={data.properties.type}
          onUpdateType={updateType as any}
        />
        {toggler}
      </>
    )
  }

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
      {toggler}
    </>
  )
}

export default Controls
