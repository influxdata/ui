import {useState, useEffect} from 'react'
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
      console.error(`Error grabbing [${keyName}]:`, err)
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
    } catch (err) {
      console.error(`Error setting [${keyName}]:`, err)
    }
    setStoredValue(newValue)
  }

  // add psudo storage event to communicate
  // across implementations that share the same key
  useEffect(() => {
    const listen = evt => {
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
