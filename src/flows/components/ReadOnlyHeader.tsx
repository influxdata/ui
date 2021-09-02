// Libraries
import React, {FC, useContext} from 'react'
import {Page} from '@influxdata/clockface'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'

import {DEFAULT_PROJECT_NAME} from 'src/flows'

const ReadOnlyHeader: FC = () => {
  const {flow} = useContext(FlowContext)

  return (
    <Page.Header fullWidth>
      <h1>{flow.name || DEFAULT_PROJECT_NAME}</h1>
    </Page.Header>
  )
}

export default ReadOnlyHeader
