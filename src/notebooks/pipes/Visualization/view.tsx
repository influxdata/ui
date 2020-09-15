// Libraries
import React, {FC, useContext, useCallback, useState} from 'react'

// Components
import {SquareButton, IconFont, ComponentColor} from '@influxdata/clockface'
import EmptyQueryView, {ErrorFormat} from 'src/shared/components/EmptyQueryView'
import DashboardList from './DashboardList'
import ViewSwitcher from 'src/shared/components/ViewSwitcher'
import ViewTypeDropdown from './ViewTypeDropdown'
import Resizer from 'src/notebooks/shared/Resizer'

// Utilities
import {checkResultsLength} from 'src/shared/utils/vis'
import ExportVisualizationButton from 'src/notebooks/pipes/Visualization/ExportVisualizationButton'
import {event} from 'src/cloud/utils/reporting'
import {TYPE_DEFINITIONS} from 'src/notebooks/pipes/Visualization'

// Types
import {PipeProp} from 'src/types/notebooks'
import {ViewType, ViewProperties} from 'src/types'
import {FromFluxResult} from '@influxdata/giraffe'

// NOTE we dont want any pipe component to be directly dependent
// to any notebook concepts as this'll limit future reusability
// but timezone seems like an app setting, and its existance within
// the notebook folder is purely a convenience
import {AppSettingContext} from 'src/notebooks/context/app'
import {PipeContext} from 'src/notebooks/context/pipe'

// TODO: all of this needs to be removed by refactoring
// the underlying logic. Managing state like this is a
// recipe for long dev cycles, stale logic, and many bugs
// these default value mechanisms should exist within giraffe
const _transform = (
  properties: ViewProperties,
  results: FromFluxResult
): ViewProperties => {
  if (!results) {
    return properties
  }

  if (properties.type === 'table') {
    const existing = (properties.fieldOptions || []).reduce((prev, curr) => {
      prev[curr.internalName] = curr
      return prev
    }, {})

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
    return {
      ...properties,
      fieldOptions: Object.keys(existing).map(e => existing[e]),
    }
  }

  if (properties.type === 'histogram') {
    return {
      ...properties,
      fillColumns: results.fluxGroupKeyUnion,
    }
  }

  if (properties.type === 'heatmap') {
    return {
      ...properties,
      xColumn:
        ['_time', '_start', '_stop'].filter(field =>
          results.table.columnKeys.includes(field)
        )[0] || results.table.columnKeys[0],
      yColumn:
        ['_value'].filter(field =>
          results.table.columnKeys.includes(field)
        )[0] || results.table.columnKeys[0],
    }
  }

  if (properties.type === 'scatter') {
    return {
      ...properties,
      fillColumns: results.fluxGroupKeyUnion,
      symbolColumns: results.fluxGroupKeyUnion,
      xColumn:
        ['_time', '_start', '_stop'].filter(field =>
          results.table.columnKeys.includes(field)
        )[0] || results.table.columnKeys[0],
      yColumn:
        ['_value'].filter(field =>
          results.table.columnKeys.includes(field)
        )[0] || results.table.columnKeys[0],
    }
  }

  return properties
}

export {_transform}

const Visualization: FC<PipeProp> = ({Context}) => {
  const {timeZone} = useContext(AppSettingContext)
  const {data, update, loading, results} = useContext(PipeContext)

  const updateType = (type: ViewType) => {
    event('Notebook Visualization Type Changed', {
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
