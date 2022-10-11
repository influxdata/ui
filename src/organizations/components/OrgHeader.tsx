import React, {FC} from 'react'

// Components
import {Page} from '@influxdata/clockface'

type Props = {
  testID?: string
}

const OrgHeader: FC<Props> = ({testID = 'member-page--header'}) => (
  <Page.Header fullWidth={true} testID={testID}>
    <Page.Title title="Organization" />
  </Page.Header>
)

export default OrgHeader
