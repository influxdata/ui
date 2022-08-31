import React, {FC} from 'react'

// Components
import {Page} from '@influxdata/clockface'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import {isFlagEnabled} from '../../shared/utils/featureFlag'

const LoadDataHeader: FC = () => {
  return (
    <Page.Header fullWidth={true} testID="load-data--header">
      <Page.Title title="Load Data" />
      {!isFlagEnabled('multiOrg') && <RateLimitAlert location="load data" />}
    </Page.Header>
  )
}

export default LoadDataHeader
