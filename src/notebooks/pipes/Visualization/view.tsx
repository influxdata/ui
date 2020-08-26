// Libraries
import React, {FC, useContext} from 'react'

// Components
import EmptyQueryView, {ErrorFormat} from 'src/shared/components/EmptyQueryView'
import DashboardList from './DashboardList'
import ViewSwitcher from 'src/shared/components/ViewSwitcher'
import {ViewTypeDropdown} from 'src/timeMachine/components/view_options/ViewTypeDropdown'
import Resizer from 'src/notebooks/shared/Resizer'

// Utilities
import {checkResultsLength} from 'src/shared/utils/vis'
import {createView} from 'src/views/helpers'
import ExportVisualizationButton from 'src/notebooks/pipes/Visualization/ExportVisualizationButton'
import {event} from 'src/cloud/utils/reporting'

// Types
import {PipeProp, PipeData} from 'src/notebooks'
import {ViewType} from 'src/types'
import {IconFont} from '@influxdata/clockface'
import {FromFluxResult} from '@influxdata/giraffe'

// NOTE we dont want any pipe component to be directly dependent
// to any notebook concepts as this'll limit future reusability
// but timezone seems like an app setting, and its existance within
// the notebook folder is purely a convenience
import {AppSettingContext} from 'src/notebooks/context/app'
import {PipeContext} from 'src/notebooks/context/pipe'

const updateVisualizationType = (
  type: ViewType,
  results: FromFluxResult,
  onUpdate: (data: PipeData) => void
): void => {
  const newView = createView(type)

  // TODO: all of this needs to be removed by refactoring
  // the underlying logic. Managing state like this is a
  // recipe for long dev cycles, stale logic, and many bugs
  if (newView.properties.type === 'table' && results) {
    const existing = (newView.properties.fieldOptions || []).reduce(
      (prev, curr) => {
        prev[curr.internalName] = curr
        return prev
      },
      {}
    )

    results.table.columnKeys
      .filter(o => !existing.hasOwnProperty(o))
      .filter(o => !['result', '', 'table', 'time'].includes(o))
      .forEach(o => {
        existing[o] = {
          internalName: o,
          displayName: o,
          visible: true,
        }
      })
    const fieldOptions = Object.keys(existing).map(e => existing[e])
    newView.properties = {...newView.properties, fieldOptions}
  }

  if (
    (newView.properties.type === 'histogram' ||
      newView.properties.type === 'scatter') &&
    results
  ) {
    newView.properties.fillColumns = results.fluxGroupKeyUnion
  }

  if (newView.properties.type === 'scatter' && results) {
    newView.properties.symbolColumns = results.fluxGroupKeyUnion
  }

  if (
    (newView.properties.type === 'heatmap' ||
      newView.properties.type === 'scatter') &&
    results
  ) {
    newView.properties.xColumn =
      ['_time', '_start', '_stop'].filter(field =>
        results.table.columnKeys.includes(field)
      )[0] || results.table.columnKeys[0]
    newView.properties.yColumn =
      ['_value'].filter(field => results.table.columnKeys.includes(field))[0] ||
      results.table.columnKeys[0]
  }

  onUpdate({
    properties: newView.properties,
  })
}

export {updateVisualizationType}

const Visualization: FC<PipeProp> = ({Context}) => {
  const {timeZone} = useContext(AppSettingContext)
  const {data, update, loading, results} = useContext(PipeContext)

  const updateType = (type: ViewType) => {
    event('Notebook Visualization Type Changed', {
      type,
    })

    updateVisualizationType(type, results.parsed, update)
  }

  const controls = (
    <>
      <ViewTypeDropdown
        viewType={data.properties.type}
        onUpdateType={updateType as any}
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

  return (
    <Context controls={controls}>
      <Resizer
        resizingEnabled={!!results.raw}
        emptyText="This cell will visualize results from the previous cell"
        emptyIcon={IconFont.BarChart}
        toggleVisibilityEnabled={false}
      >
        <div className="notebook-visualization">
          <div className="notebook-visualization--view">
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
