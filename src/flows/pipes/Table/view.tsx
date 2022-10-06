// Libraries
import React, {
  FC,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react'
import {Icon, IconFont} from '@influxdata/clockface'

// Components
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'

// Utilities
import {View} from 'src/visualization'

// Types
import {RemoteDataState, SimpleTableViewProperties} from 'src/types'
import {PipeProp, FluxResult} from 'src/types/flows'

import {PipeContext} from 'src/flows/context/pipe'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {SidebarContext} from 'src/flows/context/sidebar'

import {event} from 'src/cloud/utils/reporting'
import {downloadTextFile} from 'src/shared/utils/download'

// Constants
import {UNPROCESSED_PANEL_TEXT} from 'src/flows'

// Styles
import './view.scss'

const QueryStat: FC = () => {
  const {loading, results} = useContext(PipeContext)
  const queryStart = useRef(0)
  const [processTime, setProcessTime] = useState(0)
  let tableNum = 0

  const tableColumn = results.parsed.table?.getColumn('table') || []
  const lastTableValue = tableColumn[tableColumn.length - 1]

  if (typeof lastTableValue === 'string') {
    tableNum = parseInt(lastTableValue) + 1
  } else if (typeof lastTableValue === 'boolean') {
    console.error('Cannot extract tableId. Check parsed csv output.')
  } else if (typeof lastTableValue === 'number') {
    tableNum = lastTableValue + 1
  }

  useEffect(() => {
    if (loading === RemoteDataState.Loading) {
      // start to count
      if (queryStart.current === 0) {
        queryStart.current = Date.now()
        setProcessTime(0)
      }
      return
    }

    if (loading === RemoteDataState.Done && queryStart.current !== 0) {
      const timePassed = Date.now() - queryStart.current // ms
      queryStart.current = 0
      setProcessTime(timePassed)
      return
    }

    queryStart.current = 0
    setProcessTime(0)
  }, [loading])

  const queryStat = {
    tableNum,
    rowNum: results.parsed.table?.length || 0,
    processTime, // ms
  }

  if (loading !== RemoteDataState.Done) {
    return null
  }

  return (
    <div className="query-stat">
      <span className="query-stat--bold">{`${queryStat.tableNum} tables`}</span>
      <span className="query-stat--bold">{`${queryStat.rowNum} rows`}</span>
      <span className="query-stat--normal">{`${queryStat.processTime} ms`}</span>
    </div>
  )
}

const Table: FC<PipeProp> = ({Context}) => {
  const {id, data, range, loading, results} = useContext(PipeContext)
  const {basic, getPanelQueries} = useContext(FlowQueryContext)
  const {register} = useContext(SidebarContext)
  const [search, setSearch] = useState('')

  const dataExists = !!(results?.parsed?.table || []).length

  const download = () => {
    event('CSV Download Initiated')
    const query = getPanelQueries(id)
    basic(query?.source, query?.scope).promise.then(response => {
      if (response.type !== 'SUCCESS') {
        return
      }

      downloadTextFile(response.csv, 'influx.data', '.csv', 'text/csv')
    })
  }

  const res = useMemo(() => {
    if (!search.trim() || !results?.parsed) {
      return results?.parsed
    }

    const dupped = {
      fluxGroupKeyUnion: [...results.parsed.fluxGroupKeyUnion],
      resultColumnNames: [...results.parsed.resultColumnNames],
      table: {
        length: 0,
        columns: Object.entries(results.parsed.table.columns).reduce(
          (acc, [k, v]) => {
            acc[k] = {...v, data: []}
            return acc
          },
          {}
        ),
      },
    }

    const len = results.parsed.table.length
    const keys = Object.keys(results.parsed.table.columns)
    let newLen = 0,
      ni = 0

    const _search = search.toLocaleLowerCase()
    const oldCols = results.parsed.table.columns
    const newCols = dupped.table.columns

    for (; ni < len; ni++) {
      if (
        !keys.reduce(
          (acc, curr) =>
            acc ||
            ('' + oldCols[curr].data[ni]).toLocaleLowerCase().includes(_search),
          false
        )
      ) {
        continue
      }

      keys.forEach(k => (newCols[k].data[newLen] = oldCols[k].data[ni]))
      newLen++
    }

    dupped.table.length = newLen

    return dupped as FluxResult['parsed']
  }, [search, results?.parsed])

  const loadingText = useMemo(() => {
    if (loading === RemoteDataState.Loading) {
      return 'Loading'
    }

    if (loading === RemoteDataState.NotStarted) {
      return UNPROCESSED_PANEL_TEXT
    }

    return 'No Data Returned'
  }, [loading])

  useEffect(() => {
    if (!id) {
      return
    }

    register(id, [
      {
        title: 'Table',
        actions: [
          {
            title: 'Download as CSV',
            disable: !dataExists,
            action: download,
          },
        ],
      },
    ])
  }, [id, data.properties, results.parsed, range])

  if (results.error) {
    return (
      <Context>
        <div className="panel-resizer panel-resizer__visible panel-resizer--error-state">
          <div className="panel-resizer--header panel-resizer--header__multiple-controls">
            <Icon
              glyph={IconFont.AlertTriangle}
              className="panel-resizer--vis-toggle"
            />
          </div>
          <div className="panel-resizer--error">{results.error}</div>
        </div>
      </Context>
    )
  }

  if (!dataExists) {
    return (
      <Context>
        <div className="panel-resizer panel-resizer__visible" id={id}>
          <div className="panel-resizer--header panel-resizer--header__multiple-controls">
            <Icon
              glyph={IconFont.BarChart_New}
              className="panel-resizer--vis-toggle"
            />
          </div>
          <div className="panel-resizer--body">
            <div className="panel-resizer--empty">{loadingText}</div>
          </div>
        </div>
      </Context>
    )
  }

  const caveat = (
    <label style={{alignSelf: 'center', marginRight: '12px'}}>
      Limited to most recent 100 results per series
    </label>
  )

  return (
    <Context resizes controls={caveat}>
      <div className="flow-visualization" id={id}>
        <div className="flow-visualization--header">
          <SearchWidget
            placeholderText="Search results..."
            onSearch={setSearch}
            searchTerm={search}
          />
          <QueryStat />
        </div>
        <div className="flow-visualization--view">
          <View
            loading={loading}
            properties={
              {
                type: 'simple-table',
                showAll: false,
              } as SimpleTableViewProperties
            }
            result={res}
            timeRange={range}
          />
        </div>
      </div>
    </Context>
  )
}

export default Table
