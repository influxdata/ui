import React, {FC, useContext, useCallback, useEffect} from 'react'
import {
  ComponentColor,
  ComponentStatus,
  IconFont,
  DapperScrollbars,
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
import ErrorThresholds from 'src/flows/pipes/Visualization/ErrorThresholds/ErrorThresholds'
import {SidebarContext} from 'src/flows/context/sidebar'
import {PipeContext, PipeProvider} from 'src/flows/context/pipe'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

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
    <DapperScrollbars>
      <ErrorBoundary>
        <ErrorThresholds />
        <ViewOptions
          properties={data.properties}
          results={results.parsed}
          update={updateProperties}
        />
      </ErrorBoundary>
    </DapperScrollbars>
  )
}

const Controls: FC = () => {
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
      text="Customize"
      icon={IconFont.CogSolid_New}
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
        <label
          style={{alignSelf: 'center', marginRight: '12px', minWidth: '150px'}}
        >
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

export default Controls
