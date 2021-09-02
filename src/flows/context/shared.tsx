import React, {FC, useEffect, useState} from 'react'
import {FlowContext} from 'src/flows/context/flow.current'
import {useParams} from 'react-router'
import {DEFAULT_PROJECT_NAME} from 'src/flows'
import PageSpinner from 'src/perf/components/PageSpinner'

import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'
import {PIPE_DEFINITIONS} from 'src/flows'
import {hydrate} from 'src/flows/context/flow.list'
import {RemoteDataState} from 'src/types'

const EXAMPLE_FLOW = hydrate({
  spec: {
    readOnly: false,
    range: DEFAULT_TIME_RANGE,
    refresh: AUTOREFRESH_DEFAULT,
    pipes: [
      {
        title: 'Select a Metric',
        visible: true,
        type: 'metricSelector',
        ...JSON.parse(
          JSON.stringify(PIPE_DEFINITIONS['metricSelector'].initial)
        ),
      },
      {
        title: 'Validate the Data',
        visible: true,
        type: 'visualization',
        properties: {type: 'simple-table', showAll: false},
      },
      {
        title: 'Visualize the Result',
        visible: true,
        type: 'visualization',
        ...JSON.parse(
          JSON.stringify(PIPE_DEFINITIONS['visualization'].initial)
        ),
      },
    ],
  },
})

export const FlowProvider: FC = ({children}) => {
  const [flow, setFlow] = useState(EXAMPLE_FLOW)
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)
  const {accessID} = useParams<{accessID: string}>()

  useEffect(() => {
    setLoading(RemoteDataState.Loading)
    fetch(`${window.location.origin}/share/${accessID}`)
      .then(res => res.json())
      .then(res => {
        console.log({res})
        // setFlow(hydrate(res.data))
        setFlow(EXAMPLE_FLOW)
        setLoading(RemoteDataState.Done)
      })
      .catch(error => {
        console.error({error})
        setLoading(RemoteDataState.Error)
      })
  }, [])

  return (
    <FlowContext.Provider
      value={{
        id: 'YOUR MOM',
        name: DEFAULT_PROJECT_NAME,
        flow,
        add: (_, __) => '',
        remove: () => '',
        updateData: _ => {},
        updateMeta: _ => {},
        updateOther: _ => {},
      }}
    >
      <PageSpinner loading={loading}>{children}</PageSpinner>
    </FlowContext.Provider>
  )
}
