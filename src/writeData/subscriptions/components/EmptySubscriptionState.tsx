// Libraries
import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Types
import {ResourceType} from 'src/types'
import {ORGS, SUBSCRIPTIONS} from 'src/shared/constants/routes'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {getOrg} from 'src/organizations/selectors'

// Components
import {
  Sort,
  Button,
  IconFont,
  ComponentSize,
  EmptyState,
  ComponentColor,
  ComponentStatus,
  Page,
} from '@influxdata/clockface'
import LoadDataTabbedPage from 'src/settings/components/LoadDataTabbedPage'
import LoadDataHeader from 'src/settings/components/LoadDataHeader'
import {SortTypes} from 'src/shared/utils/sort'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import ResourceSortDropdown from 'src/shared/components/resource_sort_dropdown/ResourceSortDropdown'

// Styles
import 'src/writeData/subscriptions/components/EmptySubscriptionState.scss'

const EmptySubscriptionState: FC = () => {
  const org = useSelector(getOrg)
  const history = useHistory()
  return (
    <Page
      titleTag={pageTitleSuffixer(['Cloud Native Connections', 'Load Data'])}
    >
      <LoadDataHeader />
      <LoadDataTabbedPage activeTab="subscriptions">
        <div className="create-page">
          <div className="subscription-create">
            <div className="left">
              <SearchWidget
                placeholderText="Filter connections..."
                searchTerm={''}
                onSearch={() => {}}
              />
              <ResourceSortDropdown
                resourceType={ResourceType.Subscriptions}
                sortDirection={Sort.Ascending}
                sortKey={'name'}
                sortType={SortTypes.String}
                onSelect={() => {}}
              />
            </div>
            <div className="right">
              <Button
                text="Create Configuration"
                icon={IconFont.Plus_New}
                color={ComponentColor.Primary}
                onClick={() => {
                  history.push(
                    `/${ORGS}/${org.id}/load-data/${SUBSCRIPTIONS}/create`
                  )
                }}
                status={ComponentStatus.Default}
                titleText={''}
                testID="create-subscription-button"
              />
            </div>
          </div>
          <EmptyState size={ComponentSize.Medium}>
            <EmptyState.Text>
              Collect data from an external cloud source with a{' '}
              <b>Cloud Native Connection</b>.
            </EmptyState.Text>
            <Button
              text="Create Configuration"
              icon={IconFont.Plus_New}
              color={ComponentColor.Primary}
              onClick={() => {
                history.push(
                  `/${ORGS}/${org.id}/load-data/${SUBSCRIPTIONS}/create`
                )
              }}
              status={ComponentStatus.Default}
              titleText={''}
              testID="create-subscription-button"
            />
          </EmptyState>
        </div>
      </LoadDataTabbedPage>
    </Page>
  )
}

export default EmptySubscriptionState
