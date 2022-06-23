import React, {FC, memo, useEffect, useMemo} from 'react'
import {useLocation} from 'react-router-dom'

import HitComponent from './HitComponent'

import {GLOBALSEARCH_API_KEY, GLOBALSEARCH_APP_ID} from 'src/shared/constants'

import {DocSearchModal} from '@docsearch/react'

import {event} from 'src/cloud/utils/reporting'

export enum DocSearchType {
  Widget = 'widget',
  Global = 'global',
}
interface DocSearchProps {
  type?: DocSearchType
}
const DocSearch: FC<DocSearchProps> = ({type}) => {
  const location = useLocation()

  const logClickSearchEvent = () => {
    const pathName = location.pathname.split('/')
    event('Search Bar Activation', {
      type,
      path: type === DocSearchType.Widget ? '/' : pathName[pathName.length - 1],
    })
  }

  useEffect(() => {
    const searchBar = document.getElementById('docsearch-input')
    searchBar.addEventListener('click', logClickSearchEvent)

    return () => {
      if (searchBar) {
        searchBar.removeEventListener('click', logClickSearchEvent)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const facetFilters = useMemo(
    () => ({
      facetFilters: [['searchTag: influxdb-cloud', 'flux:true']],
    }),
    []
  )

  return (
    <DocSearchModal
      apiKey={GLOBALSEARCH_API_KEY}
      indexName="influxdata"
      appId={GLOBALSEARCH_APP_ID}
      placeholder="Search Documentation"
      initialScrollY={0}
      searchParameters={facetFilters}
      hitComponent={HitComponent}
    />
  )
}

export default memo(DocSearch)
