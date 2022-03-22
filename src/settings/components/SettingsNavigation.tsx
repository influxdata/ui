// Libraries
import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import TabbedPageTabs from 'src/shared/tabbedPage/TabbedPageTabs'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

// Types
import {TabbedPageTab} from 'src/shared/tabbedPage/TabbedPageTabs'

//  Selectors
import {getOrg} from 'src/organizations/selectors'

interface Props {
  activeTab: string
}

const SettingsNavigation: FC<Props> = ({activeTab}) => {
  const history = useHistory()
  const org = useSelector(getOrg)

  const handleTabClick = (id: string): void => {
    history.push(`/orgs/${org.id}/settings/${id}`)
  }

  const tabs: TabbedPageTab[] = [
    {
      text: 'Variables',
      id: 'variables',
    },
    {
      text: 'Templates',
      id: 'templates',
    },
    {
      text: 'Labels',
      id: 'labels',
    },
    {
      text: 'Secrets',
      id: 'secrets',
    },
  ]

  return (
    <ErrorBoundary>
      <TabbedPageTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabClick={handleTabClick}
      />
    </ErrorBoundary>
  )
}

export default SettingsNavigation
