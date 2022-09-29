import React, {Component} from 'react'

// Components
import {Page} from '@influxdata/clockface'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

class SettingsHeader extends Component {
  public render() {
    return (
      <Page.Header fullWidth={true}>
        <Page.Title title="Settings" testID="settings-page--header" />
        {!isFlagEnabled('multiOrg') && <RateLimitAlert location="settings" />}
      </Page.Header>
    )
  }
}

export default SettingsHeader
