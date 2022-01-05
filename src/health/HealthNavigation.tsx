// Libraries
import React, {PureComponent} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import TabbedPageTabs from 'src/shared/tabbedPage/TabbedPageTabs'

// Types
import {TabbedPageTab} from 'src/shared/tabbedPage/TabbedPageTabs'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'

interface OwnProps {
  activeTab: string
  orgID: string
}

type Props = OwnProps & RouteComponentProps<{orgID: string}>

@ErrorHandling
class HealthNavigation extends PureComponent<Props> {
  public render() {
    const {activeTab, orgID, history} = this.props

    const handleTabClick = (id: string): void => {
      history.push(`/orgs/${orgID}/health-check/${id}`)
    }

    const tabs: TabbedPageTab[] = [
      {
        text: 'Dashboards',
        id: 'dashboards',
      },
      {
        text: 'Tasks',
        id: 'tasks',
      },
    ]

    return (
      <TabbedPageTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabClick={handleTabClick}
      />
    )
  }
}

export default withRouter(HealthNavigation)
