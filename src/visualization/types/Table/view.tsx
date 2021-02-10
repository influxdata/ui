// Libraries
import React, {FC, Fragment, useState, useMemo, useCallback} from 'react'
import classnames from 'classnames'

import Table from 'src/visualization/types/Table/Table'
import {Input, DapperScrollbars} from '@influxdata/clockface'
import {IconFont} from '@influxdata/clockface'
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'

// Utils
import {tableFromFluxResult} from 'src/shared/parsing/flux/response'

// Types
import {TableViewProperties} from 'src/types'
import {VisualizationProps} from 'src/visualization'
import {
  ASCENDING,
  DESCENDING,
  DEFAULT_SORT_DIRECTION,
  KEYS_I_HATE,
} from './constants'

interface Props extends VisualizationProps {
  properties: TableViewProperties
}

const TableGraphs: FC<Props> = ({properties, result, timeZone, theme}) => {
  const tables = useMemo(() => {
    setSelectedTable(null)
    return tableFromFluxResult(result)
  }, [result])

  const [selectedTable, setSelectedTable] = useState(null)
  const [search, setSearch] = useState('')
  const [sortOptions, setSortOptions] = useState({
    field: properties.tableOptions?.sortBy?.internalName,
    direction: ASCENDING,
  })
  const updateSelectedTable = (name: string) => {
    if (name === selectedTable) {
      setSelectedTable(null)
    } else {
      setSelectedTable(name)
    }
  }

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
          timeZone={timeZone}
          theme={theme}
        />
      )}
      {(!_selectedTable || !_selectedTable.data.length) && (
        <EmptyGraphMessage message="This table has no data" />
      )}
    </div>
  )
}

export default TableGraphs
