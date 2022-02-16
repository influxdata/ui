// Libraries
import React, {FC, useContext} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {FlowListContext} from 'src/flows/context/flow.list'
import {AppSettingProvider} from 'src/shared/contexts/app'

// Components
import {
  ComponentColor,
  Page,
  SquareButton,
  IconFont,
} from '@influxdata/clockface'

import AutoRefreshButton from 'src/flows/components/header/AutoRefreshButton'
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'
import TimeRangeDropdown from 'src/flows/components/header/TimeRangeDropdown'
import Submit from 'src/flows/components/header/Submit'

// Utility
import {event} from 'src/cloud/utils/reporting'
import {getOrg} from 'src/organizations/selectors'

// Constants
import {DEFAULT_PROJECT_NAME, PROJECT_NAME_PLURAL} from 'src/flows'

const FlowHeader: FC = () => {
  const {clone} = useContext(FlowListContext)
  const {flow} = useContext(FlowContext)
  const history = useHistory()
  const {id: orgID} = useSelector(getOrg)

  const handleClone = async () => {
    event('clone_notebook')
    const clonedId = await clone(flow.id)
    history.push(
      `/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${clonedId}`
    )
  }

  const handleRevert = () => {
    console.warn('reverting') // TODO(ariel): finish this in the next PR
  }

  if (!flow) {
    return null
  }

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
          <TimeRangeDropdown />
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
    </>
  )
}

export default () => (
  <AppSettingProvider>
    <FlowHeader />
  </AppSettingProvider>
)
