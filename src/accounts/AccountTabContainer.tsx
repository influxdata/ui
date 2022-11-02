// Libraries
import React, {PureComponent} from 'react'

// Components
import AccountTabs from 'src/accounts/AccountTabs'

import {Tabs, Orientation, Page} from '@influxdata/clockface'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'

// Style
import './AccountTabContainer.scss'

interface Props {
  activeTab: string
}

@ErrorHandling
class AccountTabContainer extends PureComponent<Props> {
  public render() {
    const {activeTab, children} = this.props

    return (
      <Page.Contents fullWidth={true} scrollable={true} className="Subir">
        <Tabs.Container
          orientation={Orientation.Horizontal}
          style={{height: 'inherit', display: 'flex'}}
        >
          <AccountTabs activeTab={activeTab} />
          <Tabs.TabContents
            className="account-page--tab-contents"
            style={{display: 'flex', flexDirection: 'column'}}
          >
            {children}
          </Tabs.TabContents>
        </Tabs.Container>
      </Page.Contents>
    )
  }
}

export default AccountTabContainer
