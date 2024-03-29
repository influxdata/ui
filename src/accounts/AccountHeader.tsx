import React, {FC} from 'react'

// Components
import {Page} from '@influxdata/clockface'
import LimitChecker from 'src/cloud/components/LimitChecker'

type Props = {
  testID?: string
}

const AccountHeader: FC<Props> = ({testID = 'member-page--header'}) => (
  <Page.Header fullWidth={true} testID={testID}>
    <Page.Title title="Account" />
    <LimitChecker />
  </Page.Header>
)

export default AccountHeader
