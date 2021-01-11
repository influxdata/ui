// Libraries
import React, {FC} from 'react'

// Components
import {FlexBox, JustifyContent} from '@influxdata/clockface'
import CloudUpgradeButton from 'src/shared/components/CloudUpgradeButton'

const RateLimitAlertFreeContent: FC = () => {
  return (
    <div className="rate-alert--content rate-alert--content__free">
      <span>
        Oh no! You hit the{' '}
        <a
          href="https://v2.docs.influxdata.com/v2.0/reference/glossary/#series-cardinality"
          className="rate-alert--docs-link"
          target="_blank"
        >
          series cardinality
        </a>{' '}
        limit and your data stopped writing. Don’t lose important metrics.
      </span>
      <FlexBox
        justifyContent={JustifyContent.Center}
        className="rate-alert--button"
      >
        <CloudUpgradeButton className="upgrade-payg--button__rate-alert" />
      </FlexBox>
    </div>
  )
}

export default RateLimitAlertFreeContent
