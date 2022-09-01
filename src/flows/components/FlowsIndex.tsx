// Libraries
import React, {useState, useContext, useRef, useEffect} from 'react'

// Components
import {
  DapperScrollbars,
  FlexBox,
  FlexDirection,
  JustifyContent,
  Page,
  PageHeader,
  Sort,
} from '@influxdata/clockface'
import {FlowListContext, FlowListProvider} from 'src/flows/context/flow.list'
import FlowCards from 'src/flows/components/FlowCards'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import ResourceSortDropdown from 'src/shared/components/resource_sort_dropdown/ResourceSortDropdown'
import {SortTypes} from 'src/shared/utils/sort'
import PresetFlows from 'src/flows/components/PresetFlows'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import {event} from 'src/cloud/utils/reporting'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {PROJECT_NAME_PLURAL} from 'src/flows'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Types
import {Flow} from 'src/types/flows'
import {ResourceType} from 'src/types'

import 'src/flows/components/controlSearchBar.scss'
import 'src/flows/style.scss'
import PresetFlowsButtons from './PresetFlowsButtons'

const FlowsIndex = () => {
  const fadingBoxRef = useRef()
  const [showButtonMode, setShowButtonMode] = useState(false)

  const fadeOutOnScroll = element => {
    const header = document.getElementsByClassName('cf-page-header')[0]

    if (!header) {
      return
    }

    const distanceToTop =
      window.pageYOffset +
      element.getBoundingClientRect().top +
      element.getBoundingClientRect().height -
      header.getBoundingClientRect().height

    const elementHeight = element.offsetHeight
    const scrollTop = document.documentElement.scrollTop

    let opacity = 1

    if (scrollTop > distanceToTop) {
      opacity = 1 - ((scrollTop - distanceToTop) / elementHeight) * 1.8
    }

    if (opacity >= 0) {
      element.style.opacity = opacity
    }

    if (distanceToTop < header.getBoundingClientRect().height) {
      setShowButtonMode(true)
      element.style.opacity = 0
    } else {
      if (showButtonMode) {
        setShowButtonMode(false)
      }
    }
  }

  function scrollHandler() {
    const elem = fadingBoxRef.current
    if (elem) {
      fadeOutOnScroll(elem)
    }
  }

  const {flows} = useContext(FlowListContext)
  const [search, setSearch] = useState('')
  const [sortOptions, setSortOptions] = useState({
    sortKey: 'createdAt' as keyof Flow,
    sortType: SortTypes.Date,
    sortDirection: Sort.Descending,
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
    if (
      sortKey === sortOptions.sortKey &&
      sortDirection === sortOptions.sortDirection
    ) {
      return
    }

    event('Notebook List Sort Change', {
      key: sortKey,
      direction: sortDirection,
    })

    setSortOptions({
      sortKey,
      sortType,
      sortDirection,
    })
  }

  useEffect(() => {
    event('Notebook List Page Visited')
  }, [])

  return (
    <Page
      titleTag={pageTitleSuffixer([PROJECT_NAME_PLURAL])}
      testID="flows-index"
      className="flows-index"
    >
      <PageHeader
        style={{flex: 0, margin: '16px 0px'}}
        fullWidth={false}
        className={`${showButtonMode && 'withButtonHeader'}`}
      >
        {!isFlagEnabled('noTutorial') && (
          <FlexBox
            direction={FlexDirection.Row}
            justifyContent={JustifyContent.SpaceBetween}
            stretchToFitWidth
          >
            <Page.Title title={PROJECT_NAME_PLURAL} />
            {!isFlagEnabled('multiOrg') && <RateLimitAlert location="flows" />}
          </FlexBox>
        )}
        {showButtonMode &&
          (isFlagEnabled('noTutorial') ? (
            <div style={{flex: 1, width: '100%'}}>
              <PresetFlowsButtons />
              <div className="preset--no-tutorial search">
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
              </div>
            </div>
          ) : (
            <>
              <PresetFlowsButtons />
              <Page.ControlBar
                className="flows-index--control-bar buttonMode"
                fullWidth={false}
              >
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
                <Page.ControlBarRight />
              </Page.ControlBar>
            </>
          ))}
      </PageHeader>
      <DapperScrollbars onScroll={scrollHandler}>
        <Page.Contents
          fullWidth={false}
          id="fadebox"
          ref={fadingBoxRef}
          className="flows-index--contents"
        >
          <PresetFlows />
          {isFlagEnabled('noTutorial') ? (
            <div className="preset--no-tutorial search">
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
            </div>
          ) : (
            <Page.ControlBar
              className="flows-index--control-bar"
              fullWidth={false}
            >
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
              <Page.ControlBarRight />
            </Page.ControlBar>
          )}
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
