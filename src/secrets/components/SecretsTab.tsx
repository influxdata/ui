// Libraries
import React, {FC, useState} from 'react'
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
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import TabbedPageHeader from 'src/shared/components/tabbed_page/TabbedPageHeader'
import SecretsList from 'src/secrets/components/SecretsList'
import FilterList from 'src/shared/components/FilterList'
import ResourceSortDropdown from 'src/shared/components/resource_sort_dropdown/ResourceSortDropdown'
import GetResources from 'src/resources/components/GetResources'
import CreateSecretOverlay from 'src/secrets/components/CreateSecretOverlay'

// Selectors
import {getAllSecrets} from 'src/resources/selectors'

// Types
import {ResourceType, Secret} from 'src/types'
import {SortTypes} from 'src/shared/utils/sort'
import {SecretSortKey} from 'src/shared/components/resource_sort_dropdown/generateSortItems'

// Actions
import {deleteSecret, upsertSecret} from 'src/secrets/actions/thunks'

const SecretsTab: FC = () => {
  const dispatch = useDispatch()

  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<Sort>(Sort.Ascending)
  const [sortKey, setSortKey] = useState<string>('id')
  const [sortType, setSortType] = useState<SortTypes>(SortTypes.String)
  const [isOverlayVisible, setIsOverlayVisible] = useState<boolean>(false)

  const FilterSecrets = FilterList<Secret>()

  const secrets = useSelector(getAllSecrets)

  const handleShowOverlay = () => setIsOverlayVisible(true)

  const handleHideOverlay = () => setIsOverlayVisible(false)

  const handleFilterChange = (searchTerm: string) => {
    handleFilterUpdate(searchTerm)
  }

  const handleFilterUpdate = (searchTerm: string) => {
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

  const handleDeleteSecret = (secret: Secret) => {
    dispatch(deleteSecret(secret))
  }

  const createSecret = (newSecret: Secret) => {
    dispatch(upsertSecret(newSecret))
  }

  const handleKeyValidation = (key: string): string | null => {
    if (!key) {
      return null
    }

    if (key.trim() === '') {
      return 'Key is required'
    }
    const existingIds = secrets.map(s => s.id)

    if (existingIds.indexOf(key) > -1) {
      return 'Key is already in use'
    }

    return null
  }

  const addSecretButton = (
    <Button
      text="Add Secret"
      color={ComponentColor.Primary}
      icon={IconFont.Plus}
      onClick={handleShowOverlay}
      testID="button-add-secret"
    />
  )

  const SecretsEmptyState = (): JSX.Element => {
    if (!searchTerm) {
      return (
        <>
          <EmptyState size={ComponentSize.Medium}>
            <EmptyState.Text>
              Looks like there aren't any <b>Secrets</b>, why not create one?
            </EmptyState.Text>
            {addSecretButton}
          </EmptyState>
        </>
      )
    }

    return (
      <>
        <EmptyState size={ComponentSize.Medium}>
          <EmptyState.Text>No Secrets match your query</EmptyState.Text>
        </EmptyState>
      </>
    )
  }

  // const handleOpenImportOverlay = (): void => {
  // const {history, match} = props
  //
  // history.push(`/orgs/${match.params.orgID}/settings/variables/import`)
  // }

  const leftHeaderItems = (
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
  )

  return (
    <>
      <TabbedPageHeader
        childrenLeft={leftHeaderItems}
        childrenRight={addSecretButton}
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
              emptyState={SecretsEmptyState()}
              onDeleteSecret={handleDeleteSecret}
              sortKey="key"
              sortDirection={sortDirection}
              sortType={sortType}
            />
          )}
        </FilterSecrets>
        <CreateSecretOverlay
          isVisible={isOverlayVisible}
          createSecret={createSecret}
          onDismiss={handleHideOverlay}
          onKeyValidation={handleKeyValidation}
          />
      </GetResources>
    </>
  )
}

export default SecretsTab
