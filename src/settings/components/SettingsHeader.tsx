import React, {Component} from 'react'

// Components
import {Page} from '@influxdata/clockface'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'

class SettingsHeader extends Component {
  public render() {
    return (
      <Page.Header fullWidth={true}>
        <Page.Title title="Settings" testID="settings-page--header" />
        <RateLimitAlert location="settings" />
      </Page.Header>
    )
  }
}

export default SettingsHeader
