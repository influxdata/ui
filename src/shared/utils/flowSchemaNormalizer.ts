// Types
import {NormalizedSchema, NormalizedTag, Schema, Tag} from 'src/types'
import {PipeData} from 'src/types/flows'

export const dedupeTags = (tags: Tag[]): NormalizedTag[] => {
  const cache = {}
  const set = new Set()
  let results = []
  tags.forEach(tag => {
    Object.entries(tag).forEach(([tagName, values]) => {
      const tagValues = [...values]
      // sorting tagValues to check for exact matches when doing string comparisons
      tagValues.sort()
      const vals = JSON.stringify(tagValues)
      if (tagName in cache === false) {
        cache[tagName] = vals
        set.add(vals)
        results = results.concat({
          [tagName]: tagValues,
        })
        return
      }
      if (cache[tagName] === vals || set.has(vals)) {
        return
      } else {
        set.add(vals)
        results = results.concat({
          [tagName]: tagValues,
        })
      }
    })
  })
  return results
}

const filterFields = (
  fields: string[],
  searchTerm: string,
  selectedField: string
): string[] => {
  return fields.filter((field: string) => {
    if (!!selectedField) {
      return field === selectedField
    }
    return field.toLowerCase().includes(searchTerm)
  })
}

const filterTags = (
  tags: NormalizedTag[],
  searchTerm: string
): NormalizedTag[] =>
  tags.filter(
    tag =>
      Object.entries(tag).filter(([tagName, tagValues]) => {
        if (tagName.toLowerCase().includes(searchTerm)) {
          return true
        }
        return tagValues?.some(val => val.toLowerCase().includes(searchTerm))
      }).length !== 0
  )

export const normalizeSchema = (
  schema: Schema,
  data: PipeData,
  searchTerm: string
): NormalizedSchema => {
  if (!schema) {
    return {
      measurements: [],
      fields: [],
      tags: [],
    }
  }
  const lowerCasedSearchTerm = searchTerm.toLowerCase()
  const selectedMeasurement = data.measurement
  const selectedField = data.field
  const selectedTags = data?.tags

  const measurements = []
  let fieldResults = []
  let tagResults = []

  Object.entries(schema)
    .filter(([measurement, values]) => {
      if (!!selectedMeasurement) {
        // filter out non-selected measurements
        return measurement === selectedMeasurement
      }
      const {fields, tags} = values
      if (!!selectedField) {
        // filter out measurements that are not associated with the selected field
        return fields.some(field => field === selectedField)
      }
      if (Object.keys(selectedTags)?.length > 0) {
        const tagNames = Object.keys(selectedTags)
        // TODO(ariel): do we care about matching the values as well?
        return tagNames.some(tagName => tagName in tags)
      }
      if (measurement.toLowerCase().includes(lowerCasedSearchTerm)) {
        return true
      }
      if (
        fields.some(field => field.toLowerCase().includes(lowerCasedSearchTerm))
      ) {
        return true
      }
      return Object.entries(tags).some(([tag, values]) => {
        if (tag.toLowerCase().includes(lowerCasedSearchTerm)) {
          return true
        }
        const tagValues = [...values]
        return (
          tagValues?.some(tagValue =>
            `${tagValue}`.toLowerCase().includes(lowerCasedSearchTerm)
          ) || false
        )
      })
    })
    .forEach(([measurement, values]) => {
      measurements.push(measurement)
      const {fields, tags} = values
      fieldResults = fieldResults.concat(fields)
      tagResults = tagResults.concat(tags)
    })

  const dedupedTags = dedupeTags(tagResults)
  const filteredFields = filterFields(
    [...new Set(fieldResults)],
    lowerCasedSearchTerm,
    data?.field
  )

  const dedupedMeasurements = [...new Set(measurements)].filter(a =>
    a.toLowerCase().includes(lowerCasedSearchTerm)
  )

  dedupedMeasurements.sort((a, b) => a.localeCompare(b))

  const filteredTags = filterTags(dedupedTags, lowerCasedSearchTerm).map(
    tag => {
      const key = Object.keys(tag)[0]

      return {
        [key]: tag[key].sort((a, b) => a.localeCompare(b)),
      }
    }
  )

  filteredFields
    .filter(a => a.toLowerCase().includes(lowerCasedSearchTerm))
    .sort((a, b) => a.localeCompare(b))
  filteredTags
    .filter(a =>
      Object.keys(a)[0]
        .toLowerCase()
        .includes(lowerCasedSearchTerm)
    )
    .sort((a, b) => {
      const keyA = Object.keys(a)[0].toLowerCase()
      const keyB = Object.keys(b)[0].toLowerCase()

      return keyA.localeCompare(keyB)
    })

  return {
    measurements: dedupedMeasurements,
    fields: filteredFields,
    tags: filteredTags,
  }
}
