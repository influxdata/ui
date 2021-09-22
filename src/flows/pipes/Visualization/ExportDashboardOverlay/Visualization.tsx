// Libraries
import React, {FC, useCallback, useContext, useEffect, useState} from 'react'

// Components
import QueryProvider from 'src/shared/contexts/query'
import {FlowQueryProvider, FlowQueryContext} from 'src/flows/context/flow.query'
import {PopupContext} from 'src/flows/context/popup'
import {View} from 'src/visualization'

// Types
import {RemoteDataState} from 'src/types'
import {FluxResult} from 'src/types/flows'
import GlobalQueryProvider from 'src/shared/contexts/global'

const Visualization: FC = () => {
  const [results, setResults] = useState<FluxResult>(null)
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)
  const {data} = useContext(PopupContext)
  const {query, getPanelQueries} = useContext(FlowQueryContext)

  const queryAndSetResults = useCallback(
    async text => {
      setLoading(RemoteDataState.Loading)
      const result = await query(text)
      setLoading(RemoteDataState.Done)
      setResults(result)
    },
    [setLoading, setResults, query]
  )

  useEffect(() => {
    queryAndSetResults(getPanelQueries(data.panel).visual)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flow-visualization" style={{height: 220}}>
      <div className="flow-visualization--view">
        <View
          loading={loading}
          error={results?.error}
          properties={data.properties}
          result={results?.parsed}
          timeRange={data.range}
        />
      </div>
    </div>
  )
}

export default () => (
  <QueryProvider>
    <GlobalQueryProvider>
      <FlowQueryProvider>
        <Visualization />
      </FlowQueryProvider>
    </GlobalQueryProvider>
  </QueryProvider>
)
