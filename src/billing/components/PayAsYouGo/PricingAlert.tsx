// Libraries
import React, {useEffect} from 'react'
import {useSelector} from 'react-redux'

// Components
import {
  Alert,
  FlexBox,
  IconFont,
  ComponentColor,
  ComponentSize,
} from '@influxdata/clockface'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Selectors
import {selectCurrentOrg, selectUser} from 'src/identity/selectors'

export const PricingAlert: React.FC = () => {
  useEffect(() => {
    event(`pricingAnnouncementBanner.displayed`)
  }, [])

  const org = useSelector(selectCurrentOrg)
  const user = useSelector(selectUser)

  const encodedSubject = encodeURI('PAYG Pricing Increase')
  const encodedBody = encodeURI(`User ID: ${user.email}
Org ID: ${org.id}

Please describe your inquiry here.`)

  const handleContactUsClick = () => {
    event(`pricingAnnouncementBanner.contactUs.clicked`)
  }

  const handlePricingAnnouncementClick = () => {
    event(`pricingAnnouncementBanner.details.clicked`)
  }

  return (
    <Alert icon={IconFont.AlertTriangle} color={ComponentColor.Primary}>
      <FlexBox margin={ComponentSize.Medium}>
        <FlexBox.Child grow={1} shrink={0}>
          Starting on <b>December 1, 2023</b> there will be an increase in to
          your usage-based pricing. Please feel free to{' '}
          <SafeBlankLink
            href={`mailto:payg-price-change@influxdata.com?
            &subject=${encodedSubject}
            &body=${encodedBody}`}
            onClick={handleContactUsClick}
          >
            contact us
          </SafeBlankLink>{' '}
          with questions or refer to our website for additional information.
        </FlexBox.Child>
        <FlexBox.Child grow={0} shrink={0}>
          <SafeBlankLink
            href="https://www.influxdata.com/influxdb-pricing"
            onClick={handlePricingAnnouncementClick}
          >
            <div className="cf-button cf-button-xs cf-button-primary">
              <span className="cf-button-label">View Pricing Changes</span>
            </div>
          </SafeBlankLink>
        </FlexBox.Child>
      </FlexBox>
    </Alert>
  )
}
