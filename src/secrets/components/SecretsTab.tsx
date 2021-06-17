// Libraries
import React, {FC, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'

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
import {getAll} from 'src/resources/selectors'

// Types
import {AppState, ResourceType, Secret} from 'src/types'
import {SortTypes} from 'src/shared/utils/sort'
import {SecretSortKey} from 'src/shared/components/resource_sort_dropdown/generateSortItems'

interface OwnProps {
  secrets: Secret[]
  searchTerm?: string
  // importOverlayState?: OverlayState
  sortDirection?: Sort
  sortType?: SortTypes
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

const SecretsTab: FC<Props> = ({
  secrets,
  // importOverlayState = OverlayState.Closed,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<Sort>(Sort.Ascending)
  const [sortKey, setSortKey] = useState<string>('id')
  const [sortType, setSortType] = useState<SortTypes>(SortTypes.String)

  const FilterSecrets = FilterList<Secret>()

  const handleOpenCreateOverlay = () => {}

  const createSecretButton = (
    <Button
      text="Create Secret"
      color={ComponentColor.Primary}
      icon={IconFont.Plus}
      onClick={handleOpenCreateOverlay}
      testID="button-create"
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
            {createSecretButton}
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
        childrenRight={createSecretButton}
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
              onDeleteSecret={() => {}}
              sortKey={'key'}
              sortDirection={sortDirection}
              sortType={sortType}
            />
          )}
        </FilterSecrets>
      </GetResources>
    </>
  )
}

const mstp = (state: AppState) => {
  const secrets = getAll<Secret>(state, ResourceType.Secrets)

  return {secrets}
}

// const mdtp = {
//     onDeleteSecret: deleteSecret,
// }

const connector = connect(mstp, null)

export default connector(SecretsTab)
