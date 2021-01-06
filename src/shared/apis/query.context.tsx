import {FLUX_RESPONSE_BYTES_LIMIT, API_BASE_PATH} from 'src/shared/constants'

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

interface QueryHash {
  query: string
  variable: string
}

const filterVariables = (variables: Variable[], query: string): Variable[] => {
  const varsInUse = variables.filter(variable =>
    isInQuery(query, variable)
  )
}

const generateHash = (
  url: string,
  orgID: string,
  query: string,
  buckets: Bucket[],
  variables: Variable[]
): QueryHash => {
  const queryHash = hashString(`url[${url}]:org[${orgID}]:${query}`)
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

const findOrgID = (text, buckets): string => {
  const ast = parse(text)

  const _search = (node, acc = []) => {
    if (!node) {
      return acc
    }
    if (
      node?.type === 'CallExpression' &&
      node?.callee?.type === 'Identifier' &&
      node?.callee?.name === 'from' &&
      node?.arguments[0]?.properties[0]?.key?.name === 'bucket'
    ) {
      acc.push(node)
    }

    Object.values(node).forEach(val => {
      if (Array.isArray(val)) {
        val.forEach(_val => {
          _search(_val, acc)
        })
      } else if (typeof val === 'object') {
        _search(val, acc)
      }
    })

    return acc
  }

  const queryBuckets = _search(ast).map(
    node => node?.arguments[0]?.properties[0]?.value.value
  )

  const bucket = buckets.find(buck => queryBuckets.includes(buck.name))

  return bucket?.orgID
}

const DEFAULT_QUERY_ENDPOINT = `${API_BASE_PATH}api/v2/query`

interface QueryProviderProps {
  url?: string // the url that the query should be hitting
}

export const QueryProvider: FC<QueryProviderProps> = ({url, children}) => {
  const cache = useSelector((state: AppState) => getCache(state))
  const variables = useSelector((state: AppState) => getVariables(state))

  const data = useCallback((text: string): QueryResult | QueryError => {
    if (!buckets.length) {
      return null
    }

    const orgID = findOrgID(query, buckets)
    const hash = generateHash(
      url || DEFAULT_QUERY_ENDPOINT,
      orgID,
      text,
      variables || []
    )

    if (!cache.hasOwnProperty(hash.query)) {
      return null
    }
    if (!cache[hash.query].hasOwnProperty(hash.variable)) {
      return null
    }

    const entry = cache[hash.query][hash.variable]

    if (entry.resolve > Date.now() - TIME_INVALIDATION) {
      return null
    }

    if (entry.status === RemoteDataState.Error) {
      return entry.error
    }

    return entry.results
  }, [])

  const status = useCallback((text: string) => {
    if (!buckets.length) {
      return RemoteDataState.NotStarted
    }

    const orgID = findOrgID(query, buckets)
    const hash = generateHash(
      url || DEFAULT_QUERY_ENDPOINT,
      orgID,
      text,
      variables || []
    )

    if (!cache.hasOwnProperty(hash.query)) {
      return RemoteDataState.NotStarted
    }
    if (!cache[hash.query].hasOwnProperty(hash.variable)) {
      return RemoteDataState.NotStarted
    }

    return cache[hash.query][hash.variable].status
  }, [])

  const cancel = useCallback((text: string) => {
    if (!buckets.length) {
      return
    }

    const orgID = findOrgID(query, buckets)
    const hash = generateHash(
      url || DEFAULT_QUERY_ENDPOINT,
      orgID,
      text,
      variables || []
    )

    if (!cache.hasOwnProperty(hash.query)) {
      return
    }
    if (!cache[hash.query].hasOwnProperty(hash.variable)) {
      return
    }

    cache[hash.query][hash.variable].cancel()
  }, [])

  const query = useCallback(
    (text: string): void => {
      //TODO make a registration scheme in case the buckets
      // need to be loaded first
      if (!buckets.length) {
        return
      }

      const orgID = findOrgID(query, buckets)
      const hash = generateHash(
        url || DEFAULT_QUERY_ENDPOINT,
        orgID,
        text,
        variables || []
      )
      const embeddedQuery = embedVariables(text, variables)

      if (!cache.hasOwnProperty(hash.query)) {
        cache[hash.query] = {}
      }

      if (!cache[hash.query].hasOwnProperty(hash.variable)) {
        cache[hash.query][hash.variable] = {
          resolved: null,
          status: RemoteDataState.NotStarted,
          cancel: () => {},
          results: null,
          error: '',
        }
      }

      const entry = cache[hash.query][hash.variable]

      // Got a cache hit. Lets save some data!
      if (entry.results && entry.resolved > Date.now() - TIME_INVALIDATION) {
        event('Query Cache Hit')

        return
      }

      // Something else already picked this up
      if (entry.status === RemoteDataState.Loading) {
        return
      }

      event('Query Cache Miss')

      // Place a mutex lock on the redux store, giving it a
      // reference to the fetch abort controller
      const controller = new AbortController()

      dispatch(
        updateCacheEntry(hash, {
          resolved: null,
          status: RemoteDataState.Loading,
          cancel: () => {
            controller.abort()
          },
          results: null,
          error: '',
        })
      )

      // Lets send a request
      const _url = `${url}?${new URLSearchParams({orgID})}`

      const headers = {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip',
      }

      const request = fetch(_url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: embeddedQuery,
          dialect: {annotations: ['group', 'datatype', 'default']},
        }),
        signal: controller?.signal,
      })
        .then(response => {
          if (response.status === RATE_LIMIT_ERROR_STATUS) {
            dispatch(
              updateCacheEntry(hash, {
                resolved: Date.now(),
                status: RemoteDataState.Error,
                cancel: () => {},
                results: null,
                error: RATE_LIMIT_ERROR_TEXT,
              })
            )

            return
          }

          if (response.status !== 200) {
            response
              .text()
              .then(text => {
                if (text) {
                  return text
                }

                const headerError = response.headers.get('x-influxdb-error')

                if (headerError) {
                  return headerError
                }

                return 'Unknown Error'
              })
              .then(error => {
                dispatch(
                  updateCacheEntry(hash, {
                    resolved: Date.now(),
                    status: RemoteDataState.Error,
                    cancel: () => {},
                    results: null,
                    error: error,
                  })
                )
              })
            return
          }

          if (response.body) {
            return (async () => {
              let data = ''
              const reader = response.body.getReader()
              let chunk: ReadableStreamReadResult<Uint8Array>

              do {
                chunk = await reader.read()

                // TODO: point this to a live / partial parser to reduce memory usage
                data += chunk.value
              } while (!chunk.done)
              dispatch(
                updateCacheEntry(hash, {
                  resolved: Date.now(),
                  status: RemoteDataState.Done,
                  cancel: () => {},
                  results: {
                    raw: data,
                    parsed: fromFlux(data),
                    source: embeddedQuery,
                  },
                  error: '',
                })
              )
            })()
          } else {
            return (async () => {
              const data = await response.text()
              dispatch(
                updateCacheEntry(hash, {
                  resolved: Date.now(),
                  status: RemoteDataState.Done,
                  cancel: () => {},
                  results: {
                    raw: data,
                    parsed: fromFlux(data),
                    source: embeddedQuery,
                  },
                  error: '',
                })
              )
            })()
          }
        })
        .catch(e => {
          if (e.name === 'AbortError') {
            dispatch(
              updateCacheEntry(hash, {
                resolved: null,
                status: RemoteDataState.NotStarted,
                cancel: () => {},
                results: null,
                error: '',
              })
            )
          } else {
            dispatch(
              updateCacheEntry(hash, {
                resolved: Date.now(),
                status: RemoteDataState.Error,
                cancel: () => {},
                results: null,
                error: 'Unknown Network Error',
              })
            )
          }
        })

      const windowVars = getWindowVars(text, vars)
      const extern = buildVarsOption([...vars, ...windowVars])
      const queryID = generateHashedQueryID(text, variables, orgID)

      const result = runQuery(orgID, text, extern)
      return result.promise
        .then(raw => {
          if (raw.type !== 'SUCCESS') {
            throw new Error(raw.message)
          }

          return raw
        })
        .then(raw => {
          return {
            source: text,
            raw: raw.csv,
            parsed: fromFlux(raw.csv),
            error: null,
          }
        })
    },
    [variables]
  )
}
