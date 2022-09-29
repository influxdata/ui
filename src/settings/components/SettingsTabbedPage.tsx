// Libraries
import React, {PureComponent} from 'react'

// Components
import SettingsNavigation from 'src/settings/components/SettingsNavigation'
import {ComponentSize, Orientation, Page, Tabs} from '@influxdata/clockface'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'

interface Props {
  activeTab: string
}

@ErrorHandling
class SettingsTabbedPage extends PureComponent<Props> {
  public render() {
    const {activeTab, children} = this.props

    return (
      <Page.Contents
        fullWidth={true}
        scrollable={true}
        scrollbarSize={ComponentSize.Large}
        autoHideScrollbar={true}
      >
        <Tabs.Container orientation={Orientation.Horizontal}>
          <SettingsNavigation activeTab={activeTab} />
          <Tabs.TabContents>{children}</Tabs.TabContents>
        </Tabs.Container>
      </Page.Contents>
    )
  }
}

export default SettingsTabbedPage
