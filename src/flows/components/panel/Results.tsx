// Libraries
import React, {FC, useEffect, useState, useContext, useMemo} from 'react'
import {AutoSizer} from 'react-virtualized'
import {Table, ComponentSize, DapperScrollbars} from '@influxdata/clockface'

// Components
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

const HEADER_HEIGHT = 51
const ROW_HEIGHT = 25

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

              let runningHeight = 0
              let rowIdx = startRow
              let currentTable

              while(startRow <= results.parsed.table.length) {
                  if (results.parsed.table.columns.table.data[rowIdx] !== currentTable) {
                      runningHeight += HEADER_HEIGHT

                      if (currentTable !== undefined) {
                          runningHeight += 10
                      }

                      if (runningHeight > height) {
                          break
                      }

                      currentTable = results.parsed.table.columns.table.data[rowIdx]
                      continue
                  }

                  runningHeight += ROW_HEIGHT

                  if (runningHeight > height) {
                      break
                  }

                  rowIdx++
              }

              const page = rowIdx - startRow

              if (page !== pageSize) {
                setPageSize(page)
              }

              const subset = Object.values(results.parsed.table.columns)
              .map(c => ({
                  ...c,
                  group: results.parsed.fluxGroupKeyUnion.indexOf(c.name) !== -1,
                  data: c.data.slice(startRow, startRow + page)
              }))
              .filter(c => !!c.data.filter(_c => _c !== undefined).length && c.name !== '_start' && c.name !== '_stop')
              .reduce((arr, curr) => {
                  arr[curr.name] = curr
                  return arr
              }, {})

              const tables = []
              let lastTable

              for (let ni = 0; ni < page; ni++) {
                  if (subset.table.data[ni] === lastTable) {
                      continue;
                  }

                  lastTable = subset.table.data[ni]

                  if (tables.length) {
                      tables[tables.length - 1].end = ni - 1
                  }

                  tables.push({
                      idx: lastTable,
                      start: ni
                  })
              }

              if (tables.length) {
                  tables[tables.length - 1].end = page
              }

              return tables.map(t => {
                  const cols = Object.values(subset).map(c => ({...c, data: c.data.slice(t.start, t.end)})).filter(c => !!c.data.length)

                  const headers = cols.map(c => (
                      <Table.HeaderCell>
                          {c.name}
                          <label>{c.group ? 'group' : 'no group'}</label>
                          <label>{c.fluxDataType}</label>
                      </Table.HeaderCell>
                  ))
                  const rows = Array(t.end-t.start).fill(null).map((_, idx) => {
                      const cells = cols.map(c => (
                          <Table.Cell>{c.data[idx]}</Table.Cell>
                      ))

                      return (
                          <Table.Row>
                              {cells}
                          </Table.Row>
                      )
                  })

                  return (
                      <Table fontSize={ComponentSize.Small}
                        striped
                        highlight>
                          <Table.Header>
                              <Table.Row>
                                  {headers}
                              </Table.Row>
                          </Table.Header>
                          <Table.Body>
                              {rows}
                          </Table.Body>
                      </Table>
                  )
              })
            }}
          </AutoSizer>
        </div>
      </div>
    </Resizer>
  )
}

export default Results
