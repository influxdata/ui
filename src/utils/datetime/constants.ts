export const DEFAULT_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
export const STRICT_ISO8061_TIME_FORMAT = 'STRICT_ISO8061_TIME_FORMAT'
export const RFC3339_PATTERN =
  /(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)(\s|T)?(\d\d)(:)?(\d\d)(:)?(\d\d)(\.\d+)?(Z|([+-])(\d\d)(:)?(\d\d))/

// Hard-coded dates required by the backend for caching purposes
export const CACHING_REQUIRED_START_DATE = '1677-09-21T00:12:43.145224194Z'
export const CACHING_REQUIRED_END_DATE = '2262-04-11T23:47:16.854775806Z'

export const MILLISECONDS_IN_ONE_DAY = 1000 * 60 * 60 * 24
