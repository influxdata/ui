import React, {FC, useEffect, memo, useState, useMemo, useCallback} from 'react'
import {useLocation} from 'react-router-dom'
import {DocSearchModal} from '@docsearch/react'
import {v4 as uuid} from 'uuid'
import {ClickOutside} from 'src/shared/components/ClickOutside'
import '@docsearch/react/style'

import './GlobalSearch.scss'

import {event} from 'src/cloud/utils/reporting'

import {GLOBALSEARCH_API_KEY, GLOBALSEARCH_APP_ID} from 'src/shared/constants'

const Hit: FC<any> = memo(({hit, children}) => {
  const linkID = uuid()
  const location = useLocation()
  const logClickedSearchQuery = useCallback(() => {
    const clickedElem = document.getElementById(linkID) as HTMLLinkElement
    const searchQuery = document.getElementById(
      'docsearch-input'
    ) as HTMLInputElement
    event(
      'clicked search result',
      {
        resultURL: clickedElem.href,
        fromPage: location.pathname,
        query: searchQuery?.value,
      },
      {}
    )
  }, [linkID, location.pathname])

  useEffect(() => {
    const linkedElement = document.getElementById(linkID)

    linkedElement.addEventListener('click', logClickedSearchQuery)
    return () =>
      linkedElement.removeEventListener('click', logClickedSearchQuery)
  }, [linkID])
  return (
    <a href={hit.url} rel="noreferrer" target="_blank" id={linkID}>
      {children}
    </a>
  )
})

const GlobalSearch: FC = () => {
  const [showState, setShowState] = useState(false)
  const location = useLocation()
  const toggleShowSearch = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'h') {
      setShowState(true)
      event(`Global search opened from url ${location.pathname}`)
    } else if (e.key === 'Escape') {
      setShowState(false)
    }
  }
  useEffect(() => {
    document.addEventListener('keydown', toggleShowSearch)
    return () => document.removeEventListener('keydown', toggleShowSearch)
  }, [])

  const facetFilters = useMemo(
    () => ({
      facetFilters: [['project: influxdb', 'flux:true'], 'version: cloud'],
    }),
    []
  )
  return showState &&
    GLOBALSEARCH_API_KEY?.length &&
    GLOBALSEARCH_APP_ID?.length ? (
    <ClickOutside onClickOutside={() => setShowState(false)}>
      <DocSearchModal
        apiKey={GLOBALSEARCH_API_KEY}
        indexName="influxdata"
        appId={GLOBALSEARCH_APP_ID}
        placeholder="Search our docs: "
        initialScrollY={0}
        searchParameters={facetFilters}
        hitComponent={Hit}
      />
    </ClickOutside>
  ) : null
}

export default memo(GlobalSearch)
