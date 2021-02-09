// Libraries
import React, {FC, useState, useContext} from 'react'

// Components
import Resizer from 'src/flows/shared/Resizer'

// Components
import {SquareButton, IconFont} from '@influxdata/clockface'

// Utilities
import fromFlux from 'src/shared/utils/fromFlux.legacy'

// Types
import {PipeProp, FluxResult} from 'src/types/flows'
import {ViewType, RemoteDataState} from 'src/types'

import {AppSettingContext} from 'src/flows/context/app'
import {PipeContext} from 'src/flows/context/pipe'

import {
  SUPPORTED_VISUALIZATIONS,
  View,
  ViewTypeDropdown,
} from 'src/visualization'

const TestFlux: FC<PipeProp> = ({Context}) => {
  const {timeZone} = useContext(AppSettingContext)
  const {data, range, update} = useContext(PipeContext)
  const uploadRef: React.RefObject<HTMLInputElement> = React.createRef()
  const startUpload = () => {
    uploadRef.current.click()
  }
  const parseCSV = evt => {
    Promise.all(
      Array.from(evt.target.files)
        .filter((file: File) => file.type === 'text/csv')
        .map((file: File) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
              resolve(reader.result)
            }
            reader.onerror = () => {
              reject()
            }
            reader.readAsText(file)
          })
        })
    )
      .then(results => {
        const result = results.join('\n\n')

        return {
          raw: result,
          parsed: fromFlux(result),
          source: 'buckets()',
        } as FluxResult
      })
      .then(result => {
        setResults(result)
      })
  }
  const [results, setResults] = useState({} as FluxResult)

  const updateType = (type: ViewType) => {
    update({
      properties: SUPPORTED_VISUALIZATIONS[type].initial,
    })
  }

  const controls = (
    <>
      <ViewTypeDropdown
        viewType={data.properties.type}
        onUpdateType={updateType as any}
      />
      <SquareButton
        icon={IconFont.Import}
        titleText="Import CSV"
        onClick={startUpload}
      />
      <input type="file" ref={uploadRef} onChange={parseCSV} hidden />
    </>
  )

  return (
    <Context controls={controls}>
      <Resizer
        resizingEnabled={!!results.raw}
        emptyText="This cell will visualize results from uploaded CSVs"
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
              timeZone={timeZone}
            />
          </div>
        </div>
      </Resizer>
    </Context>
  )
}

export default TestFlux
