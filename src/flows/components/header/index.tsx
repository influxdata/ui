// Libraries
import React, {FC, useContext} from 'react'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import AppSettingProvider from 'src/flows/context/app'
import QueryProvider from 'src/flows/context/query'

// Components
import {Page} from '@influxdata/clockface'
import TimeZoneDropdown from 'src/flows/components/header/TimeZoneDropdown'
import TimeRangeDropdown from 'src/flows/components/header/TimeRangeDropdown'
import AutoRefreshDropdown from 'src/flows/components/header/AutoRefreshDropdown'
import Submit from 'src/flows/components/header/Submit'
import PresentationMode from 'src/flows/components/header/PresentationMode'
import RenamablePageTitle from 'src/pageLayout/components/RenamablePageTitle'
import {PROJECT_NAME} from 'src/flows'

const FULL_WIDTH = true

const FlowHeader: FC = () => {
  const {update, flow} = useContext(FlowContext)

  const handleRename = (name: string) => {
    update({name})
  }

  if (!flow) {
    return null
  }

  return (
    <>
      <Page.Header fullWidth={FULL_WIDTH}>
        <RenamablePageTitle
          onRename={handleRename}
          name={flow.name}
          placeholder={`Name this ${PROJECT_NAME}`}
          maxLength={50}
        />
      </Page.Header>
      <Page.ControlBar fullWidth={FULL_WIDTH}>
        <Page.ControlBarLeft>
          <QueryProvider>
            <Submit />
          </QueryProvider>
        </Page.ControlBarLeft>
        <Page.ControlBarRight>
          <PresentationMode />
          <TimeZoneDropdown />
          <QueryProvider>
            <TimeRangeDropdown />
          </QueryProvider>
          <AutoRefreshDropdown />
        </Page.ControlBarRight>
      </Page.ControlBar>
    </>
  )
}

export default () => (
  <AppSettingProvider>
    <FlowHeader />
  </AppSettingProvider>
)
