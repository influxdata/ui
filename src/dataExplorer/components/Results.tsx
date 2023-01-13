import React, {FC, useState, useContext, useMemo} from 'react'
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
import {ResultsContext} from 'src/dataExplorer/context/results'
import {ResultsViewContext} from 'src/dataExplorer/context/resultsView'
import {SidebarContext} from 'src/dataExplorer/context/sidebar'
import {PersistanceContext} from 'src/dataExplorer/context/persistance'
import {SearchWidget} from 'src/shared/components/search_widget/SearchWidget'
import {
  View,
  ViewTypeDropdown,
  ViewOptions,
  SUPPORTED_VISUALIZATIONS,
} from 'src/visualization'
import {FluxResult} from 'src/types/flows'

import './Results.scss'
import {bytesFormatter} from 'src/shared/copy/notifications'

const QueryStat: FC = () => {
  const {result} = useContext(ResultsContext)

  const tableColumn = result?.parsed?.table?.getColumn('table') || []
  const lastTableValue = tableColumn[tableColumn.length - 1]

  let tableNum = 0

  if (typeof lastTableValue === 'string') {
    tableNum = parseInt(lastTableValue) + 1
  } else if (typeof lastTableValue === 'boolean') {
    console.error('Cannot extract tableId. Check parsed csv output.')
  } else if (typeof lastTableValue === 'number') {
    tableNum = lastTableValue + 1
  }

  return (
    <div className="query-stat" data-testid="query-stat">
      {result?.truncated ? (
        <span className="query-stat--bold">{`Max. display limit exceeded. Result truncated to ${bytesFormatter(
          result.bytes
        )}.`}</span>
      ) : (
        <>
          <span className="query-stat--bold">{`${tableNum} tables`}</span>
          <span className="query-stat--bold">{`${
            result?.parsed?.table?.length || 0
          } rows`}</span>
        </>
      )}
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

const TableResults: FC<{search: string}> = ({search}) => {
  const {result, status} = useContext(ResultsContext)
  const {range} = useContext(PersistanceContext)

  const res = useMemo(() => {
    if (!search.trim() || !result?.parsed) {
      return result?.parsed
    }

    const dupped = {
      fluxGroupKeyUnion: [...result.parsed.fluxGroupKeyUnion],
      resultColumnNames: [...result.parsed.resultColumnNames],
      table: {
        length: 0,
        columns: Object.entries(result.parsed.table.columns).reduce(
          (acc, [k, v]) => {
            acc[k] = {...v, data: []}
            return acc
          },
          {}
        ),
      },
    }

    const len = result.parsed.table.length
    const keys = Object.keys(result.parsed.table.columns)
    let newLen = 0,
      ni = 0

    const _search = search.toLocaleLowerCase()
    const oldCols = result.parsed.table.columns
    const newCols = dupped.table.columns

    for (; ni < len; ni++) {
      if (
        !keys.reduce(
          (acc, curr) =>
            acc ||
            ('' + oldCols[curr].data[ni]).toLocaleLowerCase().includes(_search),
          false
        )
      ) {
        continue
      }

      keys.forEach(k => (newCols[k].data[newLen] = oldCols[k].data[ni]))
      newLen++
    }

    dupped.table.length = newLen

    return dupped as FluxResult['parsed']
  }, [search, result?.parsed])

  return (
    <div className="data-explorer-results--view">
      <View
        loading={status}
        properties={
          {
            type: 'simple-table',
            showAll: false,
          } as SimpleTableViewProperties
        }
        result={res}
        timeRange={range}
        hideTimer
      />
    </div>
  )
}

const GraphResults: FC = () => {
  const {view} = useContext(ResultsViewContext)
  const {result, status} = useContext(ResultsContext)
  const {range} = useContext(PersistanceContext)

  return (
    <div className="data-explorer-results--view">
      <View
        loading={status}
        properties={view.properties}
        result={result?.parsed}
        timeRange={range}
        hideTimer
      />
    </div>
  )
}

const WrappedOptions: FC = () => {
  const {result} = useContext(ResultsContext)
  const {view, setView} = useContext(ResultsViewContext)

  return (
    <ViewOptions
      properties={view.properties}
      results={result.parsed}
      update={update => {
        setView({
          ...view,
          properties: {
            ...view.properties,
            ...update,
          },
        })
      }}
    />
  )
}

const GraphHeader: FC = () => {
  const {view, setView} = useContext(ResultsViewContext)
  const {result} = useContext(ResultsContext)
  const {launch} = useContext(SidebarContext)

  const launcher = () => {
    launch(<WrappedOptions />)
  }

  const updateType = viewType => {
    setView({
      state: 'graph',
      properties: SUPPORTED_VISUALIZATIONS[viewType].initial,
    })
  }

  const dataExists = !!result?.parsed

  return (
    <>
      <ViewTypeDropdown
        viewType={view.properties.type}
        onUpdateType={updateType}
      />
      <Button
        text="Customize"
        icon={IconFont.CogSolid_New}
        onClick={launcher}
        status={dataExists ? ComponentStatus.Default : ComponentStatus.Disabled}
        color={ComponentColor.Default}
        titleText={
          dataExists ? 'Configure Visualization' : 'No data to visualize yet'
        }
        className="de-config-visualization-button"
      />
    </>
  )
}

const Results: FC = () => {
  const [search, setSearch] = useState('')
  const {status} = useContext(ResultsContext)
  const {view, setView} = useContext(ResultsViewContext)

  let resultView

  if (status === RemoteDataState.NotStarted) {
    resultView = <EmptyResults />
  } else {
    if (view.state === 'table') {
      resultView = <TableResults search={search} />
    } else {
      resultView = <GraphResults />
    }
  }

  const updateViewState = state => {
    if (state === 'graph') {
      setView({
        state: 'graph',
        properties: SUPPORTED_VISUALIZATIONS['xy'].initial,
      })
    } else {
      setView({
        state: 'table',
        properties: SUPPORTED_VISUALIZATIONS['simple-table'].initial,
      })
    }
  }

  const Header =
    view.state === 'table' ? (
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
    ) : (
      <GraphHeader />
    )

  return (
    <div className="data-explorer-results">
      <FlexBox direction={FlexDirection.Column} style={{height: '100%'}}>
        <div className="data-explorer-results--header">
          <FlexBox>
            {Header}
            <div className="data-explorer-results--timezone">
              <SelectGroup style={{marginRight: 12}}>
                <SelectGroup.Option
                  id="table"
                  name="viz-setting"
                  value="table"
                  active={view.state === 'table'}
                  onClick={updateViewState}
                >
                  Table
                </SelectGroup.Option>
                <SelectGroup.Option
                  id="graph"
                  name="viz-setting"
                  value="graph"
                  active={view.state === 'graph'}
                  onClick={updateViewState}
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
