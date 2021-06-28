// Libraries
import React, {FC, useState} from 'react'
<<<<<<< HEAD
import {useDispatch, useSelector} from 'react-redux'
=======
import {useSelector} from 'react-redux'
>>>>>>> 13f44092cb7d2b696603ceac41cf78b9877e0998

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
<<<<<<< HEAD
import ModifySecretOverlay from 'src/secrets/components/ModifySecretOverlay'
=======
>>>>>>> 13f44092cb7d2b696603ceac41cf78b9877e0998

// Selectors
import {getAllSecrets} from 'src/resources/selectors'

// Types
import {ResourceType, Secret} from 'src/types'
import {SortTypes} from 'src/shared/utils/sort'
import {SecretSortKey} from 'src/shared/components/resource_sort_dropdown/generateSortItems'

<<<<<<< HEAD
// Actions
import {deleteSecret, upsertSecret} from 'src/secrets/actions/thunks'

const SecretsTab: FC = () => {
  const dispatch = useDispatch()

  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<Sort>(Sort.Ascending)
  const [sortKey, setSortKey] = useState<string>('id')
  const [overlayMode, setOverlayMode] = useState<string>('CREATE')
  const [defaultKey, setDefaultKey] = useState<string>('')
  const [sortType, setSortType] = useState<SortTypes>(SortTypes.String)
  const [isOverlayVisible, setIsOverlayVisible] = useState<boolean>(false)
=======
const SecretsTab: FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<Sort>(Sort.Ascending)
  const [sortKey, setSortKey] = useState<string>('id')
  const [sortType, setSortType] = useState<SortTypes>(SortTypes.String)
>>>>>>> 13f44092cb7d2b696603ceac41cf78b9877e0998

  const FilterSecrets = FilterList<Secret>()

  const secrets = useSelector(getAllSecrets)

<<<<<<< HEAD
  const handleCreateSecret = () => {
    setOverlayMode('CREATE')
    setDefaultKey('')
    setIsOverlayVisible(true)
  }

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

  const handleUpsertSecret = (newSecret: Secret) => {
    dispatch(upsertSecret(newSecret))
  }

  const handleEditSecret = (defaultKey: string) => {
    setDefaultKey(defaultKey)
    setOverlayMode('UPDATE')
    setIsOverlayVisible(true)
  }

  const handleKeyValidation = (key: string): string | null => {
    if (!key || overlayMode === 'UPDATE') {
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
      onClick={handleCreateSecret}
      testID="button-add-secret"
=======
  const handleOpenCreateOverlay = () => {}

  const createSecretButton = (
    <Button
      text="Create Secret"
      color={ComponentColor.Primary}
      icon={IconFont.Plus}
      onClick={handleOpenCreateOverlay}
      testID="button-create"
>>>>>>> 13f44092cb7d2b696603ceac41cf78b9877e0998
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
<<<<<<< HEAD
            {addSecretButton}
=======
            {createSecretButton}
>>>>>>> 13f44092cb7d2b696603ceac41cf78b9877e0998
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

<<<<<<< HEAD
=======
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

  // const handleOpenImportOverlay = (): void => {
  // const {history, match} = props
  //
  // history.push(`/orgs/${match.params.orgID}/settings/variables/import`)
  // }

  // const handleOpenCreateOverlay = (): void => {
  // const {history, match} = props
  //
  // history.push(`/orgs/${match.params.orgID}/settings/variables/new`)
  // }

  // const handleDeleteSecret = (secret: Secret): void => {
  // const {onDeleteSecret} = props
  // onDeleteSecret(secret.id)
  // }

>>>>>>> 13f44092cb7d2b696603ceac41cf78b9877e0998
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
<<<<<<< HEAD
        childrenRight={addSecretButton}
=======
        childrenRight={createSecretButton}
>>>>>>> 13f44092cb7d2b696603ceac41cf78b9877e0998
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
<<<<<<< HEAD
              onDeleteSecret={handleDeleteSecret}
              sortKey="key"
              sortDirection={sortDirection}
              sortType={sortType}
              handleEditSecret={handleEditSecret}
            />
          )}
        </FilterSecrets>
        <ModifySecretOverlay
          isVisible={isOverlayVisible}
          handleUpsertSecret={handleUpsertSecret}
          onDismiss={handleHideOverlay}
          onKeyValidation={handleKeyValidation}
          defaultKey={defaultKey}
          mode={overlayMode}
          />
=======
              onDeleteSecret={() => {}}
              sortKey="key"
              sortDirection={sortDirection}
              sortType={sortType}
            />
          )}
        </FilterSecrets>
>>>>>>> 13f44092cb7d2b696603ceac41cf78b9877e0998
      </GetResources>
    </>
  )
}

export default SecretsTab
