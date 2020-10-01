import React, {Component} from 'react'

// Components
import {Page} from '@influxdata/clockface'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'

class OrgHeader extends Component {
  public render() {
    return (
      <Page.Header fullWidth={false} testID="member-page--header">
        <Page.Title title="Organization" />
        <RateLimitAlert />
      </Page.Header>
    )
  }
}

export default OrgHeader
