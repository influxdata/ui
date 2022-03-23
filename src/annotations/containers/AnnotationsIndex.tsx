// Libraries
import React, {FC} from 'react'

// Components
import SettingsTabbedPage from 'src/settings/components/SettingsTabbedPage'
import SettingsHeader from 'src/settings/components/SettingsHeader'
import {Page} from '@influxdata/clockface'
import {AnnotationsTab} from 'src/annotations/components/AnnotationsTab'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

export const AnnotationsIndex: FC = () => {
  return (
    <>
      <Page titleTag={pageTitleSuffixer(['Annotations', 'Settings'])}>
        <SettingsHeader />
        <SettingsTabbedPage activeTab="annotations">
          {/*
              TODO: GetResources with ResourceType.AnnotationStreams
            */}
          <AnnotationsTab />
        </SettingsTabbedPage>
      </Page>
    </>
  )
}
