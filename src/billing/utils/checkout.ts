import {camelCase, snakeCase} from 'lodash'

export const convertKeysToSnakecase = data => {
  if (!data) {
    return null
  }

  return Object.entries(data).reduce((acc, entry) => {
    const [key, value] = entry
    const snakeKey = snakeCase(key)

    acc = {...acc, [snakeKey]: value}
    return acc
  }, {})
}

export const convertKeysToCamelCase = data => {
  if (!data) {
    return null
  }

  return Object.entries(data).reduce((acc, entry) => {
    const [key, value] = entry
    const camelKey = camelCase(key)

    acc = {...acc, [camelKey]: value}
    return acc
  }, {})
}
