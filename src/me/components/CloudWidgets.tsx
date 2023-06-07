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
                  Grafana now has a community plugin that enables communication
                  with Flight SQL-compatible databases.
                </p>
                <div>
                  What does that mean for you?
                  <ul>
                    <li>InfluxDB 3.0 Support and Compatibility</li>
                    <li>Easy Setup with Grafana Cloud</li>
                    <li>Enhanced Data Querying and Visualization</li>
                  </ul>
                </div>
              </>
            }
            ctaLink="https://www.influxdata.com/blog/now-available-flight-sql-plugin-grafana/?utm_source=in-app&utm_medium=product&utm_campaign=2023-04-35_blog_flight-sql-plugin-grafana"
            ctaText="Learn More"
            iconColor={InfluxColors.Chartreuse}
            title="Now Available: The Flight SQL Plugin for Grafana"
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
