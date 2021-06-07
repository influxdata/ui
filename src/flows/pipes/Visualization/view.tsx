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
import {IconFont} from '@influxdata/clockface'
import Resizer from 'src/flows/shared/Resizer'
import ExportDashboardOverlay from 'src/flows/pipes/Visualization/ExportDashboardOverlay'
import ExportButton from 'src/flows/pipes/Visualization/ExportDashboardButton'
import Controls from 'src/flows/pipes/Visualization/Controls'

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

  return (
    <Context
      controls={<Controls toggle={toggleOptions} visible={optionsVisibility} />}
      persistentControls={persist}
    >
      <Resizer
        loading={loading}
        resizingEnabled={dataExists}
        minimumHeight={200}
        emptyText={loadingText}
        emptyIcon={IconFont.BarChart}
        toggleVisibilityEnabled={false}
        height={data.panelHeight}
        onUpdateHeight={panelHeight => update({panelHeight})}
        visibility={data.panelVisibility}
        onUpdateVisibility={panelVisibility => update({panelVisibility})}
      >
        <div className="flow-visualization">
          <div className="flow-visualization--view">
            <View
              loading={RemoteDataState.Done}
              error={results?.error}
              properties={data.properties}
              result={results.parsed}
              timeRange={range}
            />
          </div>
        </div>
      </Resizer>
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
