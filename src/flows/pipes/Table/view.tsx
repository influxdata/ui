// Libraries
import React, {
  FC,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react'

// Styles
import './view.scss'

// Components
import {Icon, IconFont} from '@influxdata/clockface'

// Utilities
import {View} from 'src/visualization'

// Types
import {RemoteDataState, SimpleTableViewProperties} from 'src/types'
import {PipeProp} from 'src/types/flows'

import {PipeContext} from 'src/flows/context/pipe'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {SidebarContext} from 'src/flows/context/sidebar'

import {event} from 'src/cloud/utils/reporting'
import {downloadTextFile} from 'src/shared/utils/download'

// Constants
import {UNPROCESSED_PANEL_TEXT} from 'src/flows'

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
    tableNum = lastTableValue ? 1 : 0
  } else {
    // number
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
              glyph={IconFont.BarChart}
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
        <div className="flow-visualization--view">
          <QueryStat />
          <View
            loading={loading}
            properties={
              {
                type: 'simple-table',
                showAll: false,
              } as SimpleTableViewProperties
            }
            result={results.parsed}
            timeRange={range}
          />
        </div>
      </div>
    </Context>
  )
}

export default Table
