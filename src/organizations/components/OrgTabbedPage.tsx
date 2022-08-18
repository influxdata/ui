// Libraries
import React, {PureComponent} from 'react'

// Components
import OrgNavigation from 'src/organizations/components/OrgNavigation'
import {Tabs, Orientation, Page} from '@influxdata/clockface'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'

interface Props {
  activeTab: string
}

@ErrorHandling
class OrgTabbedPage extends PureComponent<Props> {
  public render() {
    const {activeTab, children} = this.props

    return (
      <Page.Contents fullWidth={true} scrollable={true}>
        <Tabs.Container orientation={Orientation.Horizontal}>
          <OrgNavigation activeTab={activeTab} />
          <Tabs.TabContents>{children}</Tabs.TabContents>
        </Tabs.Container>
      </Page.Contents>
    )
  }
}

export default OrgTabbedPage
