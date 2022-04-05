import React, {FC} from 'react'

// Components
import {Page} from '@influxdata/clockface'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import LimitChecker from 'src/cloud/components/LimitChecker'

type Props = {
  testID?: string
}

const AccountHeader: FC<Props> = ({testID = 'member-page--header'}) => (
  <Page.Header fullWidth={false} testID={testID}>
    <Page.Title title="Account" />
    <LimitChecker>
      <RateLimitAlert location="account" />
    </LimitChecker>
  </Page.Header>
)

export default AccountHeader
