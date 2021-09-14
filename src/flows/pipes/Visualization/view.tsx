// Libraries
import React, {
  FC,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

// Components
import {
  Icon,
  IconFont,
  DapperScrollbars,
  Button,
  ComponentStatus,
} from '@influxdata/clockface'
import ExportDashboardOverlay from 'src/flows/pipes/Visualization/ExportDashboardOverlay'
import ExportButton from 'src/flows/pipes/Visualization/ExportDashboardButton'
import Controls from 'src/flows/pipes/Visualization/Controls'
import FriendlyQueryError from 'src/flows/shared/FriendlyQueryError'

// Utilities
import {View, ViewOptions} from 'src/visualization'

// Types
import {RemoteDataState} from 'src/types'
import {PipeProp} from 'src/types/flows'

import {PipeContext} from 'src/flows/context/pipe'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {SidebarContext} from 'src/flows/context/sidebar'
import {PopupContext} from 'src/flows/context/popup'

import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {downloadTextFile} from 'src/shared/utils/download'

const Visualization: FC<PipeProp> = ({Context}) => {
  const {id, data, range, update, loading, results} = useContext(PipeContext)
  const {basic, getPanelQueries} = useContext(FlowQueryContext)
  const {register} = useContext(SidebarContext)
  const {launch} = useContext(PopupContext)
  const [optionsVisibility, setOptionsVisibility] = useState(false)
  const toggleOptions = useCallback(() => {
    setOptionsVisibility(!optionsVisibility)
  }, [optionsVisibility, setOptionsVisibility])

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

  const queryText = getPanelQueries(id, true)?.source || ''
  const downloadTitle = queryText
    ? 'Download results as an annotated CSV file'
    : 'Build a query to download your results'
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
      return 'This cell will display results from the previous cell'
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
      <Context
        controls={
          <Controls toggle={toggleOptions} visible={optionsVisibility} />
        }
      >
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
      <Context
        controls={
          <Controls toggle={toggleOptions} visible={optionsVisibility} />
        }
      >
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
    <Context
      controls={<Controls toggle={toggleOptions} visible={optionsVisibility} />}
      resizes
    >
      <div className="flow-visualization">
        <div className="flow-visualization--view">
          <View
            loading={loading}
            properties={data.properties}
            result={results.parsed}
            timeRange={range}
          />
        </div>
        {optionsVisibility && dataExists && (
          <DapperScrollbars style={{width: '400px'}}>
            <ViewOptions
              properties={data.properties}
              results={results.parsed}
              update={updateProperties}
            />
          </DapperScrollbars>
        )}
      </div>
    </Context>
  )
}

export default Visualization
