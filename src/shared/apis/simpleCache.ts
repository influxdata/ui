import {Variable} from 'src/types'
import {FromFluxResult} from '@influxdata/giraffe'
import {filterUnusedVarsBasedOnQuery} from 'src/shared/utils/filterUnusedVars'
import {event} from 'src/cloud/utils/reporting'
import simpleQuery from 'src/shared/apis/simpleQuery'
import {RemoteDataState} from 'src/types'

export const TIME_INVALIDATION = 1000 * 60 * 10 // 10 minutes

// Hashing function found here:
// https://jsperf.com/hashcodelordvlad
// Through this thread:
// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
const hashString = (rawText: string): string => {
  let hash = 0
  if (!rawText) {
    return `${hash}`
  }
  for (let i = 0; i < rawText.length; i++) {
    hash = (hash << 5) - hash + rawText.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  return `${hash}`
}

const generateHash = (orgID: string, query: string, variables: Variable[]) => {
  const queryHash = hashString(`org[${orgID}]:${query}`)
  const variableHash = hashString(
    filterUnusedVarsBasedOnQuery(variables, [query])
      .sort((a: Variable, b: Variable) => a.name.localeCompare(b.name))
      .map(variable => {
        if (variable.arguments?.type === 'system') {
          return `<v.${variable.name}::${(variable.arguments.values || []).join(
            ','
          )}>`
        }

        return `<v.${variable.name}::${(variable.selected || []).join(',')}>`
      })
  )

  return {
    query: queryHash,
    variable: variableHash,
  }
}

interface Callback {
  [0]: (response: FromFluxResult) => any
  [1]: (error: Error) => void
}

interface CacheEntry {
  status: RemoteDataState
  resolved: number | null
  cancel: () => void
  pending: Callback[]
  results: FromFluxResult | null
}

interface Cache {
  [query: string]: {
    [variables: string]: CacheEntry
  }
}

const cache: Cache = {}
;(() => {
  const clean = () => {
    const now = Date.now()

    Object.entries(cache).forEach(([queryID, queryCache]) => {
      Object.entries(queryCache).forEach(([variableID, resultEntry]) => {
        if (resultEntry.resolved > now - TIME_INVALIDATION) {
          return
        }

        resultEntry.cancel()

        cache[queryID][variableID] = {
          status: RemoteDataState.NotStarted,
          resolved: null,
          cancel: () => {},
          pending: [],
          results: null,
        }
      })
    })
  }

  setInterval(() => {
    clean()
  }, TIME_INVALIDATION / 2)

  clean()
})()

export function clear() {
  event('Query Cache Cleared')

  Object.entries(cache).forEach(([queryID, queryCache]) => {
    Object.entries(queryCache).forEach(([_, resultEntry]) => {
      if (resultEntry.status === RemoteDataState.Loading) {
        resultEntry.cancel()
      }
    })
    delete cache[queryID]
  })
}

export function status(orgID: string, query: string, variables?: Variable[]) {
  const hash = generateHash(orgID, query, variables)

  if (!cache.hasOwnProperty(hash.query)) {
    return RemoteDataState.NotStarted
  }

  if (!cache[hash.query].hasOwnProperty(hash.variable)) {
    return RemoteDataState.NotStarted
  }

  return cache[hash.query][hash.variable].status
}

export default function(orgID: string, query: string, variables?: Variable[]) {
  const hash = generateHash(orgID, query, variables)

  if (!cache.hasOwnProperty(hash.query)) {
    cache[hash.query] = {}
  }

  if (!cache[hash.query].hasOwnProperty(hash.variable)) {
    cache[hash.query][hash.variable] = {
      resolved: null,
      status: RemoteDataState.NotStarted,
      cancel: () => {},
      pending: [],
      results: null,
    }
  }

  const entry = cache[hash.query][hash.variable]
  let fauxPromise

  // Got a cache hit. Lets save some data!
  if (entry.results) {
    event('Query Cache Hit')

    fauxPromise = new Promise(resolve => {
      resolve(entry.results)
    })

    fauxPromise.cancel = () => {
      // NOTE refetch all of this data incase we break
      // some references along the way
      cache[hash.query][hash.variable].cancel()
    }

    return fauxPromise
  }

  event('Query Cache Miss')

  // Cache miss and no running queries. Lets make a mutex
  if (entry.status === RemoteDataState.NotStarted) {
    entry.status = RemoteDataState.Loading

    const _query = simpleQuery(orgID, query, variables)

    _query
      .then(results => {
        let curr

        entry.results = results
        entry.resolved = Date.now()
        entry.cancel = () => {}
        entry.status = RemoteDataState.Done

        while (entry.pending.length) {
          curr = entry.pending.pop()
          curr[0](results)
        }
      })
      .catch(e => {
        let curr

        entry.results = null
        entry.resolved = Date.now()
        entry.cancel = () => {}
        entry.status = RemoteDataState.Error

        while (entry.pending.length) {
          curr = entry.pending.pop()
          curr[1](e)
        }
      })

    entry.cancel = () => {
      // This should propegate CancelError to those promises
      // that have registered a reject function
      _query.cancel()
    }
  }

  // register them all to the callbacks and chill
  fauxPromise = new Promise((resolve, reject) => {
    entry.pending.push([resolve, reject])
  })

  fauxPromise.cancel = () => {
    // NOTE refetch all of this data incase we break
    // some references along the way
    cache[hash.query][hash.variable].cancel()
  }

  return fauxPromise
}
