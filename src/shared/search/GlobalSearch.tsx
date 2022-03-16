import React, {FC, useEffect, memo, useState} from 'react'
import {useLocation} from 'react-router-dom'

import {ClickOutside} from 'src/shared/components/ClickOutside'

import {event} from 'src/cloud/utils/reporting'

import {GLOBALSEARCH_API_KEY, GLOBALSEARCH_APP_ID} from 'src/shared/constants'

import DocSearch, {DocSearchType} from 'src/shared/search/DocSearch'

import './GlobalSearch.scss'

const GlobalSearch: FC = () => {
  const [showState, setShowState] = useState(false)
  const location = useLocation()
  const toggleShowSearch = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'm') {
      setShowState(true)
      event(`Global search opened`)
    } else if (e.key === 'Escape') {
      setShowState(false)
    }
  }
  useEffect(() => {
    document.addEventListener('keydown', toggleShowSearch)
    return () => document.removeEventListener('keydown', toggleShowSearch)
  }, [])

  return showState &&
    GLOBALSEARCH_API_KEY?.length &&
    GLOBALSEARCH_APP_ID?.length ? (
    <ClickOutside onClickOutside={() => setShowState(false)}>
      <div className="GlobalSearch">
        <DocSearch type={DocSearchType.Global} />
      </div>
    </ClickOutside>
  ) : null
}

export default memo(GlobalSearch)
