// Libraries
import React, {useState, useContext} from 'react'
import {Sort} from '@influxdata/clockface'

// Components
import {Page, PageHeader} from '@influxdata/clockface'
import FlowCreateButton from 'src/flows/components/FlowCreateButton'
import {FlowListContext, FlowListProvider} from 'src/flows/context/flow.list'
import FlowCards from 'src/flows/components/FlowCards'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import ResourceSortDropdown from 'src/shared/components/resource_sort_dropdown/ResourceSortDropdown'
import {SortTypes} from 'src/shared/utils/sort'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {PROJECT_NAME_PLURAL} from 'src/flows'

// Types
import {Flow} from 'src/types/flows'
import {ResourceType} from 'src/types'

const FlowsIndex = () => {
  const {flows} = useContext(FlowListContext)
  const [search, setSearch] = useState('')
  const [sortOptions, setSortOptions] = useState({
    sortKey: 'name' as keyof Flow,
    sortType: SortTypes.String,
    sortDirection: Sort.Ascending,
  })

  const filteredFlows = Object.keys(flows).filter(f =>
    flows[f].name.toLowerCase().includes(search.toLowerCase().trim())
  )
  const sortedFlows = filteredFlows.sort((a, b) => {
    return (
      (flows[a][sortOptions.sortKey] as string)
        .toLowerCase()
        .localeCompare(
          (flows[b][sortOptions.sortKey] as string).toLowerCase()
        ) * (sortOptions.sortDirection === Sort.Ascending ? 1 : -1)
    )
  })
  const flowList = {
    flows: sortedFlows.reduce((acc, curr) => {
      acc[curr] = flows[curr]
      return acc
    }, {}),
  }

  const setSort = (sortKey, sortDirection, sortType) => {
    setSortOptions({
      sortKey,
      sortType,
      sortDirection,
    })
  }

  return (
    <Page
      titleTag={pageTitleSuffixer([PROJECT_NAME_PLURAL])}
      testID="flows-index"
    >
      <PageHeader fullWidth={false}>
        <Page.Title title={PROJECT_NAME_PLURAL} />
      </PageHeader>
      <Page.ControlBar fullWidth={false}>
        <Page.ControlBarLeft>
          <SearchWidget
            placeholderText={`Filter ${PROJECT_NAME_PLURAL}...`}
            onSearch={setSearch}
            searchTerm={search}
          />
          <ResourceSortDropdown
            resourceType={ResourceType.Flows}
            sortDirection={sortOptions.sortDirection}
            sortKey={sortOptions.sortKey}
            sortType={sortOptions.sortType}
            onSelect={setSort}
          />
        </Page.ControlBarLeft>
        <Page.ControlBarRight>
          <FlowCreateButton />
        </Page.ControlBarRight>
      </Page.ControlBar>
      <Page.Contents scrollable={true}>
        <FlowCards flows={flowList} search={search} />
      </Page.Contents>
    </Page>
  )
}

export default () => (
  <FlowListProvider>
    <FlowsIndex />
  </FlowListProvider>
)
