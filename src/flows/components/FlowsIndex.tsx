// Libraries
import React, {useState, useContext} from 'react'
import {DapperScrollbars, Sort} from '@influxdata/clockface'

// Components
import {Page, PageHeader} from '@influxdata/clockface'
import FlowCreateButton from 'src/flows/components/FlowCreateButton'
import {FlowListContext, FlowListProvider} from 'src/flows/context/flow.list'
import FlowCards from 'src/flows/components/FlowCards'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import ResourceSortDropdown from 'src/shared/components/resource_sort_dropdown/ResourceSortDropdown'
import {SortTypes} from 'src/shared/utils/sort'
import PresetFlows from 'src/flows/components/PresetFlows'
// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {PROJECT_NAME_PLURAL} from 'src/flows'

// Types
import {Flow} from 'src/types/flows'
import {ResourceType} from 'src/types'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

import 'src/flows/components/controlSearchBar.scss'

const FlowsIndex = () => {
  const [showButtonMode, setShowButtonMode] = useState(false)

  const fadeOutOnScroll = element => {
    const header = document.getElementsByClassName('cf-page-header')[0]
    if (!header) {
      return
    }

    const distanceToTop =
      window.pageYOffset + element.getBoundingClientRect().top
    const elementHeight = element.offsetHeight
    const scrollTop = document.documentElement.scrollTop

    console.log(
      'distance:',
      distanceToTop,
      'height: ',
      elementHeight,
      'scrollTop',
      scrollTop
    )
    let opacity = 1

    if (scrollTop > distanceToTop) {
      opacity = 1 - ((scrollTop - distanceToTop) / elementHeight) * 1.8
    }

    if (opacity >= 0) {
      element.style.opacity = opacity
    } else {
      document
        .getElementsByClassName('withButtonHeader')[0]
        .classList.add('marginHeader')
    }

    if (distanceToTop < -45) {
      setShowButtonMode(true)
    } else {
      if (showButtonMode) {
        console.log('here')
        setShowButtonMode(false)
      }
    }
  }

  function scrollHandler() {
    const elem = document.getElementById('fadebox')
    if (elem) {
      fadeOutOnScroll(elem)
    }
  }

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
      <PageHeader
        fullWidth={false}
        className={`${showButtonMode && 'withButtonHeader'}`}
      >
        <Page.Title title={PROJECT_NAME_PLURAL} />
        {showButtonMode && (
          <>
            {isFlagEnabled('presetFlows') && (
              <PresetFlows buttonMode={showButtonMode} />
            )}
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
                {!isFlagEnabled('presetFlows') && <FlowCreateButton />}
              </Page.ControlBarRight>
            </Page.ControlBar>
          </>
        )}
      </PageHeader>
      <DapperScrollbars onScroll={scrollHandler} id="scrollFlows">
        <Page.Contents fullWidth={false} id="fadebox">
          {isFlagEnabled('presetFlows') && <PresetFlows buttonMode={false} />}
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
              {!isFlagEnabled('presetFlows') && <FlowCreateButton />}
            </Page.ControlBarRight>
          </Page.ControlBar>
        </Page.Contents>

        <Page.Contents fullWidth={false}>
          <FlowCards flows={flowList} search={search} />
        </Page.Contents>
      </DapperScrollbars>
    </Page>
  )
}

export default () => (
  <FlowListProvider>
    <FlowsIndex />
  </FlowListProvider>
)
