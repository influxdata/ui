// Libraries
import React, {FC, useContext, useCallback, useMemo, useState} from 'react'

// Components
import {
  ComponentColor,
  ComponentStatus,
  IconFont,
  SquareButton,
} from '@influxdata/clockface'
import ExportButton from 'src/flows/pipes/Visualization/ExportDashboardButton'
import Resizer from 'src/flows/shared/Resizer'

// Utilities
import {event} from 'src/cloud/utils/reporting'
import {
  SUPPORTED_VISUALIZATIONS,
  View,
  ViewOptions,
  ViewTypeDropdown,
} from 'src/visualization'

// Types
import {ViewType, RemoteDataState} from 'src/types'
import {PipeProp} from 'src/types/flows'

// NOTE we dont want any pipe component to be directly dependent
// to any flow concepts as this'll limit future reusability
// but timezone seems like an app setting, and its existance within
// the flow folder is purely a convenience
import {AppSettingContext} from 'src/flows/context/app'
import {PipeContext} from 'src/flows/context/pipe'

const Visualization: FC<PipeProp> = ({Context}) => {
  const {timeZone} = useContext(AppSettingContext)
  const {data, range, update, loading, results} = useContext(PipeContext)
  const [optionsVisibility, setOptionsVisibility] = useState(false)
  const toggleOptions = useCallback(() => {
    setOptionsVisibility(!optionsVisibility)
  }, [optionsVisibility, setOptionsVisibility])

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

  const updateType = (type: ViewType) => {
    event('notebook_change_visualization_type', {
      viewType: type,
    })

    update({
      properties: SUPPORTED_VISUALIZATIONS[type].initial,
    })
  }

  const dataExists = results.parsed && Object.entries(results.parsed).length
  const configureButtonStatus = dataExists
    ? ComponentStatus.Default
    : ComponentStatus.Disabled
  const configureButtonTitleText = dataExists
    ? 'Configure Visualization'
    : 'No data to visualize yet'

  const controls = (
    <>
      <ViewTypeDropdown
        viewType={data.properties.type}
        onUpdateType={updateType as any}
      />
      <SquareButton
        icon={IconFont.CogThick}
        onClick={toggleOptions}
        status={configureButtonStatus}
        color={
          optionsVisibility ? ComponentColor.Primary : ComponentColor.Default
        }
        titleText={configureButtonTitleText}
        className="flows-config-visualization-button"
      />
    </>
  )

  const loadingText = useMemo(() => {
    if (loading === RemoteDataState.Loading) {
      return 'Loading'
    }

    if (loading === RemoteDataState.NotStarted) {
      return 'This cell will display results from the previous cell'
    }

    return 'No Data Returned'
  }, [loading])

  return (
    <Context controls={controls} persistentControl={<ExportButton />}>
      <Resizer
        loading={loading}
        resizingEnabled={!!results.raw}
        minimumHeight={200}
        emptyText={loadingText}
        emptyIcon={IconFont.BarChart}
        toggleVisibilityEnabled={false}
        height={data.panelHeight}
        onUpdateHeight={panelHeight => update({panelHeight})}
        visibility={data.panelVisibility}
        onUpdateVisibility={panelVisibility => update({panelVisibility})}
      >
        <div className="flow-visualization">
          <div className="flow-visualization--view">
            <View
              loading={loading}
              error={results?.error}
              properties={data.properties}
              result={results.parsed}
              timeRange={range}
              timeZone={timeZone}
            />
          </div>
        </div>
      </Resizer>
      {optionsVisibility && dataExists && (
        <ViewOptions
          properties={data.properties}
          results={results.parsed}
          update={updateProperties}
        />
      )}
    </Context>
  )
}

export default Visualization
