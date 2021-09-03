// Libraries
import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {AppSettingProvider} from 'src/shared/contexts/app'

// Components
import {
  Page,
  SquareButton,
  IconFont,
  ComponentColor,
} from '@influxdata/clockface'
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'
import TimeRangeDropdown from 'src/flows/components/header/TimeRangeDropdown'
import Submit from 'src/flows/components/header/Submit'
import PresentationMode from 'src/flows/components/header/PresentationMode'
import RenamablePageTitle from 'src/pageLayout/components/RenamablePageTitle'
import {DEFAULT_PROJECT_NAME} from 'src/flows'
import {serialize} from 'src/flows/context/flow.list'
import {FeatureFlag} from 'src/shared/utils/featureFlag'
import {updatePinnedItemByParam} from 'src/shared/contexts/pinneditems'
import {getOrg} from 'src/organizations/selectors'

const FULL_WIDTH = true

const FlowHeader: FC = () => {
  const {flow, updateOther, id} = useContext(FlowContext)
  const {id: orgID} = useSelector(getOrg)

  const handleRename = (name: string) => {
    updateOther({name})
    try {
      updatePinnedItemByParam(id, {name})
    } catch (err) {
      console.error(err)
    }
  }

  const printJSON = () => {
    /* eslint-disable no-console */
    console.log(JSON.stringify(serialize(flow, orgID), null, 2))
    /* eslint-enable no-console */
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
          placeholder={DEFAULT_PROJECT_NAME}
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
          <TimeRangeDropdown />
          <FeatureFlag name="flow-snapshot">
            <SquareButton
              icon={IconFont.Export}
              onClick={printJSON}
              color={ComponentColor.Default}
              titleText="Export Notebook"
            />
          </FeatureFlag>
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
