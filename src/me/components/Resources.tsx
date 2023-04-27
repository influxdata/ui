// Libraries
import React, {FC, memo, useContext} from 'react'
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
} from '@influxdata/clockface'
import AnnouncementCenter from './AnnouncementCenter'
import AnnouncementBlock from './AnnouncementBlock'
import UsagePanel from 'src/me/components/UsagePanel'
import DocSearchWidget from 'src/me/components/DocSearchWidget'
import VersionInfo from 'src/shared/components/VersionInfo'

// Utils
import {isOrgIOx} from 'src/organizations/selectors'

const ResourceLists: FC = () => {
  const {paygCreditEnabled} = useContext(UsageContext)
  const isIOxOrg = useSelector(isOrgIOx)

  // Test commit to validate CI

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
                  InfluxDB Cloud is now powered by the new{' '}
                  <strong>IOx High-Performance Time-Series Engine</strong>. What
                  does this mean for you?
                </p>
                <ul>
                  <li>Improved performance</li>
                  <li>Native support for SQL</li>
                  <li>Unlimited series cardinality</li>
                  <li>Low-cost cloud object storage</li>
                </ul>
              </>
            }
            ctaLink="https://www.influxdata.com/cloud-iox-faq/"
            ctaText="Learn more"
            title="New time-series engine for InfluxDB"
          />
        </AnnouncementCenter>
      ) : (
        <DocSearchWidget />
      )}
      {CLOUD && paygCreditEnabled && <UsagePanel />}
      <VersionInfo />
    </FlexBox>
  )
}

export default memo(ResourceLists)
