// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'

// Components
import SettingsTabbedPage from 'src/settings/components/SettingsTabbedPage'
import SettingsHeader from 'src/settings/components/SettingsHeader'
import {Page} from '@influxdata/clockface'
import {AnnotationsTab} from 'src/annotations/components/AnnotationsTab'

// Selectors
import {getOrg} from 'src/organizations/selectors'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

export const AnnotationsIndex: FC = () => {
  const org = useSelector(getOrg)

  return (
    <>
      <Page titleTag={pageTitleSuffixer(['Annotations', 'Settings'])}>
        <SettingsHeader />
        <SettingsTabbedPage activeTab="annotations" orgID={org.id}>
          {/*
              TODO: GetResources with ResourceType.AnnotationStreams
            */}
          <AnnotationsTab />
        </SettingsTabbedPage>
      </Page>
    </>
  )
}
