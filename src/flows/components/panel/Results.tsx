// Libraries
import React, {FC, useEffect, useState, useContext, useMemo} from 'react'
import {AutoSizer} from 'react-virtualized'

// Components
import RawFluxDataTable from 'src/timeMachine/components/RawFluxDataTable'
import {ROW_HEIGHT} from 'src/timeMachine/components/RawFluxDataGrid'
import Resizer from 'src/flows/shared/Resizer'
import ResultsPagination from 'src/flows/components/panel/ResultsPagination'

import {FlowContext} from 'src/flows/context/flow.current'
import {PipeContext} from 'src/flows/context/pipe'
import {RunModeContext} from 'src/flows/context/runMode'
import {MINIMUM_RESIZER_HEIGHT} from 'src/flows/shared/Resizer'

// Utils
import {event} from 'src/cloud/utils/reporting'

import {RemoteDataState} from 'src/types'
import {Visibility} from 'src/types/flows'

const Results: FC = () => {
  const {flow} = useContext(FlowContext)
  const {id, results} = useContext(PipeContext)
  const {runMode} = useContext(RunModeContext)
  const [height, setHeight] = useState(MINIMUM_RESIZER_HEIGHT)
  const [visibility, setVisibility] = useState('visible' as Visibility)
  const meta = flow.meta.get(id)
  const resultsExist =
    !!results && !!results.raw && !!results.parsed.table.length

  const rows = useMemo(() => results?.raw?.split('\n') ?? '', [results?.raw])

  const [startRow, setStartRow] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(0)

  useEffect(() => {
    setStartRow(0)
  }, [results.parsed])

  const prevDisabled = startRow <= 0
  const nextDisabled = startRow + pageSize >= rows.length

  const prev = () => {
    event('notebook_paginate_results_click')

    const index = startRow - pageSize
    if (index <= 0) {
      setStartRow(0)
      return
    }
    setStartRow(index)
  }

  const next = () => {
    event('notebook_paginate_results_click')

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
    emptyText = `Click ${runMode} to see results`
  } else if (meta.loading === RemoteDataState.Loading) {
    emptyText = 'Loading...'
  } else {
    emptyText = 'No Data Returned'
  }

  return (
    <Resizer
      loading={meta.loading}
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

              const page = Math.floor(height / ROW_HEIGHT)

              if (page !== pageSize) {
                setPageSize(page)
              }

              return (
                <RawFluxDataTable
                  parsedResults={results.parsed}
                  startRow={startRow}
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
