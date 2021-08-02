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
import {PROJECT_NAME} from 'src/flows'
import {serialize} from 'src/flows/context/flow.list'
import {FeatureFlag} from 'src/shared/utils/featureFlag'
<<<<<<< HEAD
import {updatePinnedItemByParam} from 'src/shared/contexts/pinneditems'
=======
import {getOrg} from 'src/organizations/selectors'
>>>>>>> master

const FULL_WIDTH = true

const FlowHeader: FC = () => {
<<<<<<< HEAD
  const {update, flow, id} = useContext(FlowContext)
=======
  const {update, flow} = useContext(FlowContext)
  const {id} = useSelector(getOrg)
>>>>>>> master

  const handleRename = async (name: string) => {
    update({name})
    await updatePinnedItemByParam(id, {name})
  }

  const printJSON = () => {
    /* eslint-disable no-console */
    console.log(JSON.stringify(serialize(flow, id), null, 2))
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
          placeholder={`Name this ${PROJECT_NAME}`}
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
