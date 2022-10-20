// Libraries
import {PureComponent} from 'react'

import {get, isEmpty, flatMap, sortedIndex} from 'lodash'

// Types
import {Label} from 'src/types'

// searchKeys: the keys whose values you want to filter on
// if the values are nested use dot notation i.e. tasks.org.name

type Resource = {name?: string}

export interface OwnProps<T> {
  children: (list: T[]) => any
  list: T[]
  searchKeys: string[]
  searchTerm: string
  sortByKey?: string
}

export interface StateProps {
  labels: {[uuid: string]: Label}
}

export type Props<T> = OwnProps<T> & StateProps

const INEXACT_PATH = /\w+\[\]/g
const EMPTY_ARRAY_BRACKETS = /\[\]?\./

/**
 * Filters a list using a searchTerm and searchKeys where
 *  searchKeys is an array of strings represents either an
 *  exact or inexact path to a property value(s):
 *  "user.name" (exact) or "authors[].name" (inexact)
 *
 */
export class FilterList<T extends Resource> extends PureComponent<Props<T>> {
  private collator: Intl.Collator

  public constructor(props) {
    super(props)
    this.collator = new Intl.Collator('en-us', {numeric: true})
  }

  public render() {
    return this.props.children(this.sorted)
  }

  private get sorted(): T[] {
    return this.filtered.sort((item1, item2) => {
      if (this.props.sortByKey) {
        return this.collator.compare(
          get(item1, this.props.sortByKey),
          get(item2, this.props.sortByKey)
        )
      }

      return this.collator.compare(item1.name, item2.name)
    })
  }

  private get filtered(): T[] {
    const {list, labels, searchKeys} = this.props
    const {formattedSearchTerm} = this

    if (isEmpty(formattedSearchTerm)) {
      return list
    }

    const filtered = list.filter(listItem => {
      const item = {
        ...listItem,
        labels: get(listItem, 'labels', []).map(labelID => labels[labelID]),
      }

      const isInList = searchKeys.some(key => {
        const value = this.getKey(item, key)

        const isStringArray = this.isStringArray(value)

        if (!isStringArray && typeof value === 'object') {
          throw new Error(
            `The value at key "${key}" is an object.  Take a look at "searchKeys" and
             make sure you're indexing onto a primitive value`
          )
        }

        if (isStringArray) {
          const searchIndex = this.createIndex(value)
          return this.checkIndex(searchIndex, formattedSearchTerm)
        }

        return String(value).toLocaleLowerCase().includes(formattedSearchTerm)
      })

      return isInList
    })

    return filtered
  }

  private isStringArray(value: any): boolean {
    if (!Array.isArray(value)) {
      return false
    }

    if (isEmpty(value) || typeof value[0] === 'string') {
      return true
    }

    return false
  }

  private get formattedSearchTerm(): string {
    return this.props.searchTerm.trimLeft().toLocaleLowerCase()
  }

  private getKey(item: T, key: string) {
    const isInexact = key.match(INEXACT_PATH)

    if (!isInexact) {
      return get(item, key, '')
    } else {
      return this.getInExactKey(item, key)
    }
  }

  private getInExactKey(item: T, key: string) {
    const paths = key.split(EMPTY_ARRAY_BRACKETS)
    // flattens nested arrays into one large array
    const values = paths.reduce(
      (results, path) => flatMap(results, r => get(r, path, [])),
      [item]
    )

    return values
  }

  private createIndex = (terms: string[]) => {
    return flatMap(terms, this.extractSuffixes).sort()
  }

  private checkIndex = (sortedSuffixes: string[], searchTerm) => {
    const index = sortedIndex(sortedSuffixes, searchTerm)
    const nearestSuffix = sortedSuffixes[index]

    if (!!nearestSuffix && nearestSuffix.includes(searchTerm)) {
      return true
    }

    return false
  }

  private extractSuffixes = (term: string) => {
    const suffixes = new Array(term.length)
    const lowerTerm = term.toLocaleLowerCase()

    for (let i = 0; i < suffixes.length; i++) {
      suffixes[i] = lowerTerm.slice(i)
    }

    return suffixes
  }
}
