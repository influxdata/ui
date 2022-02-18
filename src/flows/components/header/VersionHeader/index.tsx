// Libraries
import React, {FC, useContext} from 'react'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {VersionPublishProvider} from 'src/flows/context/version.publish'
import PublishedVersions from 'src/flows/components/header/PublishedVersions'

// Components
import {Dropdown, Page, IconFont, ComponentStatus} from '@influxdata/clockface'

import AutoRefreshButton from 'src/flows/components/header/AutoRefreshButton'
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'
import Submit from 'src/flows/components/header/Submit'
import CloneVersionButton from 'src/flows/components/header/VersionHeader/CloneButton'
import RevertVersionButton from 'src/flows/components/header/VersionHeader/RevertButton'

// Utility
import {getTimeRangeLabel} from 'src/shared/utils/duration'

// Constants
import {DEFAULT_PROJECT_NAME} from 'src/flows'
import {AppSettingContext} from 'src/shared/contexts/app'

const VersionHeader: FC = () => {
  const {timeZone} = useContext(AppSettingContext)
  const {flow} = useContext(FlowContext)

  if (!flow) {
    return null
  }

  const timeRangeLabel = getTimeRangeLabel(flow.range, timeZone)

  return (
    <>
      <Page.Header fullWidth>
        <Page.Title title={flow.name || DEFAULT_PROJECT_NAME} />
      </Page.Header>
      <Page.ControlBar fullWidth>
        <Page.ControlBarLeft>
          <Submit />
          <AutoRefreshButton />
        </Page.ControlBarLeft>
        <Page.ControlBarRight>
          <TimeZoneDropdown />
          <Dropdown.Button
            style={{width: `${flow.range.type === 'custom' ? 282 : 158}px`}}
            testID="timerange-dropdown"
            icon={IconFont.Clock_New}
            onClick={() => {}}
            status={ComponentStatus.Disabled}
          >
            {timeRangeLabel}
          </Dropdown.Button>
          <CloneVersionButton />
          <RevertVersionButton />
        </Page.ControlBarRight>
      </Page.ControlBar>
      <Page.ControlBar fullWidth>
        <Page.ControlBarRight>
          <VersionPublishProvider>
            <PublishedVersions />
          </VersionPublishProvider>
        </Page.ControlBarRight>
      </Page.ControlBar>
    </>
  )
}

export default VersionHeader
