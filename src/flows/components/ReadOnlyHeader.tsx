// Libraries
import React, {FC, useContext} from 'react'
import {Page} from '@influxdata/clockface'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'

// Components
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'
import TimeRangeLabel from 'src/flows/components/header/TimeRangeLabel'

import {DEFAULT_PROJECT_NAME} from 'src/flows'

const ReadOnlyHeader: FC = () => {
  const {flow} = useContext(FlowContext)

  return (
    <>
      <Page.Header fullWidth>
        <Page.Title title={flow.name || DEFAULT_PROJECT_NAME} />
      </Page.Header>
      <Page.ControlBar fullWidth>
        <Page.ControlBarRight>
          <TimeRangeLabel />
          <TimeZoneDropdown />
        </Page.ControlBarRight>
      </Page.ControlBar>
    </>
  )
}

export default ReadOnlyHeader
