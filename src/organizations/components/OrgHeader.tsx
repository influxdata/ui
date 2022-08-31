import React, {FC} from 'react'

// Components
import {Page} from '@influxdata/clockface'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import {isFlagEnabled} from '../../shared/utils/featureFlag'

type Props = {
  testID?: string
}

const OrgHeader: FC<Props> = ({testID = 'member-page--header'}) => (
  <Page.Header fullWidth={true} testID={testID}>
    <Page.Title title="Organization" />
    {!isFlagEnabled('multiOrg') && <RateLimitAlert location="organization" />}
  </Page.Header>
)

export default OrgHeader
