import React, {FC, useState, useContext} from 'react'
import {FlexBox, FlexDirection, ComponentStatus} from '@influxdata/clockface'

import {RemoteDataState, SimpleTableViewProperties} from 'src/types'
import {ResultsContext} from 'src/dataExplorer/components/ResultsContext'

import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'
import {View} from 'src/visualization'

import './Results.scss'

// simplified version migrated from src/flows/pipes/Table/view.tsx
const QueryStat: FC = () => {
  const results: Record<string, any> = {}
  const processTime = 0

  const tableColumn = results?.parsed?.table?.getColumn('table') || []
  const lastTableValue = tableColumn[tableColumn.length - 1] || -1

  let tableNum = 0

  if (typeof lastTableValue === 'string') {
    tableNum = parseInt(lastTableValue) + 1
  } else if (typeof lastTableValue === 'boolean') {
    tableNum = lastTableValue ? 1 : 0
  } else {
    // number
    tableNum = lastTableValue + 1
  }

  return (
    <div className="query-stat">
      <span className="query-stat--bold">{`${tableNum} tables`}</span>
      <span className="query-stat--bold">{`${results?.parsed?.table?.length ||
        0} rows`}</span>
      <span className="query-stat--normal">{`${processTime} ms`}</span>
    </div>
  )
}

const EmptyResults: FC = () => {
  return (
    <div className="data-explorer-results--empty">
      <div className="data-explorer-results--empty-header">
        <h3>Query Results</h3>
        <p>Select data and run query to view results</p>
      </div>
    </div>
  )
}

const Results: FC = () => {
  const [search, setSearch] = useState('')
  const {result, status} = useContext(ResultsContext)

  let resultView

  if (status === RemoteDataState.NotStarted) {
    resultView = <EmptyResults />
  } else {
    resultView = (
      <View
        loading={status}
        properties={
          {
            type: 'simple-table',
            showAll: false,
          } as SimpleTableViewProperties
        }
        result={result.parsed}
      />
    )
  }

  return (
    <div className="data-explorer-results">
      <FlexBox direction={FlexDirection.Column} style={{height: '100%'}}>
        <div className="data-explorer-results--header">
          <FlexBox>
            <div style={{width: '300px'}}>
              <SearchWidget
                placeholderText="Search results..."
                onSearch={setSearch}
                searchTerm={search}
                status={
                  status === RemoteDataState.Done
                    ? ComponentStatus.Default
                    : ComponentStatus.Disabled
                }
              />
            </div>
            <QueryStat />
            <div className="data-explorer-results--timezone">
              <TimeZoneDropdown />
            </div>
          </FlexBox>
        </div>
        {resultView}
      </FlexBox>
    </div>
  )
}

export default Results
