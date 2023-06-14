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

export const getTagKeys = (tagValues: TagKeyValuePair[]): string[] => {
  const tagKeys = new Set<string>()
  tagValues.forEach((pair: TagKeyValuePair) => {
    tagKeys.add(pair.key)
  })
  return Array.from(tagKeys)
}
