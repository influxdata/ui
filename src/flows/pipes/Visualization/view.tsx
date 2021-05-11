// Libraries
import React, {FC, useContext, useCallback, useMemo, useState} from 'react'

// Components
import {IconFont} from '@influxdata/clockface'
import Resizer from 'src/flows/shared/Resizer'

// Utilities
import {View, ViewOptions} from 'src/visualization'

// Types
import {RemoteDataState} from 'src/types'
import {PipeProp} from 'src/types/flows'

import {PipeContext} from 'src/flows/context/pipe'

const Visualization: FC<PipeProp> = ({Context}) => {
  const {data, range, update, loading, results} = useContext(PipeContext)
  const [optionsVisibility] = useState(false)

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

  const dataExists = !!(results?.parsed?.table || []).length

  const loadingText = useMemo(() => {
    if (loading === RemoteDataState.Loading) {
      return 'Loading'
    }

    if (loading === RemoteDataState.NotStarted) {
      return 'This cell will display results from the previous cell'
    }

    return 'No Data Returned'
  }, [loading])

  /*
    <Context
      controls={<Controls toggle={toggleOptions} visible={optionsVisibility} />}
      persistentControl={<ExportButton />}
    >
   */

  return (
    <Context>
      <Resizer
        loading={loading}
        resizingEnabled={dataExists}
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
              loading={RemoteDataState.Done}
              error={results?.error}
              properties={data.properties}
              result={results.parsed}
              timeRange={range}
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
