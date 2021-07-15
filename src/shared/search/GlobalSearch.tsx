import React, {FC, useEffect, memo, useState, useMemo} from 'react'
import {useLocation} from 'react-router-dom'
import {DocSearchModal} from '@docsearch/react'
import {ClickOutside} from 'src/shared/components/ClickOutside'
import '@docsearch/react/style'

import './GlobalSearch.scss'

import {event} from 'src/cloud/utils/reporting'

import {GLOBALSEARCH_API_KEY, GLOBALSEARCH_APP_ID} from 'src/shared/constants'

const propsAreEqual = (prev, next) => {
  return prev.url === next.url
}
const Hit: FC<any> = memo(({hit, children}) => {
  const location = useLocation()
  const inputElem = document.getElementById(
    'docsearch-input'
  ) as HTMLInputElement

  const logClickedSearchQuery = (e: any) => {
    event(
      'clicked search result',
      {
        resultURL: e.target?.parentElement?.parentElement?.parentElement?.href,
        fromPage: location.pathname,
        query: inputElem.value,
      },
      {}
    )
  }

  return (
    <a
      href={hit.url}
      rel="noreferrer"
      target="_blank"
      onClick={logClickedSearchQuery}
    >
      {children}
    </a>
  )
}, propsAreEqual)

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
