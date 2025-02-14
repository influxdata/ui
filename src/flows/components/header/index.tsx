// Libraries
import React, {FC, useCallback, useContext, useEffect} from 'react'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {
  VersionPublishContext,
  VersionPublishProvider,
} from 'src/flows/context/version.publish'
import {AppSettingProvider} from 'src/shared/contexts/app'

// Components
import {
  ComponentColor,
  IconFont,
  Page,
  SquareButton,
} from '@influxdata/clockface'

import AutoRefreshButton from 'src/flows/components/header/AutoRefreshButton'
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'
import TimeRangeDropdown from 'src/flows/components/header/TimeRangeDropdown'
import Submit from 'src/flows/components/header/Submit'
import PresentationMode from 'src/flows/components/header/PresentationMode'
import RenamablePageTitle from 'src/pageLayout/components/RenamablePageTitle'
import {FeatureFlag} from 'src/shared/utils/featureFlag'
import MenuButton from 'src/flows/components/header/MenuButton'

// Utility
import {serialize} from 'src/flows/context/flow.list'

// Types
// Constants
import {DEFAULT_PROJECT_NAME} from 'src/flows'

const FlowHeader: FC = () => {
  const {flow, updateOther} = useContext(FlowContext)
  const {handlePublish} = useContext(VersionPublishContext)

  const handleSave = useCallback(
    event => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        handlePublish()
      }
    },
    [handlePublish]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleSave)

    return () => {
      window.removeEventListener('keydown', handleSave)
    }
  }, [handleSave])

  const handleRename = (name: string) => {
    updateOther({name})
  }
  const printJSON = () => {
    /* eslint-disable no-console */
    console.log(JSON.stringify(serialize(flow), null, 2))
    /* eslint-enable no-console */
  }

  if (!flow) {
    return null
  }

  return (
    <>
      <Page.Header fullWidth>
        <RenamablePageTitle
          onRename={handleRename}
          name={flow.name}
          placeholder={DEFAULT_PROJECT_NAME}
          maxLength={50}
        />
      </Page.Header>
      <Page.ControlBar fullWidth>
        <Page.ControlBarLeft>
          <Submit />
          <AutoRefreshButton />
          <div className="flow-header--saving">Autosaved</div>
        </Page.ControlBarLeft>
        <Page.ControlBarRight>
          <PresentationMode />
          <TimeZoneDropdown />
          <TimeRangeDropdown />
          <SquareButton
            icon={IconFont.Save}
            onClick={handlePublish}
            color={ComponentColor.Default}
            titleText="Save to version history"
          />
          {flow?.id && (
            <>
              <MenuButton />
            </>
          )}
          <FeatureFlag name="flow-snapshot">
            <SquareButton
              icon={IconFont.Export_New}
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
    <VersionPublishProvider>
      <FlowHeader />
    </VersionPublishProvider>
  </AppSettingProvider>
)
