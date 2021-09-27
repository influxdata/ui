import React, {FC, useEffect, useState} from 'react'
import {FlowContext} from 'src/flows/context/flow.current'
import {useParams} from 'react-router'
import {DEFAULT_PROJECT_NAME} from 'src/flows'
import PageSpinner from 'src/perf/components/PageSpinner'

import {hydrate} from 'src/flows/context/flow.list'
import {RemoteDataState} from 'src/types'

export const FlowProvider: FC = ({children}) => {
  const [flow, setFlow] = useState(null)
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)
  const {accessID} = useParams<{accessID: string}>()

  useEffect(() => {
    setLoading(RemoteDataState.Loading)
    fetch(`/api/share/${accessID}`)
      .then(res => res.json())
      .then(res => {
        setFlow(hydrate(res))
        setLoading(RemoteDataState.Done)
      })
      .catch(error => {
        console.error('failed to get notebook', error)
        setLoading(RemoteDataState.Error)
      })
  }, [])

  return (
    <PageSpinner loading={loading}>
      <FlowContext.Provider
        value={{
          name: DEFAULT_PROJECT_NAME,
          flow,
          add: (_, __) => '',
          remove: () => '',
          updateData: _ => {},
          updateMeta: _ => {},
          updateOther: _ => {},
          populate: _ => {},
        }}
      >
        {children}
      </FlowContext.Provider>
    </PageSpinner>
  )
}
