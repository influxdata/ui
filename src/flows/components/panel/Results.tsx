// Libraries
import React, {FC, useEffect, useState, useContext, useMemo} from 'react'
import {AutoSizer} from 'react-virtualized'
import memoizeOne from 'memoize-one'

// Components
import RawFluxDataTable from 'src/timeMachine/components/RawFluxDataTable'
import {ROW_HEIGHT} from 'src/timeMachine/components/RawFluxDataGrid'
import Resizer from 'src/flows/shared/Resizer'
import ResultsPagination from 'src/flows/components/panel/ResultsPagination'

import {FlowContext} from 'src/flows/context/flow.current'
import {PipeContext} from 'src/flows/context/pipe'
import {MINIMUM_RESIZER_HEIGHT} from 'src/flows/shared/Resizer'

// Utils
import {
  parseFiles,
  parseFilesWithObjects,
  parseFilesWithFromFlux,
} from 'src/timeMachine/utils/rawFluxDataTable'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {event} from 'src/cloud/utils/reporting'

import {RemoteDataState} from 'src/types'
import {Visibility} from 'src/types/flows'

const Results: FC = () => {
  const {flow} = useContext(FlowContext)
  const {id, results} = useContext(PipeContext)
  const [height, setHeight] = useState(MINIMUM_RESIZER_HEIGHT)
  const [visibility, setVisibility] = useState('visible' as Visibility)
  const meta = flow.meta.get(id)
  const resultsExist =
    !!results && !!results.raw && !!results.parsed.table.length
  const raw = (results || {}).raw || ''

  const rows = useMemo(() => raw.split('\n'), [raw])
  const [startRow, setStartRow] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(0)

  useEffect(() => {
    setStartRow(0)
  }, [raw])

  const prevDisabled = startRow <= 0
  const nextDisabled = startRow + pageSize >= rows.length

  const prev = () => {
    event('Query Pagination Previous Button Clicked')

    const index = startRow - pageSize
    if (index <= 0) {
      setStartRow(0)
      return
    }
    setStartRow(index)
  }

  const next = () => {
    event('Query Pagination Next Button Clicked')

    const index = startRow + pageSize
    const max = rows.length - pageSize
    if (index >= max) {
      setStartRow(max)
      return
    }
    setStartRow(index)
  }

  let emptyText
  if (meta.loading === RemoteDataState.NotStarted) {
    emptyText = 'Run the Flow to See Results'
  } else if (meta.loading === RemoteDataState.Loading) {
    emptyText = 'Loading'
  } else {
    emptyText = 'No Data Returned'
  }

  return (
    <Resizer
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
        <ResultsPagination
          onClickPrev={prev}
          onClickNext={next}
          disablePrev={prevDisabled}
          disableNext={nextDisabled}
          visible={resultsExist && visibility === 'visible'}
          pageSize={pageSize}
          startRow={startRow}
        />
        <div className="query-results--container">
          <AutoSizer>
            {({width, height}) => {
              if (!width || !height) {
                return false
              }

              const memoizeParseFilesWithFromFlux = memoizeOne(
                parseFilesWithFromFlux
              )
              const memoizeParseFiles = memoizeOne(parseFiles)
              const memoizeParseFilesWithObjects = memoizeOne(
                parseFilesWithObjects
              )

              const page = Math.floor(height / ROW_HEIGHT)
              setPageSize(page)

              let parseFunction = memoizeParseFiles
              if (isFlagEnabled('parseObjectsInCSV')) {
                parseFunction = memoizeParseFilesWithObjects
              }
              if (isFlagEnabled('rawCsvFromfluxParser')) {
                parseFunction = memoizeParseFilesWithFromFlux
              }
              const {data, maxColumnCount} = parseFunction([raw])
              if (isFlagEnabled('flowsUiPagination')) {
                return (
                  <RawFluxDataTable
                    data={data}
                    maxColumnCount={maxColumnCount}
                    startRow={startRow}
                    width={width}
                    height={page * ROW_HEIGHT}
                    disableVerticalScrolling={true}
                  />
                )
              }
              return (
                <RawFluxDataTable
                  files={[rows.slice(startRow, startRow + page).join('\n')]}
                  width={width}
                  height={page * ROW_HEIGHT}
                  disableVerticalScrolling={true}
                />
              )
            }}
          </AutoSizer>
        </div>
      </div>
    </Resizer>
  )
}

export default Results
