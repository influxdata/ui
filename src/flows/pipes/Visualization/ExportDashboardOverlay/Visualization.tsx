// Libraries
import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react'
import {ComponentSize, TechnoSpinner} from '@influxdata/clockface'

// Components
import EmptyQueryView, {ErrorFormat} from 'src/shared/components/EmptyQueryView'
import ViewSwitcher from 'src/shared/components/ViewSwitcher'
import QueryProvider, {QueryContext} from 'src/flows/context/query'
import {PopupContext} from 'src/flows/context/popup'

// Utilities
import {checkResultsLength} from 'src/shared/utils/vis'

// Types
import {RemoteDataState, TimeZone} from 'src/types'
import {FluxResult} from 'src/types/flows'

const Visualization: FC = () => {
  const [results, setResults] = useState<FluxResult>(null)
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)
  const {data} = useContext(PopupContext)
  const {query} = useContext(QueryContext)
  const queryText = useRef<string>('')

  const queryAndSetResults = useCallback(async () => {
    setLoading(RemoteDataState.Loading)
    const result = await query(queryText.current)
    setLoading(RemoteDataState.Done)
    setResults(result)
  }, [setLoading, setResults, query])

  useEffect(() => {
    // data.query gets updated often but doesn't actually change
    // this limits querying to when the query actually changes
    if (!queryText.current) {
      queryText.current = data.query
      queryAndSetResults()
    }
  }, [data, data.query, queryAndSetResults])

  let body = (
    <TechnoSpinner strokeWidth={ComponentSize.Small} diameterPixels={32} />
  )

  if (results) {
    body = (
      <ViewSwitcher
        giraffeResult={results.parsed}
        files={[results.raw]}
        properties={data.properties}
        timeZone={'Local' as TimeZone}
        theme="dark"
      />
    )
  }

  return (
    <div className="flow-visualization" style={{height: 220}}>
      <div className="flow-visualization--view">
        <EmptyQueryView
          loading={loading}
          errorMessage={results?.error}
          errorFormat={ErrorFormat.Scroll}
          hasResults={checkResultsLength(results?.parsed)}
        >
          {body}
        </EmptyQueryView>
      </div>
    </div>
  )
}

export default () => (
  <QueryProvider>
    <Visualization />
  </QueryProvider>
)
