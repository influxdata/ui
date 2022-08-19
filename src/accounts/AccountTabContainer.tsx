// Libraries
import React, {PureComponent} from 'react'

// Components
import AccountTabs from 'src/accounts/AccountTabs'

import {Tabs, Orientation, Page} from '@influxdata/clockface'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'

interface Props {
  activeTab: string
}

@ErrorHandling
class AccountTabContainer extends PureComponent<Props> {
  public render() {
    const {activeTab, children} = this.props

    return (
      <Page.Contents fullWidth={true} scrollable={true}>
        <Tabs.Container orientation={Orientation.Horizontal}>
          <AccountTabs activeTab={activeTab} />
          <Tabs.TabContents>{children}</Tabs.TabContents>
        </Tabs.Container>
      </Page.Contents>
    )
  }
}

export default AccountTabContainer
