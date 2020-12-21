// Libraries
import React, {FC, Fragment, useState} from 'react'
import classnames from 'classnames'

//import TableGraph from 'src/shared/components/tables/TableGraph'
import {Input, DapperScrollbars} from '@influxdata/clockface'
import {IconFont} from '@influxdata/clockface'
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'

// Utils
import {tableFromFluxResult} from 'src/shared/parsing/flux/response'

// Types
import {TableViewProperties} from 'src/types'
import {VisProps} from 'src/visualization'

const KEYS_I_HATE = ['_start', '_stop']

interface Props extends VisProps {
  properties: TableViewProperties
}

const TableGraphs: FC<Props> = ({
  properties,
  result,
  timeRange,
  timeZone,
  theme,
}) => {
    const tables = tableFromFluxResult(result)

    const [selectedTable, setSelectedTable] = useState(tables[0])
    const [search, setSearch] = useState('')

    const sidebarClassName = classnames('time-machine-sidebar', {
      'time-machine-sidebar__light': theme === 'light',
    })
    const filteredTables = tables.filter(t => t.name.includes(search))

    return (
      <div className="time-machine-tables">
          {tables.length > 1 && (
              <div className={sidebarClassName}>
                  {!!selectedTable?.data?.length && (
                      <div className="time-machine-sidebar--heading">
                          <Input
                              icon={IconFont.Search}
                              onChange={(e) => { setSearch(e.target.value) }}
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
                          {filteredTables.map((table) => {
                              const {groupKey, id, name} = table
                              const classer = `time-machine-sidebar-item ${selectedTable && name === selectedTable.name ? 'active' : ''}`
                              const display = Object.entries(groupKey)
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
                                      key={id}
                                      className={classer}
                                      onClick={() => setSelectedTable(table)}
                                  >
                                      {display}
                                  </div>
                              )
                          })}
                      </div>
                  </DapperScrollbars>
              </div>
          )}
          {/*
        {!!selectedTable && (
          <TableGraph
            key={selectedTable?.name}
            table={selectedTable}
            properties={properties}
            timeZone={timeZone}
            theme={theme}
          />
        )}
            */}
        {(!selectedTable || !selectedTable.data.length) && (
          <EmptyGraphMessage message="This table has no data" />
        )}
      </div>
    )
}

export default TableGraphs
