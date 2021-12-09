import {get} from 'lodash'

export enum SortTypes {
  String = 'string',
  Date = 'date',
  Float = 'float',
}

const collator = new Intl.Collator('en-us', {numeric: true})

function orderByType(data, type) {
  switch (type) {
    case SortTypes.String:
      return data?.toLowerCase() ?? ''
    case SortTypes.Date:
      return Date.parse(data)
    case SortTypes.Float:
      return parseFloat(data)
    default:
      return data
  }
}

export function getSortedResources<T>(
  resourceList: T[],
  sortKey: string,
  sortDirection: string,
  sortType: string
): T[] {
  if (sortKey && sortDirection) {
    return [...resourceList].sort((item1, item2) => {
      if (sortDirection === 'desc') {
        return collator.compare(
          orderByType(get(item2, sortKey), sortType),
          orderByType(get(item1, sortKey), sortType)
        )
      }
      return collator.compare(
        orderByType(get(item1, sortKey), sortType),
        orderByType(get(item2, sortKey), sortType)
      )
    })
  }
  return resourceList
}
