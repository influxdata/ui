// Libraries
import React, {FC, useContext} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {
  Sort,
  Button,
  IconFont,
  ComponentColor,
  ComponentStatus,
  Page,
} from '@influxdata/clockface'
import EmptySubscriptionState from 'src/writeData/subscriptions/components/EmptySubscriptionState'
import SubscriptionsList from 'src/writeData/subscriptions/components/SubscriptionsList'
import LoadDataHeader from 'src/settings/components/LoadDataHeader'
import {SortTypes} from 'src/shared/utils/sort'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import ResourceSortDropdown from 'src/shared/components/resource_sort_dropdown/ResourceSortDropdown'
import LoadDataTabbedPage from 'src/settings/components/LoadDataTabbedPage'

// Contexts
import {
  SubscriptionListContext,
  SubscriptionListProvider,
} from 'src/writeData/subscriptions/context/subscription.list'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {getOrg} from 'src/organizations/selectors'

// Types
import {ResourceType} from 'src/types'
import {ORGS, SUBSCRIPTIONS} from 'src/shared/constants/routes'

// Styles
import 'src/writeData/subscriptions/components/SubscriptionsLanding.scss'

const SubscriptionsLanding: FC = () => {
  const {subscriptions} = useContext(SubscriptionListContext)
  const history = useHistory()
  const org = useSelector(getOrg)
  return (
    <Page
      className="subscriptions-landing"
      titleTag={pageTitleSuffixer(['Cloud Native Subscriptions', 'Load Data'])}
    >
      <LoadDataHeader />
      <LoadDataTabbedPage activeTab="subscriptions">
        <Page.ControlBar fullWidth={true}>
          <Page.ControlBarLeft>
            <SearchWidget
              placeholderText="Filter subscriptions..."
              searchTerm=""
              onSearch={() => {}}
            />
            <ResourceSortDropdown
              resourceType={ResourceType.Subscriptions}
              sortDirection={Sort.Ascending}
              sortKey="name"
              sortType={SortTypes.String}
              onSelect={() => {}}
            />
          </Page.ControlBarLeft>
          <Page.ControlBarRight>
            <Button
              text="Create Subscription"
              icon={IconFont.Plus_New}
              color={ComponentColor.Primary}
              onClick={() => {
                history.push(
                  `/${ORGS}/${org.id}/load-data/${SUBSCRIPTIONS}/create`
                )
              }}
              status={ComponentStatus.Default}
              titleText=""
              testID="create-subscription-button--control-bar"
            />
          </Page.ControlBarRight>
        </Page.ControlBar>
        {subscriptions && subscriptions.length ? (
          <SubscriptionsList subscriptions={subscriptions} />
        ) : (
          <EmptySubscriptionState />
        )}
      </LoadDataTabbedPage>
    </Page>
  )
}

SubscriptionsLanding

export default () => (
  <SubscriptionListProvider>
    <SubscriptionsLanding />
  </SubscriptionListProvider>
)
