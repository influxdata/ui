// Libraries
import React, {FC, useState} from 'react'
import {useSelector} from 'react-redux'
import {useHistory, useParams} from 'react-router-dom'

// Utils
import {getVariables} from 'src/variables/selectors'

// Components
import {EmptyState} from '@influxdata/clockface'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import TabbedPageHeader from 'src/shared/components/tabbed_page/TabbedPageHeader'
import VariableList from 'src/variables/components/VariableList'
import Filter from 'src/shared/components/FilterList'
import AddResourceDropdown from 'src/shared/components/AddResourceDropdown'
import ResourceSortDropdown from 'src/shared/components/resource_sort_dropdown/ResourceSortDropdown'
import GetResources from 'src/resources/components/GetResources'
import {Sort} from '@influxdata/clockface'

// Types
import {ResourceType, Variable} from 'src/types'
import {ComponentSize} from '@influxdata/clockface'
import {SortTypes} from 'src/shared/utils/sort'
import {VariableSortKey} from 'src/shared/components/resource_sort_dropdown/generateSortItems'

const FilterList = Filter<Variable>()

const VariablesTab: FC = () => {
  const variables = useSelector(getVariables)
  const history = useHistory()
  const {orgID} = useParams<{orgID: string}>()
  const [searchTerm, setSearchTerm] = useState('')
  const [sort, setSort] = useState({
    sortKey: 'name',
    sortDirection: Sort.Ascending,
    sortType: SortTypes.String,
  })

  const handleSort = (
    sortKey: VariableSortKey,
    sortDirection: Sort,
    sortType: SortTypes
  ): void => {
    setSort({
      sortKey,
      sortDirection,
      sortType,
    })
  }

  const handleOpenCreateOverlay = (): void => {
    history.push(`/orgs/${orgID}/settings/variables/new`)
  }

  const handleOpenImportOverlay = () => {
    history.push(`/orgs/${orgID}/settings/variables/import`)
  }

  const handleFilterUpdate = (term: string) => {
    setSearchTerm(term)
  }

  const handleFilterChange = (searchTerm: string) => {
    handleFilterUpdate(searchTerm)
  }

  let emptyState = (
    <EmptyState size={ComponentSize.Large}>
      <EmptyState.Text>No Variables match your query</EmptyState.Text>
    </EmptyState>
  )

  if (!searchTerm) {
    emptyState = (
      <EmptyState size={ComponentSize.Large}>
        <EmptyState.Text>
          Looks like there aren't any <b>Variables</b>, why not create one?
        </EmptyState.Text>
        <AddResourceDropdown
          resourceName="Variable"
          onSelectNew={handleOpenCreateOverlay}
          onSelectImport={handleOpenImportOverlay}
        />
      </EmptyState>
    )
  }

  const leftHeaderItems = (
    <>
      <SearchWidget
        placeholderText="Filter variables..."
        searchTerm={searchTerm}
        onSearch={handleFilterChange}
      />
      <ResourceSortDropdown
        onSelect={handleSort}
        resourceType={ResourceType.Variables}
        sortDirection={sort.sortDirection}
        sortKey={sort.sortKey}
        sortType={sort.sortType}
      />
    </>
  )

  const rightHeaderItems = (
    <AddResourceDropdown
      resourceName="Variable"
      onSelectNew={handleOpenCreateOverlay}
      onSelectImport={handleOpenImportOverlay}
    />
  )

  return (
    <>
      <TabbedPageHeader
        childrenLeft={leftHeaderItems}
        childrenRight={rightHeaderItems}
      />
      <GetResources resources={[ResourceType.Labels]}>
        <FilterList
          searchTerm={searchTerm}
          searchKeys={['name', 'labels[].name']}
          list={variables}
        >
          {variables => (
            <VariableList
              variables={variables}
              emptyState={emptyState}
              onFilterChange={handleFilterUpdate}
              sortKey={sort.sortKey}
              sortDirection={sort.sortDirection}
              sortType={sort.sortType}
            />
          )}
        </FilterList>
      </GetResources>
    </>
  )
}

export default VariablesTab
