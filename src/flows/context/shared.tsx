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
        type: 'toBucket',
        bucket: {
          type: 'user',
          name: 'frontendservices',
        },
        title: 'Output to Bucket 1',
        visible: true,
      },
      {
        text: '### beans',
        mode: 'preview',
        type: 'markdown',
        title: 'Markdown 1',
        visible: true,
      },
      {
        type: 'schedule',
        interval: '12h',
        title: 'Schedule 1',
        visible: true,
      },
      {
        type: 'rawFluxEditor',
        queries: [
          {
            text:
              '// Uncomment the following line to continue building from the previous cell\n// __PREVIOUS_RESULT__\n\nbuckets()',
            editMode: 'advanced',
            builderConfig: {
              tags: [],
              buckets: [],
              functions: [],
            },
          },
        ],
        activeQuery: 0,
        title: 'Flux Script 1',
        visible: true,
      },
      {
        type: 'region',
        region: 'https://twodotoh.a.influxcloud.dev.local',
        token: '',
        org: 'a15a024c8d891f39',
        source: 'self',
        title: 'Remote Database 1',
        visible: true,
      },
      {
        title: 'Select a Metric',
        visible: true,
        type: 'metricSelector',
        tags: {},
        field: '',
        measurement: 'go_info',
        bucket: {
          id: 'fe45a1673f1ad4ef',
          orgID: 'a15a024c8d891f39',
          type: 'user',
          name: 'devbucket',
        },
      },
      {
        mappings: {},
        type: 'columnEditor',
        title: 'Column Editor 1',
        visible: true,
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
    fetch(`${window.location.origin}/api/share/${accessID}`)
      .then(res => res.json())
      .then(res => {
        setFlow(hydrate(res))
        // setFlow(EXAMPLE_FLOW)
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
