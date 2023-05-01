// Libraries
import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'

// Utils
import {CLOUD} from 'src/shared/constants'
import {UsageContext} from 'src/usage/context/usage'

// Components
import {
  FlexBox,
  FlexDirection,
  ComponentSize,
  AlignItems,
  Heading,
  HeadingElement,
  InfluxColors,
} from '@influxdata/clockface'
import {AnnouncementCenter} from 'src/me/components/AnnouncementCenter'
import {AnnouncementBlock} from 'src/me/components/AnnouncementBlock'
import {BlogFeed} from 'src/me/components/BlogFeed'
import UsagePanel from 'src/me/components/UsagePanel'
import DocSearchWidget from 'src/me/components/DocSearchWidget'
import VersionInfo from 'src/shared/components/VersionInfo'

// Utils
import {isOrgIOx} from 'src/organizations/selectors'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

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
          <AnnouncementBlock
            body={
              <>
                <p>
                  Get the high performance of InfluxDB serverless in a
                  single-tenant service with InfluxDB Cloud Dedicated. It lets
                  you <strong>isolate your data</strong>,{' '}
                  <strong>customize configurations</strong>,{' '}
                  <strong>enable regulatory</strong> or{' '}
                  <strong>data residency requirements</strong>, and{' '}
                  <strong>ensure the capacity you need</strong> is always
                  available.
                </p>
                <p>
                  <SafeBlankLink href="https://www.influxdata.com/contact-sales-cloud-dedicated/?utm_source=in-app&utm_medium=product&utm_campaign=2023-05-23_Webinar_Introducing-InfluxDB-Cloud-Dedicated">
                    Join our webinar
                  </SafeBlankLink>{' '}
                  on May 23, 2023 8:00 am PT / 3:00 pm GMT to learn more.
                </p>
              </>
            }
            ctaLink="https://www.influxdata.com/blog/introducing-influxdb-3-0/?utm_source=in-app&utm_medium=product&utm_campaign=2023-04-26_blog_Introducing-3-0_global"
            iconColor={InfluxColors.Chartreuse}
            title="Introducing InfluxDB Cloud Dedicated"
          />
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
