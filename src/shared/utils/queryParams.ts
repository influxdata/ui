import qs from 'qs'
import {pickBy} from 'lodash'
import {RouteComponentProps} from 'react-router-dom'

export const readQueryParams = (): {[key: string]: any} => {
  return qs.parse(window.location.search, {ignoreQueryPrefix: true})
}

/*
  Given an object of query parameter keys and values, updates any corresponding
  query parameters in the URL to match. If the supplied object has a null value
  for a key, that query parameter will be removed from the URL altogether.
*/
export const updateQueryParams = (
  updatedQueryParams: object,
  history: RouteComponentProps['history']
): void => {
  const currentQueryString = window.location.search
  const newQueryParams = pickBy(
    {
      ...qs.parse(currentQueryString, {ignoreQueryPrefix: true}),
      ...updatedQueryParams,
    },
    v => !!v
  )

  const newQueryString = qs.stringify(newQueryParams)

  history.replace(`${window.location.pathname}?${newQueryString}`)
}
