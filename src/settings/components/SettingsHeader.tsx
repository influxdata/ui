import React, {Component} from 'react'

// Components
import {Page} from '@influxdata/clockface'

class SettingsHeader extends Component {
  public render() {
    return (
      <Page.Header fullWidth={true}>
        <Page.Title title="Settings" testID="settings-page--header" />
      </Page.Header>
    )
  }
}

export default SettingsHeader
