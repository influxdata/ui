// Libraries
import React, {FC, useState, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Components
import {
  Button,
  ComponentColor,
  ComponentSize,
  EmptyState,
  IconFont,
  Sort,
} from '@influxdata/clockface'
import {SearchWidget} from 'src/shared/components/search_widget/SearchWidget'
import TabbedPageHeader from 'src/shared/components/tabbed_page/TabbedPageHeader'
import SecretsList from 'src/secrets/components/SecretsList'
import {FilterListContainer} from 'src/shared/components/FilterList'
import ResourceSortDropdown from 'src/shared/components/resource_sort_dropdown/ResourceSortDropdown'
import GetResources from 'src/resources/components/GetResources'
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Selectors
import {getAllSecrets} from 'src/resources/selectors'

// Types
import {ResourceType, Secret} from 'src/types'
import {SortTypes} from 'src/shared/utils/sort'
import {SecretSortKey} from 'src/shared/components/resource_sort_dropdown/generateSortItems'

// Utils
import {event} from 'src/cloud/utils/reporting'

const SecretsTab: FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<Sort>(Sort.Ascending)
  const [sortKey, setSortKey] = useState<string>('id')
  const [sortType, setSortType] = useState<SortTypes>(SortTypes.String)
  const dispatch = useDispatch()

  const secrets = useSelector(getAllSecrets)
  const FilterSecrets = FilterListContainer<Secret>()

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
    dispatch(
      showOverlay('create-secret', null, () => dispatch(dismissOverlay()))
    )
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
