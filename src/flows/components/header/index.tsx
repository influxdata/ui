// Libraries
import React, {FC, useContext, useCallback} from 'react'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {TimeProvider, TimeContext, TimeBlock} from 'src/flows/context/time'
import AppSettingProvider from 'src/flows/context/app'

// Components
import {Page} from '@influxdata/clockface'
import TimeZoneDropdown from 'src/flows/components/header/TimeZoneDropdown'
import TimeRangeDropdown from 'src/flows/components/header/TimeRangeDropdown'
import AutoRefreshDropdown from 'src/flows/components/header/AutoRefreshDropdown'
import Submit from 'src/flows/components/header/Submit'
import PresentationMode from 'src/flows/components/header/PresentationMode'
import RenamablePageTitle from 'src/pageLayout/components/RenamablePageTitle'

const FULL_WIDTH = true

export interface TimeContextProps {
  context: TimeBlock
  update: (data: TimeBlock) => void
}

const FlowHeader: FC = () => {
  const {id, update, flow} = useContext(FlowContext)
  const {timeContext, addTimeContext, updateTimeContext} = useContext(
    TimeContext
  )

  const updateTime = useCallback(
    (data: TimeBlock) => {
      updateTimeContext(id, data)
    },
    [id, updateTimeContext]
  )

  if (!timeContext.hasOwnProperty(id)) {
    addTimeContext(id)
    return null
  }

  const handleRename = (name: string) => {
    update({...flow, name})
  }

  return (
    <>
      <Page.Header fullWidth={FULL_WIDTH}>
        <RenamablePageTitle
          onRename={handleRename}
          name={flow.name}
          placeholder="Name this Flow"
          maxLength={50}
        />
      </Page.Header>
      <Page.ControlBar fullWidth={FULL_WIDTH}>
        <Page.ControlBarLeft>
          <Submit />
        </Page.ControlBarLeft>
        <Page.ControlBarRight>
          <PresentationMode />
          <TimeZoneDropdown />
          <TimeRangeDropdown context={timeContext[id]} update={updateTime} />
          <AutoRefreshDropdown context={timeContext[id]} update={updateTime} />
        </Page.ControlBarRight>
      </Page.ControlBar>
    </>
  )
}

export default () => (
  <TimeProvider>
    <AppSettingProvider>
      <FlowHeader />
    </AppSettingProvider>
  </TimeProvider>
)
