// Libraries
import React, {FC, useContext, useState, useEffect} from 'react'
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
  SpinnerContainer,
  TechnoSpinner,
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
import {AppSettingProvider} from 'src/shared/contexts/app'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'

// Types
import {ResourceType} from 'src/types'
import {ORGS, SUBSCRIPTIONS} from 'src/shared/constants/routes'
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/SubscriptionsLanding.scss'

const SubscriptionsLanding: FC = () => {
  const {subscriptions, loading} = useContext(SubscriptionListContext)
  const history = useHistory()
  const org = useSelector(getOrg)
  const [search, setSearch] = useState('')
  const [sortOptions, setSortOptions] = useState({
    sortKey: 'name' as keyof Subscription,
    sortType: SortTypes.String,
    sortDirection: Sort.Ascending,
  })
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([])

  useEffect(() => {
    event('visited subscriptions page', {}, {feature: 'subscriptions'})
  }, [])

  useEffect(() => {
    if (!subscriptions || !subscriptions.length) {
      setFilteredSubscriptions([])
      return
    }

    const lowerCaseSearch = search.toLowerCase().trim()
    if (!lowerCaseSearch) {
      setFilteredSubscriptions(subscriptions)
      return
    }

    const filtered = subscriptions.filter(s =>
      s.name.toLowerCase().includes(lowerCaseSearch)
    )
    setFilteredSubscriptions(filtered)
  }, [subscriptions, search])

  const handleSort = (subscriptions: Subscription[]): Subscription[] => {
    let sortedSubscriptions
    if (sortOptions.sortDirection === Sort.Ascending) {
      sortedSubscriptions = subscriptions.sort((a, b) =>
        (a[sortOptions.sortKey] as string)
          .toLowerCase()
          .localeCompare((b[sortOptions.sortKey] as string).toLowerCase())
      )
    } else if (sortOptions.sortDirection === Sort.Descending) {
      sortedSubscriptions = subscriptions.sort((a, b) =>
        (b[sortOptions.sortKey] as string)
          .toLowerCase()
          .localeCompare((a[sortOptions.sortKey] as string).toLowerCase())
      )
    }
    return sortedSubscriptions
  }
  const setSort = (sortKey, sortDirection, sortType) => {
    if (
      sortKey === sortOptions.sortKey &&
      sortDirection === sortOptions.sortDirection
    ) {
      return
    }
    setSortOptions({
      sortKey,
      sortType,
      sortDirection,
    })
  }
  return (
    <Page
      className="subscriptions-landing"
      titleTag={pageTitleSuffixer(['Native Subscriptions', 'Load Data'])}
    >
      <LoadDataHeader />
      <LoadDataTabbedPage activeTab="subscriptions">
        <SpinnerContainer
          spinnerComponent={<TechnoSpinner />}
          loading={loading}
        >
          <Page.ControlBar fullWidth={true}>
            <Page.ControlBarLeft>
              <SearchWidget
                placeholderText="Filter subscriptions..."
                searchTerm={search}
                onSearch={setSearch}
              />
              <ResourceSortDropdown
                resourceType={ResourceType.Subscriptions}
                sortDirection={sortOptions.sortDirection}
                sortKey={sortOptions.sortKey}
                sortType={sortOptions.sortType}
                onSelect={setSort}
              />
            </Page.ControlBarLeft>
            <Page.ControlBarRight>
              <Button
                text="Create Subscription"
                icon={IconFont.Plus_New}
                color={ComponentColor.Primary}
                onClick={() => {
                  event(
                    'create subscription clicked',
                    {},
                    {feature: 'subscriptions'}
                  )
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
            <SubscriptionsList
              subscriptions={handleSort(filteredSubscriptions)}
            />
          ) : (
            <EmptySubscriptionState />
          )}
        </SpinnerContainer>
      </LoadDataTabbedPage>
    </Page>
  )
}

SubscriptionsLanding

export default () => (
  <AppSettingProvider>
    <SubscriptionListProvider>
      <SubscriptionsLanding />
    </SubscriptionListProvider>
  </AppSettingProvider>
)
