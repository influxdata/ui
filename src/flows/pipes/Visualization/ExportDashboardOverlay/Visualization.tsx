// Libraries
import React, {FC, useCallback, useContext, useEffect, useState} from 'react'

// Components
import QueryProvider, {QueryContext} from 'src/flows/context/query'
import {PopupContext} from 'src/flows/context/popup'
import {AppSettingContext} from 'src/flows/context/app'
import {View} from 'src/visualization'

// Types
import {RemoteDataState} from 'src/types'
import {FluxResult} from 'src/types/flows'

const Visualization: FC = () => {
  const [results, setResults] = useState<FluxResult>(null)
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)
  const {data} = useContext(PopupContext)
  const {query} = useContext(QueryContext)
  const {timeZone} = useContext(AppSettingContext)

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
    queryAndSetResults(data.query)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flow-visualization" style={{height: 220}}>
      <div className="flow-visualization--view">
        <View
          loading={loading}
          error={results?.error}
          properties={data.properties}
          result={results.parsed}
          timeRange={data.range}
          timeZone={timeZone}
        />
      </div>
    </div>
  )
}

export default () => (
  <QueryProvider>
    <Visualization />
  </QueryProvider>
)
