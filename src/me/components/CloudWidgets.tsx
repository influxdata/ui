// Libraries
import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'

// Utils
import {CLOUD} from 'src/shared/constants'
import {UsageContext} from 'src/usage/context/usage'

// Components
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  Heading,
  HeadingElement,
} from '@influxdata/clockface'
import {AnnouncementCenter} from 'src/me/components/AnnouncementCenter'
import {BlogFeed} from 'src/me/components/BlogFeed'
import {CurrentAnnouncement} from 'src/me/components/CurrentAnnouncement'
import DocSearchWidget from 'src/me/components/DocSearchWidget'
import UsagePanel from 'src/me/components/UsagePanel'
import VersionInfo from 'src/shared/components/VersionInfo'

// Utils
import {isOrgIOx} from 'src/organizations/selectors'

export const CloudWidgets: FC = () => {
  const {paygCreditEnabled} = useContext(UsageContext)
  const isIOxOrg = useSelector(isOrgIOx)

  return (
    <FlexBox
      alignItems={AlignItems.Stretch}
      direction={FlexDirection.Column}
      margin={ComponentSize.Large}
      stretchToFitWidth={true}
      stretchToFitHeight={true}
    >
      {isIOxOrg ? (
        <AnnouncementCenter>
          <Heading element={HeadingElement.H3}>What's New</Heading>
          <CurrentAnnouncement />
          <BlogFeed />
        </AnnouncementCenter>
      ) : (
        <DocSearchWidget />
      )}
      {CLOUD && paygCreditEnabled && <UsagePanel />}
      <VersionInfo />
    </FlexBox>
  )
}
