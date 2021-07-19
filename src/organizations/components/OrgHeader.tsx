import React, {FC} from 'react'

// Components
import {Page} from '@influxdata/clockface'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'

type Props = {
  testID?: string
}

const OrgHeader: FC<Props> = ({testID = 'member-page--header'}) => (
  <Page.Header fullWidth={false} testID={testID}>
    <Page.Title title="Organization" />
    <RateLimitAlert />
  </Page.Header>
)

export default OrgHeader
