import {get} from 'lodash'

export function getDeep<T = any>(
  obj: any,
  path: string | number,
  fallback: T
): T {
  return get<T>(obj, path, fallback)
}

export const redirect = (location: string) => {
  window.location.assign(location)
}
