import React, {FC} from 'react'

// Components
import {Page} from '@influxdata/clockface'

type Props = {
  testID?: string
}

const AccountHeader: FC<Props> = ({testID = 'member-page--header'}) => (
  <Page.Header fullWidth={true} testID={testID}>
    <Page.Title title="Account" />
  </Page.Header>
)

export default AccountHeader
