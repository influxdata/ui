import { camelCase, snakeCase } from 'lodash'

const convertKeys = (data: { [key: string]: any }, t: (key: string) => string) =>
  Object.fromEntries(
    Object.entries(data).map(([key, value]) => ([t(key), value]))
  )

export const convertKeysToSnakecase = data =>
  !data ? null : convertKeys(data, snakeCase);

export const convertKeysToCamelCase = data =>
  !data ? null : convertKeys(data, camelCase);
