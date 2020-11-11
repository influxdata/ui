// Libraries
import React, {FC, useCallback, useContext, useEffect, useState} from 'react'
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

const Visualization: FC = () => {
  const [results, setResults] = useState(undefined)
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)
  const {data} = useContext(PopupContext)
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
    queryAndSetResults(data.query)
  }, [data.query, queryAndSetResults])

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
