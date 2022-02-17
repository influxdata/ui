// Libraries
import React, {FC, useContext} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {VersionPublishProvider} from 'src/flows/context/version.publish'
import PublishedVersions from 'src/flows/components/header/PublishedVersions'

// Components
import {
  ComponentColor,
  Dropdown,
  Page,
  SquareButton,
  IconFont,
  ComponentStatus,
} from '@influxdata/clockface'

import AutoRefreshButton from 'src/flows/components/header/AutoRefreshButton'
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'
import Submit from 'src/flows/components/header/Submit'

// Utility
import {event} from 'src/cloud/utils/reporting'
import {getOrg} from 'src/organizations/selectors'
import {getTimeRangeLabel} from 'src/shared/utils/duration'

// Constants
import {DEFAULT_PROJECT_NAME, PROJECT_NAME_PLURAL} from 'src/flows'
import {AppSettingContext} from 'src/shared/contexts/app'

const VersionHeader: FC = () => {
  const {timeZone} = useContext(AppSettingContext)
  const {flow} = useContext(FlowContext)
  // const history = useHistory()
  // const {id: orgID} = useSelector(getOrg)

  const handleClone = () => {
    event('clone_notebook_version')
    // const clonedId = await clone(flow.id)
    // TODO(ariel): tweak this so we don't use the flowlist
    // history.push(
    //   `/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${clonedId}`
    // )
  }

  const handleRevert = () => {
    event('revert_notebook_version')
    console.warn('reverting') // TODO(ariel): finish this in the next PR
  }

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
          <SquareButton
            icon={IconFont.Duplicate_New}
            onClick={handleClone}
            color={ComponentColor.Primary}
            titleText="Clone"
          />
          <SquareButton
            icon={IconFont.Undo}
            onClick={handleRevert}
            color={ComponentColor.Danger}
            titleText="Clone"
          />
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
