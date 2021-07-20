import React, {FC, memo, useMemo} from 'react'

import HitComponent from './HitComponent'

import {GLOBALSEARCH_API_KEY, GLOBALSEARCH_APP_ID} from 'src/shared/constants'

import {DocSearchModal} from '@docsearch/react'

const DocSearch: FC = () => {
  const facetFilters = useMemo(
    () => ({
      facetFilters: [['project: influxdb', 'flux:true'], 'version: cloud'],
    }),
    []
  )

  return (
    <DocSearchModal
      apiKey={GLOBALSEARCH_API_KEY}
      indexName="influxdata"
      appId={GLOBALSEARCH_APP_ID}
      placeholder="Search our docs: "
      initialScrollY={0}
      searchParameters={facetFilters}
      hitComponent={HitComponent}
    />
  )
}

export default memo(DocSearch)
