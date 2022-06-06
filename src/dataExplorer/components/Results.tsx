import React, {FC, useState, useContext} from 'react'
import {
  FlexBox,
  FlexDirection,
  SelectGroup,
  Button,
  IconFont,
  ComponentStatus,
  ComponentColor,
} from '@influxdata/clockface'

import {RemoteDataState, SimpleTableViewProperties} from 'src/types'
import {ResultsContext} from 'src/dataExplorer/components/ResultsContext'

import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'
import {
  View,
  ViewTypeDropdown,
  SUPPORTED_VISUALIZATIONS,
} from 'src/visualization'

import './Results.scss'

// simplified version migrated from src/flows/pipes/Table/view.tsx
const QueryStat: FC = () => {
  const {result, time} = useContext(ResultsContext)

  const tableColumn = result?.parsed?.table?.getColumn('table') || []
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
      <span className="query-stat--bold">{`${result?.parsed?.table?.length ||
        0} rows`}</span>
      <span className="query-stat--normal">{`${time} ms`}</span>
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
  const [vizState, setVizState] = useState('table')
  const [viewProperties, setViewProperties] = useState(
    SUPPORTED_VISUALIZATIONS['xy'].initial
  )

  let resultView

  if (status === RemoteDataState.NotStarted) {
    resultView = <EmptyResults />
  } else {
    if (vizState === 'table') {
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
    } else {
      resultView = (
        <div style={{height: '100%', width: '100%', padding: 12}}>
          <View
            loading={status}
            properties={viewProperties}
            result={result.parsed}
          />
        </div>
      )
    }
  }

  const dataExists = result.parsed && Object.entries(result.parsed).length
  const updateType = viewType => {
    setViewProperties(SUPPORTED_VISUALIZATIONS[viewType].initial)
  }
  const launcher = () => {}

  const tableHeader =
    vizState === 'table' ? (
      <>
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
      </>
    ) : null

  const vizHeader =
    vizState === 'graph' ? (
      <>
        <ViewTypeDropdown
          viewType={viewProperties.type}
          onUpdateType={updateType}
        />
        <Button
          text="Customize"
          icon={IconFont.CogSolid_New}
          onClick={launcher}
          status={
            dataExists ? ComponentStatus.Default : ComponentStatus.Disabled
          }
          color={ComponentColor.Default}
          titleText={
            dataExists ? 'Configure Visualization' : 'No data to visualize yet'
          }
          className="de-config-visualization-button"
        />
      </>
    ) : null

  return (
    <div className="data-explorer-results">
      <FlexBox direction={FlexDirection.Column} style={{height: '100%'}}>
        <div className="data-explorer-results--header">
          <FlexBox>
            {tableHeader}
            {vizHeader}
            <div className="data-explorer-results--timezone">
              <TimeZoneDropdown />
              <SelectGroup style={{marginRight: 12}}>
                <SelectGroup.Option
                  id="table"
                  name="viz-setting"
                  value="table"
                  active={vizState === 'table'}
                  onClick={setVizState}
                >
                  Table
                </SelectGroup.Option>
                <SelectGroup.Option
                  id="graph"
                  name="viz-setting"
                  value="graph"
                  active={vizState === 'graph'}
                  onClick={setVizState}
                >
                  Graph
                </SelectGroup.Option>
              </SelectGroup>
            </div>
          </FlexBox>
        </div>
        {resultView}
      </FlexBox>
    </div>
  )
}

export default Results
