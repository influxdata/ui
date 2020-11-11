// Libraries
import React, {
  FC,
  createElement,
  useContext,
  useCallback,
  useMemo,
  useState,
} from 'react'

// Components
import {ComponentColor, IconFont, SquareButton} from '@influxdata/clockface'
import ExportButton from 'src/flows/components/panel/ExportDashboardButton'
import EmptyQueryView, {ErrorFormat} from 'src/shared/components/EmptyQueryView'
import DashboardList from './DashboardList'
import ViewSwitcher from 'src/shared/components/ViewSwitcher'
import ViewTypeDropdown from 'src/shared/visualization/ViewTypeDropdown'
import Resizer from 'src/flows/shared/Resizer'

// Utilities
import {checkResultsLength} from 'src/shared/utils/vis'
import ExportVisualizationButton from 'src/flows/pipes/Visualization/ExportVisualizationButton'
import {event} from 'src/cloud/utils/reporting'
import {TYPE_DEFINITIONS, _transform} from 'src/shared/visualization'

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
  const {data, update, loading, results} = useContext(PipeContext)
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
    event('Flow Visualization Type Changed', {
      type,
    })

    update({
      properties: _transform(TYPE_DEFINITIONS[type].initial, results.parsed),
    })
  }

  const controls = (
    <>
      <ViewTypeDropdown
        viewType={data.properties.type}
        onUpdateType={updateType as any}
      />
      <SquareButton
        icon={IconFont.CogThick}
        onClick={toggleOptions}
        color={
          optionsVisibility ? ComponentColor.Primary : ComponentColor.Default
        }
        titleText="Configure Visualization"
        className="flows-config-visualization-button"
      />
      <ExportVisualizationButton disabled={!results.source}>
        {onHidePopover => (
          <DashboardList
            query={results.source}
            onClose={onHidePopover}
            properties={data.properties}
          />
        )}
      </ExportVisualizationButton>
    </>
  )

  const options = useMemo(() => {
    if (!optionsVisibility || !TYPE_DEFINITIONS[data.properties.type].options) {
      return null
    }
    return createElement(TYPE_DEFINITIONS[data.properties.type].options, {
      properties: data.properties,
      results: results.parsed,
      update: updateProperties,
    })
  }, [optionsVisibility, data.properties, results.parsed, updateProperties])

  const loadingText = useMemo(() => {
    if (loading === RemoteDataState.Loading) {
      return 'Loading'
    }

    if (loading === RemoteDataState.NotStarted) {
      return 'This cell will visualize results from the previous cell'
    }

    return 'No Data Returned'
  }, [loading])

  return (
    <Context controls={controls} persistentControl={<ExportButton />}>
      {options}
      <Resizer
        resizingEnabled={!!results.raw}
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
            <EmptyQueryView
              loading={loading}
              errorMessage={results.error}
              errorFormat={ErrorFormat.Scroll}
              hasResults={checkResultsLength(results.parsed)}
            >
              <ViewSwitcher
                giraffeResult={results.parsed}
                files={[results.raw]}
                properties={data.properties}
                timeZone={timeZone}
                theme="dark"
              />
            </EmptyQueryView>
          </div>
        </div>
      </Resizer>
    </Context>
  )
}

export default Visualization
