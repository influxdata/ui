// Libraries
import React, {PureComponent} from 'react'

// Components
import HealthNavigation from './HealthNavigation'
import {ComponentSize, Orientation, Page, Tabs} from '@influxdata/clockface'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'

interface Props {
  activeTab: string
  orgID: string
}

@ErrorHandling
class HealthTabbedPage extends PureComponent<Props> {
  public render() {
    const {activeTab, orgID, children} = this.props

    return (
      <Page.Contents
        fullWidth={false}
        scrollable={true}
        scrollbarSize={ComponentSize.Large}
        autoHideScrollbar={true}
      >
        <Tabs.Container orientation={Orientation.Horizontal}>
          <HealthNavigation activeTab={activeTab} orgID={orgID} />
          <Tabs.TabContents>{children}</Tabs.TabContents>
        </Tabs.Container>
      </Page.Contents>
    )
  }
}

export default HealthTabbedPage
