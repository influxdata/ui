import React, {FC, useEffect, useContext} from 'react'
import {createPortal} from 'react-dom'
import {Overlay} from '@influxdata/clockface'
import {OverlayContext} from 'src/overlays/components/OverlayController'

import './GlobalSearch.scss'

import docSearch from 'docsearch.js'

const GlobalSearch: FC = () => {
  const {onClose} = useContext(OverlayContext)

  useEffect(() => {
    docSearch({
      apiKey: 'ba4435a9d456ac0d954cc276206eac06',
      appId: 'WHM9UWMP6M',
      indexName: 'influxdata',
      inputSelector: '#spotlight',
      // Set debug to true if you want to inspect the dropdown
      debug: true,
      algoliaOptions: {
        facetFilters: [['project: influxdb', 'flux:true'], 'version: cloud'],
      },
    })
  }, [])
  return createPortal(
    <div id="spotlight_wrapper">
      <input
        type="text"
        id="spotlight"
        name="spotlight"
        placeholder="Search our documentation: "
      />
    </div>,
    document.querySelector('body')
  )
}

export default GlobalSearch
