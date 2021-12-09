// Libraries
import React, {FC, useState, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Components
import {
  Button,
  ComponentColor,
  ComponentSize,
  EmptyState,
  IconFont,
  Sort,
} from '@influxdata/clockface'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import TabbedPageHeader from 'src/shared/components/tabbed_page/TabbedPageHeader'
import SecretsList from 'src/secrets/components/SecretsList'
import FilterList from 'src/shared/components/FilterList'
import ResourceSortDropdown from 'src/shared/components/resource_sort_dropdown/ResourceSortDropdown'
import GetResources from 'src/resources/components/GetResources'

// Selectors
import {getAllSecrets} from 'src/resources/selectors'

// Types
import {ResourceType, Secret} from 'src/types'
import {SortTypes} from 'src/shared/utils/sort'
import {SecretSortKey} from 'src/shared/components/resource_sort_dropdown/generateSortItems'

// Actions
import {getOrg} from 'src/organizations/selectors'

// Utils
import {event} from 'src/cloud/utils/reporting'

const SecretsTab: FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<Sort>(Sort.Ascending)
  const [sortKey, setSortKey] = useState<string>('id')
  const [sortType, setSortType] = useState<SortTypes>(SortTypes.String)

  const history = useHistory()

  const secrets = useSelector(getAllSecrets)
  const orgId = useSelector(getOrg)?.id
  const FilterSecrets = FilterList<Secret>()

  const handleFilterChange = (searchTerm: string) => {
    setSearchTerm(searchTerm)
  }

  const handleSort = (
    sortKey: SecretSortKey,
    sortDirection: Sort,
    sortType: SortTypes
  ): void => {
    setSortDirection(sortDirection)
    setSortKey(sortKey)
    setSortType(sortType)
  }

  const handleCreateSecret = () => {
    event('Create Secret Modal Opened')
    history.push(`/orgs/${orgId}/settings/secrets/new`)
  }

  let secretsEmptyState = (
    <>
      <EmptyState size={ComponentSize.Medium}>
        <EmptyState.Text>
          Looks like there aren't any <b>Secrets</b>, why not create one?
        </EmptyState.Text>
        <Button
          text="Add Secret"
          color={ComponentColor.Primary}
          icon={IconFont.Plus_New}
          onClick={handleCreateSecret}
          testID="button-add-secret"
        />
      </EmptyState>
    </>
  )

  useEffect(() => {
    if (searchTerm) {
      secretsEmptyState = (
        <EmptyState size={ComponentSize.Medium}>
          <EmptyState.Text>No Secrets match your query</EmptyState.Text>
        </EmptyState>
      )
    } else {
      secretsEmptyState = (
        <>
          <EmptyState size={ComponentSize.Medium}>
            <EmptyState.Text>
              Looks like there aren't any <b>Secrets</b>, why not create one?
            </EmptyState.Text>
            <Button
              text="Add Secret"
              color={ComponentColor.Primary}
              icon={IconFont.Plus_New}
              onClick={handleCreateSecret}
              testID="button-add-secret"
            />
          </EmptyState>
        </>
      )
    }
  }, [searchTerm])

  return (
    <>
      <TabbedPageHeader
        childrenLeft={
          <>
            <SearchWidget
              placeholderText="Filter secrets..."
              searchTerm={searchTerm}
              onSearch={handleFilterChange}
            />
            <ResourceSortDropdown
              onSelect={handleSort}
              resourceType={ResourceType.Secrets}
              sortDirection={sortDirection}
              sortKey={sortKey}
              sortType={sortType}
            />
          </>
        }
        childrenRight={
          <Button
            text="Add Secret"
            color={ComponentColor.Primary}
            icon={IconFont.Plus_New}
            onClick={handleCreateSecret}
            testID="button-add-secret"
          />
        }
      />
      <GetResources resources={[ResourceType.Secrets]}>
        <FilterSecrets
          list={secrets}
          searchTerm={searchTerm}
          searchKeys={['key', 'secret[].key']}
        >
          {sc => (
            <SecretsList
              secrets={sc}
              emptyState={secretsEmptyState}
              sortKey="key"
              sortDirection={sortDirection}
              sortType={sortType}
            />
          )}
        </FilterSecrets>
      </GetResources>
    </>
  )
}

export default SecretsTab
