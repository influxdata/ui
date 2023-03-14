// Types
import {TagKeyValuePair} from 'src/types'

export const groupedTagValues = (
  tagValues: TagKeyValuePair[]
): {[key: string]: string[]} =>
  tagValues.reduce(
    (acc, {key, value}) => ({
      ...acc,
      [key]: (acc[key] || []).concat([value]),
    }),
    {}
  )
