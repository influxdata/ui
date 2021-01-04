// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {Switch, Route} from 'react-router-dom'

// Components
import SettingsTabbedPage from 'src/settings/components/SettingsTabbedPage'
import SettingsHeader from 'src/settings/components/SettingsHeader'
import {Page} from '@influxdata/clockface'
import {
  CreateAnnotationStreamOverlay,
  UpdateAnnotationStreamOverlay,
} from 'src/overlays/components'
import {AnnotationsTab} from 'src/annotations/components/AnnotationsTab'

// Selectors
import {getOrg} from 'src/organizations/selectors'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Constants
import {ORGS, ORG_ID, SETTINGS, ANNOTATIONS} from 'src/shared/constants/routes'
const annotationsPath = `/${ORGS}/${ORG_ID}/${SETTINGS}/${ANNOTATIONS}`

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
      <Switch>
        <Route
          path={`${annotationsPath}/new`}
          component={CreateAnnotationStreamOverlay}
        />
        <Route
          path={`${annotationsPath}/:annotationID/edit`}
          component={UpdateAnnotationStreamOverlay}
        />
      </Switch>
    </>
  )
}
