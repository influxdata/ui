import React, {FC, useContext, useEffect, useMemo, useState} from 'react'
import {
  Button,
  ComponentColor,
  ComponentStatus,
  FlexBox,
  FlexDirection,
  IconFont,
  SelectGroup,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'
import classNames from 'classnames'

// Components
import {SearchWidget} from 'src/shared/components/search_widget/SearchWidget'
import {
  View,
  ViewTypeDropdown,
  ViewOptions,
  SUPPORTED_VISUALIZATIONS,
} from 'src/visualization'
import {SqlViewOptions} from 'src/dataExplorer/components/SqlViewOptions'

// Contexts
import {ResultsContext} from 'src/dataExplorer/context/results'
import {
  ResultsViewContext,
  ViewStateType,
} from 'src/dataExplorer/context/resultsView'
import {ChildResultsContext} from 'src/dataExplorer/context/results/childResults'
import {SidebarContext} from 'src/dataExplorer/context/sidebar'
import {PersistenceContext} from 'src/dataExplorer/context/persistence'

// Types
import {FluxResult} from 'src/types/flows'
import {RemoteDataState, SimpleTableViewProperties} from 'src/types'
import {LanguageType} from 'src/dataExplorer/components/resources'

// Utils
import {bytesFormatter} from 'src/shared/copy/notifications'

import './Results.scss'

const QueryStat: FC = () => {
  const {result} = useContext(ResultsContext)
  const {resource} = useContext(PersistenceContext)

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
          {resource?.language === LanguageType.INFLUXQL ? null : (
            <span className="query-stat--bold">{`${tableNum} tables`}</span>
          )}
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
  const {range, resource} = useContext(PersistenceContext)

  const res = useMemo(() => {
    if (search.trim() === '' || !result?.parsed) {
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

  const resultsViewClassNames = classNames('data-explorer-results--view', {
    'hide-table-header-label': resource?.language === LanguageType.INFLUXQL,
  })

  return (
    <div
      className={resultsViewClassNames}
      data-testid="data-explorer-results--view"
    >
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

const ErrorResults: FC<{error: string}> = ({error}) => {
  return (
    <div className="data-explorer-results--empty">
      <div className="data-explorer-results--empty-header">
        <h3>Graph Query Results</h3>
        <p>{error}</p>
      </div>
    </div>
  )
}

const GraphResults: FC = () => {
  const {view} = useContext(ResultsViewContext)
  const {result, status} = useContext(ChildResultsContext)
  const {range} = useContext(PersistenceContext)

  if (result?.error) {
    return <ErrorResults error={result.error} />
  }

  return (
    <div
      className="data-explorer-results--view"
      data-testid="data-explorer-results--view"
    >
      <SpinnerContainer loading={status} spinnerComponent={<TechnoSpinner />}>
        <View
          loading={status}
          properties={view.properties}
          result={result?.parsed}
          timeRange={range}
          hideTimer
        />
      </SpinnerContainer>
    </div>
  )
}

const WrappedOptions: FC = () => {
  const {result: parentResult} = useContext(ResultsContext)
  const {result} = useContext(ChildResultsContext)
  const {view, setView, selectViewOptions, viewOptions, selectedViewOptions} =
    useContext(ResultsViewContext)
  const {resource} = useContext(PersistenceContext)
  const graphDataExists = !!result?.parsed
  const parentDataExists = !!parentResult?.parsed

  const updateChildResults = update => {
    setView({
      ...view,
      properties: {
        ...view.properties,
        ...update,
      },
    })
  }

  const subQueryOptions =
    resource?.language === LanguageType.SQL &&
    view.state == ViewStateType.Graph ? (
      <SqlViewOptions
        selectViewOptions={selectViewOptions}
        allViewOptions={viewOptions}
        selectedViewOptions={selectedViewOptions}
      />
    ) : null

  return (
    <>
      {subQueryOptions}
      {graphDataExists ? (
        <ViewOptions
          properties={view.properties}
          results={result.parsed}
          update={updateChildResults}
        />
      ) : (
        <div className="view-options">
          <p>Data cannot be graphed. Requires 2+ data points.</p>
          {parentDataExists && viewOptions.smoothing.applied && (
            <p>
              If you are using Graph Smooth, please increase the percentage
              retained or turn it off.
            </p>
          )}
        </div>
      )}
    </>
  )
}

const NOT_SUPPORTED_GRAPH_TYPES = [
  SUPPORTED_VISUALIZATIONS.check.type,
  SUPPORTED_VISUALIZATIONS.gauge.type,
  SUPPORTED_VISUALIZATIONS.geo.type,
  SUPPORTED_VISUALIZATIONS.mosaic.type,
  SUPPORTED_VISUALIZATIONS['single-stat'].type,
]
const GraphHeader: FC = () => {
  const {view, setView} = useContext(ResultsViewContext)
  const {result} = useContext(ResultsContext)
  const {result: subQueryResult} = useContext(ChildResultsContext)
  const {launch, clear: closeSidebar} = useContext(SidebarContext)

  const dataExists =
    !!result?.parsed && result.parsed.resultColumnNames.length > 0

  const launcher = () => {
    launch(<WrappedOptions />)
  }

  useEffect(() => {
    if (dataExists) {
      launcher()
    } else {
      closeSidebar()
    }
  }, [result])

  const updateType = viewType => {
    setView({
      state: ViewStateType.Graph,
      properties: SUPPORTED_VISUALIZATIONS[viewType].initial,
    })
  }

  const subqueryReturnsData = !!subQueryResult?.parsed
  let titleText = 'Configure Visualization'
  if (!dataExists) {
    titleText = 'No data to visualize yet'
  }
  if (!subqueryReturnsData) {
    titleText = 'Graph customization options returned no data'
  }

  const GraphQueryStat = () => (
    <div className="query-stat" data-testid="query-stat">
      {subQueryResult?.truncated ? (
        <span className="query-stat--bold">{`Max. display limit exceeded. Result truncated to ${bytesFormatter(
          subQueryResult.bytes
        )}.`}</span>
      ) : null}
    </div>
  )

  return (
    <>
      <ViewTypeDropdown
        viewType={view.properties.type}
        onUpdateType={updateType}
        filter={NOT_SUPPORTED_GRAPH_TYPES}
      />
      <Button
        text="Customize"
        icon={IconFont.CogSolid_New}
        onClick={launcher}
        status={dataExists ? ComponentStatus.Default : ComponentStatus.Disabled}
        color={ComponentColor.Default}
        titleText={titleText}
        className="de-config-visualization-button"
      />
      <GraphQueryStat />
    </>
  )
}

const Results: FC = () => {
  const [search, setSearch] = useState('')
  const {status} = useContext(ResultsContext)
  const {view, setView} = useContext(ResultsViewContext)
  const {resource} = useContext(PersistenceContext)

  let resultView

  if (status === RemoteDataState.NotStarted) {
    resultView = <EmptyResults />
  } else {
    if (view.state === ViewStateType.Table) {
      resultView = <TableResults search={search} />
    } else {
      resultView = <GraphResults />
    }
  }

  const updateViewState = state => {
    if (state === ViewStateType.Graph) {
      setView({
        state: ViewStateType.Graph,
        properties: SUPPORTED_VISUALIZATIONS['xy'].initial,
      })
    } else {
      setView({
        state: ViewStateType.Table,
        properties: SUPPORTED_VISUALIZATIONS['simple-table'].initial,
      })
    }
  }

  const headerStyle = {width: '300px'}
  const Header =
    view.state === ViewStateType.Table ? (
      <>
        <div style={headerStyle}>
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

  const flexContainerStyle = {height: '100%'}
  return (
    <div className="data-explorer-results" data-testid="data-explorer-results">
      <FlexBox direction={FlexDirection.Column} style={flexContainerStyle}>
        <div className="data-explorer-results--header">
          <FlexBox>
            {Header}
            <div className="data-explorer-results--timezone">
              <SelectGroup style={{marginRight: 12}}>
                <SelectGroup.Option
                  id="table"
                  name="viz-setting"
                  value="table"
                  active={view.state === ViewStateType.Table}
                  onClick={updateViewState}
                >
                  Table
                </SelectGroup.Option>
                {resource?.language === LanguageType.INFLUXQL ? null : (
                  <SelectGroup.Option
                    id="graph"
                    name="viz-setting"
                    value="graph"
                    active={view.state === ViewStateType.Graph}
                    onClick={updateViewState}
                    testID="data-explorer-results--graph-view"
                  >
                    Graph
                  </SelectGroup.Option>
                )}
              </SelectGroup>
            </div>
          </FlexBox>
        </div>
        {resultView}
      </FlexBox>
    </div>
  )
}

export {Results}
