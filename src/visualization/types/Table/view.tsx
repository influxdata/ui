// Libraries
import React, {
  FC,
  Fragment,
  useState,
  useMemo,
  useCallback,
  useContext,
} from 'react'
import classnames from 'classnames'

import Table from 'src/visualization/types/Table/Table'
import {Input, DapperScrollbars} from '@influxdata/clockface'
import {IconFont} from '@influxdata/clockface'
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'

// Utils
import {tableFromFluxResult} from 'src/shared/parsing/flux/response'
import {AppSettingContext} from 'src/shared/contexts/app'
import {parseFromFluxResults} from 'src/timeMachine/utils/rawFluxDataTable'

// Types
import {TableViewProperties} from 'src/types'
import {VisualizationProps} from 'src/visualization'
import {
  ASCENDING,
  DESCENDING,
  DEFAULT_SORT_DIRECTION,
  KEYS_I_HATE,
} from './constants'
import {
  Config,
  DEFAULT_TABLE_COLORS,
  HoverTimeProvider,
  Plot,
} from '@influxdata/giraffe'

interface Props extends VisualizationProps {
  properties: TableViewProperties
}

const FEATURE_FLAG_ENABLED = true

const TableGraphs: FC<Props> = ({properties, result}) => {
  const [selectedTable, setSelectedTable] = useState(null)
  const [search, setSearch] = useState('')
  const [sortOptions, setSortOptions] = useState({
    field: properties.tableOptions?.sortBy?.internalName,
    direction: ASCENDING,
  })
  const {theme} = useContext(AppSettingContext)
  const updateSelectedTable = (name: string) => {
    if (name === selectedTable) {
      setSelectedTable(null)
    } else {
      setSelectedTable(name)
    }
  }
  const tables = useMemo(() => {
    setSelectedTable(null)
    return tableFromFluxResult(result)
  }, [result])

  const _selectedTable =
    tables.find(table => table.name === selectedTable) || tables[0]

  const updateSortOptions = useCallback(
    (fieldName: string) => {
      const sort = {...sortOptions}

      if (fieldName === sort.field) {
        if (sort.direction === DESCENDING) {
          sort.field = ''
          sort.direction = ASCENDING
        } else {
          sort.direction = DESCENDING
        }
      } else {
        sort.field = fieldName
        sort.direction = DEFAULT_SORT_DIRECTION
      }

      setSortOptions(sort)
    },
    [sortOptions, setSortOptions]
  )

  const sidebarClassName = classnames('time-machine-sidebar', {
    'time-machine-sidebar__light': theme === 'light',
  })
  const filteredTables = tables.filter(t => t.name.includes(search))

  if (FEATURE_FLAG_ENABLED) {
    const parsed = parseFromFluxResults(result)
    const fluxResponse = parsed.tableData.join('\n')

    const config: Config = {
      fluxResponse,
      layers: [
        {
          type: 'table',
          properties: {
            colors: DEFAULT_TABLE_COLORS,
            tableOptions: {
              fixFirstColumn: false,
              verticalTimeAxis: true,
            },
            fieldOptions: [
              {
                displayName: '_start',
                internalName: '_start',
                visible: true,
              },
              {
                displayName: '_stop',
                internalName: '_stop',
                visible: true,
              },
              {
                displayName: '_time',
                internalName: '_time',
                visible: true,
              },
              {
                displayName: '_value',
                internalName: '_value',
                visible: true,
              },
              {
                displayName: '_field',
                internalName: '_field',
                visible: true,
              },
              {
                displayName: '_measurement',
                internalName: '_measurement',
                visible: true,
              },
              {
                displayName: 'cpu',
                internalName: 'cpu',
                visible: true,
              },
              {
                displayName: 'host',
                internalName: 'host',
                visible: true,
              },
            ],
            timeFormat: properties.timeFormat,
            decimalPlaces: {
              digits: 3,
              isEnforced: true,
            },
          },
          timeZone: 'Local',
          tableTheme: theme,
        },
      ],
    }
    return (
      <HoverTimeProvider>
        <Plot config={config} />
      </HoverTimeProvider>
    )
  } else {
    return (
      <div className="time-machine-tables">
        {tables.length > 1 && (
          <div className={sidebarClassName}>
            {!!_selectedTable?.data?.length && (
              <div className="time-machine-sidebar--heading">
                <Input
                  icon={IconFont.Search}
                  onChange={e => {
                    setSearch(e.target.value)
                  }}
                  placeholder="Filter tables..."
                  value={search}
                  className="time-machine-sidebar--filter"
                />
              </div>
            )}
            <DapperScrollbars
              autoHide={true}
              className="time-machine-sidebar--scroll"
            >
              <div className="time-machine-sidebar--items">
                {filteredTables.map(table => {
                  const classer = `time-machine-sidebar-item ${
                    selectedTable === table.name ? 'active' : ''
                  }`
                  const display = Object.entries(table.groupKey)
                    .filter(([k]) => !KEYS_I_HATE.includes(k))
                    .map(([k, v], i) => {
                      return (
                        <Fragment key={i}>
                          <span className="key">{k}</span>
                          <span className="equals">=</span>
                          <span className="value">{v}</span>
                        </Fragment>
                      )
                    })
                  return (
                    <div
                      key={table.id}
                      className={classer}
                      onClick={() => updateSelectedTable(table.name)}
                    >
                      {display}
                    </div>
                  )
                })}
              </div>
            </DapperScrollbars>
          </div>
        )}
        {!!_selectedTable && (
          <Table
            key={_selectedTable?.name}
            table={_selectedTable}
            sort={sortOptions}
            updateSort={updateSortOptions}
            properties={properties}
          />
        )}
        {(!_selectedTable || !_selectedTable.data.length) && (
          <EmptyGraphMessage message="This table has no data" />
        )}
      </div>
    )
  }
}

export default TableGraphs
