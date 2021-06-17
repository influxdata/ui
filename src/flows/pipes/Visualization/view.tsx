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
import {Icon, IconFont} from '@influxdata/clockface'
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
import {SidebarContext} from 'src/flows/context/sidebar'
import {PopupContext} from 'src/flows/context/popup'

import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const Visualization: FC<PipeProp> = ({Context}) => {
  const {id, data, range, update, loading, results} = useContext(PipeContext)
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
            title: 'Options',
            disable: !dataExists,
            menu: (
              <ViewOptions
                properties={data.properties}
                results={results.parsed}
                update={updateProperties}
              />
            ),
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

  const persist = isFlagEnabled('flow-sidebar') ? null : <ExportButton />

  if (results.error) {
    return (
      <Context
        controls={
          <Controls toggle={toggleOptions} visible={optionsVisibility} />
        }
        persistentControls={persist}
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
        persistentControls={persist}
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
      persistentControls={persist}
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
      </div>
      {optionsVisibility && dataExists && (
        <ViewOptions
          properties={data.properties}
          results={results.parsed}
          update={updateProperties}
        />
      )}
    </Context>
  )
}

export default Visualization
