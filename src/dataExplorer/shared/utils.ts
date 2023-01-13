import {useState, useEffect} from 'react'
import {LanguageType} from 'src/dataExplorer/components/resources'
import {TimeRange} from 'src/types'

export const LOAD_MORE_LIMIT_INITIAL = 8
export const LOAD_MORE_LIMIT = 25
export const IMPORT_REGEXP = 'import "regexp"\n'
export const IMPORT_STRINGS = 'import "strings"\n'
export const IMPORT_INFLUX_SCHEMA = 'import "influxdata/influxdb/schema"\n'

// Sample data always has bucket id. Here is the code for sample bucket list
//  Src/shared/contexts/buckets.tsx
export const SAMPLE_DATA_SET = (bucketID: string) =>
  `import "influxdata/influxdb/sample"\nsample.data(set: "${bucketID}")`

export const FROM_BUCKET = (bucketName: string) =>
  `from(bucket: "${bucketName}")`

export const SEARCH_STRING = (searchTerm: string): string =>
  `|> filter(fn: (r) => r._value =~ regexp.compile(v: "(?i:" + regexp.quoteMeta(v: "${searchTerm}") + ")"))`

export const getLanguage = () => {
  const urlSearchParams = new URLSearchParams(window.location.search)
  const urlParams = Object.fromEntries(urlSearchParams.entries())
  return (urlParams?.language as LanguageType) ?? LanguageType.FLUX
}

export const useSessionStorage = (keyName: string, defaultValue: any) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const value = window.sessionStorage.getItem(keyName)

      if (value) {
        return JSON.parse(value)
      } else {
        window.sessionStorage.setItem(keyName, JSON.stringify(defaultValue))
        return defaultValue
      }
    } catch (err) {
      return defaultValue
    }
  })

  const setValue = (newValue: any) => {
    try {
      window.sessionStorage.setItem(keyName, JSON.stringify(newValue))
      window.dispatchEvent(
        new CustomEvent('same.storage', {
          detail: {key: keyName, oldValue: storedValue, newValue},
        })
      )
    } catch (err) {}
    setStoredValue(newValue)
  }

  // multiple implementations of the same provider, though they share the same state
  // in window.sessionStorage, will fall out of sync as their setStoredValue
  // functions dont know about each other. there's a 'storage' event on window built
  // to mitigate that issue, but it's only fired across tabs, which session storage
  // doesn't even operate across. So here we're generating a custom event to keep
  // all inter-tab invokations of the session storage hook in sync.
  useEffect(() => {
    const listen = (evt: CustomEvent) => {
      if (!evt.detail.key || evt.detail.key !== keyName) {
        return
      }

      setStoredValue(evt.detail.newValue)
    }

    window.addEventListener('same.storage', listen)

    return () => {
      window.removeEventListener('same.storage', listen)
    }
  }, [])

  return [storedValue, setValue]
}

const DEBOUNCE_TIMEOUT = 500
let timer: ReturnType<typeof setTimeout>
type NOOP = () => void
export const debouncer = (action: NOOP): void => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    action()
    timer = null
  }, DEBOUNCE_TIMEOUT)
}

export const rangeToParam = (timeRange: TimeRange) => {
  let timeRangeStart: string, timeRangeStop: string
  const durationRegExp = /([0-9]+)(y|mo|w|d|h|ms|s|m|us|µs|ns)$/g

  if (!timeRange) {
    timeRangeStart = timeRangeStop = null
  } else {
    if (timeRange.type === 'selectable-duration') {
      timeRangeStart = '-' + timeRange.duration
    } else if (timeRange.type === 'duration') {
      timeRangeStart = '-' + timeRange.lower
    } else if (!isNaN(Number(timeRange.lower)) || timeRange.lower === 'now()') {
      timeRangeStart = timeRange.lower
    } else if (!!timeRange?.lower?.match(durationRegExp)) {
      timeRangeStart = timeRange.lower
    } else if (isNaN(Date.parse(timeRange.lower))) {
      timeRangeStart = null
    } else {
      timeRangeStart = new Date(timeRange.lower).toISOString()
    }

    if (!timeRange.upper) {
      timeRangeStop = 'now()'
    } else if (!isNaN(Number(timeRange.upper)) || timeRange.upper === 'now()') {
      timeRangeStop = timeRange.upper
    } else if (!!timeRange?.upper?.match(durationRegExp)) {
      timeRangeStop = timeRange.upper
    } else if (isNaN(Date.parse(timeRange.upper))) {
      timeRangeStop = null
    } else {
      timeRangeStop = new Date(timeRange.upper).toISOString()
    }
  }

  return {
    timeRangeStart,
    timeRangeStop,
  }
}
