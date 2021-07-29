import React, {FC, memo} from 'react'
import {event} from 'src/cloud/utils/reporting'

import {useLocation} from 'react-router-dom'

const propsAreEqual = (prev, next) => {
  return prev.url === next.url
}
const HitComponent: FC<any> = memo(({hit, children}) => {
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

export default HitComponent
