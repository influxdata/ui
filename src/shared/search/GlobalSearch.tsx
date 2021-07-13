import React, {FC, useEffect, memo, useState, useMemo} from 'react'

import {DocSearchModal} from '@docsearch/react'

import '@docsearch/react/style'

import './GlobalSearch.scss'

const Hit: FC<any> = memo(({hit, children}) => {
  return (
    <a href={hit.url} rel="noreferrer" target="_blank">
      {children}
    </a>
  )
})

const GlobalSearch: FC = () => {
  const [showState, setShowState] = useState(false)
  const toggleShowSearch = (event: KeyboardEvent) => {
    const x = document.getElementById('spotlight_wrapper')
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      setShowState(true)
    } else if (event.key === 'Escape') {
      setShowState(false)
    }
  }
  useEffect(() => {
    document.addEventListener('keydown', toggleShowSearch)
    return () => document.removeEventListener('keydown', toggleShowSearch)
  }, [])
  // useEffect(() => {
  //   docSearch({
  //     apiKey: ,
  //     appId: 'WHM9UWMP6M',
  //     indexName: 'influxdata',
  //     inputSelector: '#spotlight',
  //     // Set debug to true if you want to inspect the dropdown
  //     debug: true,
  //     algoliaOptions: {
  //       facetFilters: [['project: influxdb', 'flux:true'], 'version: cloud'],
  //     },
  //     handleSelected: function(
  //       input,
  //       _event,
  //       suggestion,
  //       _datasetNumber,
  //       context
  //     ) {
  //       // Prevents the default behavior on click and rather opens the suggestion
  //       // in a new tab.
  //       if (context.selectionMethod === 'click') {
  //         input.setVal('')

  //         const windowReference = window.open(suggestion.url, '_blank')
  //         windowReference.focus()
  //       }
  //     },
  //   })
  // }, [])
  const facetFilters = useMemo(
    () => ({
      facetFilters: [['project: influxdb', 'flux:true'], 'version: cloud'],
    }),
    []
  )
  return showState ? (
    // <div id="spotlight_wrapper">
    //   <input
    //     type="text"
    //     id="spotlight"
    //     name="spotlight"
    //     placeholder="Search our documentation: "
    //   />
    // </div>,
    <DocSearchModal
      apiKey="ba4435a9d456ac0d954cc276206eac06"
      indexName="influxdata"
      appId="WHM9UWMP6M"
      placeholder="Search our docs: "
      initialScrollY={0}
      searchParameters={facetFilters}
      hitComponent={Hit}
    />
  ) : null
}

export default memo(GlobalSearch)
