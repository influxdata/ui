// Libraries
import React, {FC, useContext, useEffect, useMemo} from 'react'

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

const Table: FC<PipeProp> = ({Context}) => {
  const {id, data, range, loading, results} = useContext(PipeContext)
  const {basic, getPanelQueries} = useContext(FlowQueryContext)
  const {register} = useContext(SidebarContext)

  const dataExists = !!(results?.parsed?.table || []).length

  const queryText = getPanelQueries(id)?.source || ''
  const download = () => {
    event('CSV Download Initiated')
    basic(queryText).promise.then(response => {
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
