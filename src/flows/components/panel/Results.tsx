// Libraries
import React, {FC, useState, useContext} from 'react'
import {Button, ComponentStatus, IconFont} from '@influxdata/clockface'

// Components
import Resizer from 'src/flows/shared/Resizer'

import {PipeContext} from 'src/flows/context/pipe'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {RunModeContext} from 'src/flows/context/runMode'
import {MINIMUM_RESIZER_HEIGHT} from 'src/flows/shared/Resizer'

import {downloadTextFile} from 'src/shared/utils/download'

import {RemoteDataState} from 'src/types'
import {Visibility} from 'src/types/flows'
import {View} from 'src/visualization'

const Results: FC = () => {
  const {id, results, queryText} = useContext(PipeContext)
  const {basic, getStatus} = useContext(FlowQueryContext)
  const {runMode} = useContext(RunModeContext)
  const [height, setHeight] = useState(MINIMUM_RESIZER_HEIGHT)
  const [visibility, setVisibility] = useState('visible' as Visibility)
  const resultsExist = !!(results?.parsed?.table || []).length
  const status = getStatus(id)

  let emptyText
  if (status === RemoteDataState.NotStarted) {
    emptyText = `Click ${runMode} to see results`
  } else if (status === RemoteDataState.Loading) {
    emptyText = 'Loading...'
  } else {
    emptyText = 'No Data Returned'
  }

  const downloadTitle = queryText
    ? 'Download results as an annotated CSV file'
    : 'Build a query to download your results'
  const download = () => {
    basic(queryText).promise.then(response => {
      if (response.type !== 'SUCCESS') {
        return
      }

      downloadTextFile(response.csv, 'influx.data', '.csv', 'text/csv')
    })
  }

  return (
    <Resizer
      loading={status}
      resizingEnabled={resultsExist}
      emptyText={emptyText}
      error={results.error}
      hiddenText="Results hidden"
      toggleVisibilityEnabled={true}
      height={height}
      onUpdateHeight={height => setHeight(height)}
      visibility={visibility}
      onUpdateVisibility={visibility => setVisibility(visibility)}
    >
      <div className="query-results">
        <View
          properties={{
            type: 'simple-table',
            showAll: false,
          }}
          result={results.parsed}
        />
      </div>
      <Button
        className="query-results--download"
        titleText={downloadTitle}
        text="CSV"
        icon={IconFont.Download}
        onClick={download}
        status={queryText ? ComponentStatus.Default : ComponentStatus.Disabled}
      />
    </Resizer>
  )
}

export default Results
