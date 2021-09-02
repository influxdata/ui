import React, {FC} from 'react'
import {FlowContext} from 'src/flows/context/flow.current'
import {DEFAULT_PROJECT_NAME} from 'src/flows'

import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'
import {PIPE_DEFINITIONS} from 'src/flows'
import {hydrate} from 'src/flows/context/flow.list'
import {default as _asResource} from 'src/flows/context/resource.hook'

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
  console.log('dope', EXAMPLE_FLOW)
  return (
    <FlowContext.Provider
      value={{
        id: 'YOUR MOM',
        name: DEFAULT_PROJECT_NAME,
        flow: {
          ...EXAMPLE_FLOW,
          data: _asResource(EXAMPLE_FLOW.data, _ => {}),
          meta: _asResource(EXAMPLE_FLOW.meta, _ => {}),
        },
        add: (_, __) => '',
        update: _ => {},
      }}
    >
      {children}
    </FlowContext.Provider>
  )
}
