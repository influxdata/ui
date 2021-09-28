// Libraries
import React, {FC, useContext, useEffect, useMemo} from 'react'

// Components
import {Icon, IconFont} from '@influxdata/clockface'
import ExportDashboardOverlay from 'src/flows/pipes/Visualization/ExportDashboardOverlay'
import Controls from 'src/flows/pipes/Visualization/Controls'
import FriendlyQueryError from 'src/flows/shared/FriendlyQueryError'

// Utilities
import {View} from 'src/visualization'

// Types
import {RemoteDataState} from 'src/types'
import {PipeProp} from 'src/types/flows'

import {PipeContext} from 'src/flows/context/pipe'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {SidebarContext} from 'src/flows/context/sidebar'
import {PopupContext} from 'src/flows/context/popup'

import {event} from 'src/cloud/utils/reporting'
import {downloadTextFile} from 'src/shared/utils/download'

// Constants
import {UNPROCESSED_PANEL_TEXT} from 'src/flows/constants'

const Visualization: FC<PipeProp> = ({Context}) => {
  const {id, data, range, loading, results} = useContext(PipeContext)
  const {basic, getPanelQueries} = useContext(FlowQueryContext)
  const {register} = useContext(SidebarContext)
  const {launch} = useContext(PopupContext)

  const dataExists = !!(results?.parsed?.table || []).length

  const queryText = getPanelQueries(id, true)?.source || ''
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
        title: 'Visualization',
        actions: [
          {
            title: 'Download as CSV',
            disable: !dataExists,
            action: download,
          },
          {
            title: 'Export to Dashboard',
            action: () => {
              event('Export to Dashboard Clicked')

              launch(<ExportDashboardOverlay />, {
                properties: data.properties,
                range: range,
                panel: id,
              })
            },
          },
        ],
      },
    ])
  }, [id, data.properties, results.parsed, range])

  if (results.error) {
    return (
      <Context controls={<Controls />}>
        <div className="panel-resizer panel-resizer__visible panel-resizer--error-state">
          <div className="panel-resizer--header panel-resizer--header__multiple-controls">
            <Icon
              glyph={IconFont.AlertTriangle}
              className="panel-resizer--vis-toggle"
            />
          </div>
          <FriendlyQueryError error={results.error} />
        </div>
      </Context>
    )
  }

  if (!dataExists) {
    return (
      <Context controls={<Controls />}>
        <div className="panel-resizer panel-resizer__visible">
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

  return (
    <Context controls={<Controls />} resizes>
      <div className="flow-visualization">
        <div className="flow-visualization--view">
          <View
            loading={loading}
            properties={data.properties}
            result={results.parsed}
            timeRange={range}
          />
        </div>
      </div>
    </Context>
  )
}

export default Visualization
