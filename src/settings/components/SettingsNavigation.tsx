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
import {event} from 'src/cloud/utils/reporting'
import {selectIsNewIOxOrg} from 'src/shared/selectors/app'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

interface Props {
  activeTab: string
}

const SettingsNavigation: FC<Props> = ({activeTab}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
  const isNewIOxOrg = useSelector(selectIsNewIOxOrg)


  const handleTabClick = (id: string): void => {
    event('page-nav clicked', {which: `settings--${id}`})
    history.push(`/orgs/${org.id}/settings/${id}`)
  }

  const tabs: TabbedPageTab[] = [
    {
      text: 'Variables',
      id: 'variables',
      enabled: !isNewIOxOrg || isFlagEnabled('showVariablesInNewIOx')
    },
    {
      text: 'Templates',
      id: 'templates',
      enabled: !isNewIOxOrg || isFlagEnabled('showTemplatesInNewIOx')
    },
    {
      text: 'Labels',
      id: 'labels',
      enabled: true
    },
    {
      text: 'Secrets',
      id: 'secrets',
      enabled: true
    },
  ].filter(tab => tab.enabled)

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
