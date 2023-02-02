import React, {Component} from 'react'

// Components
import {Page} from '@influxdata/clockface'

class SettingsHeader extends Component {
  public render() {
    return (
      <Page.Header fullWidth={true} testID="settings-page--header">
        <Page.Title title="Settings" />
      </Page.Header>
    )
  }
}

export default SettingsHeader
