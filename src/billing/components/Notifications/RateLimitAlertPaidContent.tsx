// Libraries
import React, {FC} from 'react'

// Components
import {
  FlexBox,
  ComponentSize,
  ComponentColor,
  JustifyContent,
  LinkButton,
} from '@influxdata/clockface'

const RateLimitAlertPaidContent: FC = () => {
  return (
    <div className="rate-alert--content rate-alert--content__payg">
      <span>
        Data in has stopped because you've hit the{' '}
        <a
          href="https://v2.docs.influxdata.com/v2.0/reference/glossary/#series-cardinality"
          className="rate-alert--docs-link"
          target="_blank"
        >
          series cardinality
        </a>{' '}
        limit. Need some guidance?
      </span>
      <FlexBox
        justifyContent={JustifyContent.Center}
        className="rate-alert--button"
      >
        <LinkButton
          className="rate-alert--contact-button"
          color={ComponentColor.Primary}
          size={ComponentSize.Small}
          text="Speak with an Expert"
          href="https://calendly.com/c/CBCTLOTDNVLFUTZO"
          target="_blank"
        />
      </FlexBox>
    </div>
  )
}

export default RateLimitAlertPaidContent
