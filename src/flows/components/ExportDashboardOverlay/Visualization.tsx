// Libraries
import React, {FC, useCallback, useContext, useEffect, useState} from 'react'
import {RouteProps, useLocation} from 'react-router-dom'
import {ComponentSize, TechnoSpinner} from '@influxdata/clockface'

// Components
import EmptyQueryView, {ErrorFormat} from 'src/shared/components/EmptyQueryView'
import ViewSwitcher from 'src/shared/components/ViewSwitcher'
import QueryProvider, {QueryContext} from 'src/flows/context/query'

// Utilities
import {checkResultsLength} from 'src/shared/utils/vis'

// Types
import {RemoteDataState, TimeZone} from 'src/types'

const Visualization: FC = () => {
  const location: RouteProps['location'] = useLocation()
  const [results, setResults] = useState(undefined)
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)
  const params = location.state
  const {queryText, properties} = params[0]
  const {query} = useContext(QueryContext)

  const queryAndSetResults = useCallback(
    async (text: string) => {
      setLoading(RemoteDataState.Loading)
      const result = await query(text)
      setLoading(RemoteDataState.Done)
      setResults(result)
    },
    [setLoading, setResults, query]
  )

  useEffect(() => {
    queryAndSetResults(queryText)
  }, [queryText, queryAndSetResults])

  let body = (
    <TechnoSpinner strokeWidth={ComponentSize.Small} diameterPixels={32} />
  )

  if (results) {
    body = (
      <ViewSwitcher
        giraffeResult={results.parsed}
        files={[results.raw]}
        properties={properties}
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
