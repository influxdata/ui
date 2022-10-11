import React, {FC, useEffect, useRef} from 'react'
import {useDispatch} from 'react-redux'
import {useSelector} from 'react-redux'
import {nanoid} from 'nanoid'

import {getOrg} from 'src/organizations/selectors'
import {fromFlux} from '@influxdata/giraffe'
import {FluxResult} from 'src/types/flows'

// Query Helpers
import {
  simplify,
  updateWindowPeriod,
} from 'src/shared/contexts/query/preprocessing'
import {trimPartialLines} from 'src/shared/contexts/query/postprocessing'

// Constants
import {FLUX_RESPONSE_BYTES_LIMIT} from 'src/shared/constants'
import {
  RATE_LIMIT_ERROR_STATUS,
  RATE_LIMIT_ERROR_TEXT,
  GATEWAY_TIMEOUT_STATUS,
  REQUEST_TIMEOUT_STATUS,
} from 'src/cloud/constants'
import {getFlagValue} from 'src/shared/utils/featureFlag'
import {notify} from 'src/shared/actions/notifications'
import {resultTooLarge} from 'src/shared/copy/notifications'

// Types
import {CancellationError} from 'src/types'
import {RunQueryResult} from 'src/shared/apis/query'
import {event} from 'src/cloud/utils/reporting'
import {PROJECT_NAME} from 'src/flows'

interface CancelMap {
  [key: string]: () => void
}

export enum OverrideMechanism {
  Inline,
  AST,
  JSON,
}

export interface QueryOptions {
  overrideMechanism: OverrideMechanism
}

export interface QueryScope {
  region?: string
  org?: string
  token?: string
  vars?: Record<string, string>
  params?: Record<string, string>
  task?: Record<string, string>
}

interface RequestDialect {
  annotations: string[]
}

interface RequestBody {
  query: string
  dialect?: RequestDialect
  options?: Record<string, any>
  extern?: any
}

export interface QueryContextType {
  basic: (text: string, override?: QueryScope, options?: QueryOptions) => any
  query: (
    text: string,
    override?: QueryScope,
    options?: QueryOptions
  ) => Promise<FluxResult>
  cancel: (id?: string) => void
}

export const DEFAULT_CONTEXT: QueryContextType = {
  basic: (_: string, __: QueryScope, ___: QueryOptions) => {},
  query: (_: string, __: QueryScope, ___: QueryOptions) =>
    Promise.resolve({} as FluxResult),
  cancel: (_?: string) => {},
}

export const QueryContext =
  React.createContext<QueryContextType>(DEFAULT_CONTEXT)

export const QueryProvider: FC = ({children}) => {
  const dispatch = useDispatch()
  const pending = useRef({} as CancelMap)
  const org = useSelector(getOrg)

  // this one cancels all pending queries when you
  // navigate away from the query provider
  useEffect(() => {
    return () => {
      Object.values(pending.current).forEach(c => c())
    }
  }, [])

  const basic = (text: string, override: QueryScope, options: QueryOptions) => {
    const mechanism = options?.overrideMechanism ?? OverrideMechanism.AST
    const query =
      mechanism === OverrideMechanism.Inline
        ? simplify(text, override?.vars ?? {}, override?.params ?? {})
        : text

    const orgID = override?.org || org.id

    const url = `${
      override?.region || window.location.origin
    }/api/v2/query?${new URLSearchParams({orgID})}`

    const headers = {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
    }

    if (override?.token) {
      headers['Authorization'] = `Token ${override.token}`
    }

    const body: RequestBody = {
      query,
      dialect: {annotations: ['group', 'datatype', 'default']},
    }

    if (mechanism === OverrideMechanism.AST) {
      const options = updateWindowPeriod(query, override, 'ast')
      if (options && Object.keys(options).length) {
        body.extern = options
      }
    }
    if (mechanism === OverrideMechanism.JSON) {
      const options = updateWindowPeriod(query, override, 'json')
      if (options && Object.keys(options).length) {
        body.options = options
      }
    }

    const controller = new AbortController()

    const id = nanoid()
    const promise = fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    })
      .then(async (response: Response): Promise<RunQueryResult> => {
        if (response.status === 200) {
          const reader = response.body.getReader()
          const decoder = new TextDecoder()

          let csv = ''
          let bytesRead = 0
          let didTruncate = false
          let read = await reader.read()

          let BYTE_LIMIT =
            getFlagValue('increaseCsvLimit') ?? FLUX_RESPONSE_BYTES_LIMIT

          if (!window.location.pathname.includes(PROJECT_NAME.toLowerCase())) {
            BYTE_LIMIT =
              getFlagValue('dataExplorerCsvLimit') ?? FLUX_RESPONSE_BYTES_LIMIT
          }

          while (!read.done) {
            const text = decoder.decode(read.value)

            bytesRead += read.value.byteLength

            if (bytesRead > BYTE_LIMIT) {
              csv += trimPartialLines(text)
              didTruncate = true
              break
            } else {
              csv += text
              read = await reader.read()
            }
          }

          reader.cancel()

          return {
            type: 'SUCCESS',
            csv,
            bytesRead,
            didTruncate,
          }
        }

        if (response.status === RATE_LIMIT_ERROR_STATUS) {
          const retryAfter = response.headers.get('Retry-After')

          return Promise.resolve({
            type: 'RATE_LIMIT_ERROR',
            retryAfter: retryAfter ? parseInt(retryAfter) : null,
            message: RATE_LIMIT_ERROR_TEXT,
          })
        }

        return response.text().then(text => {
          try {
            const json = JSON.parse(text)
            const message = json.message || json.error
            const code = json.code

            switch (code) {
              case REQUEST_TIMEOUT_STATUS:
                event('query timeout')
                break
              case GATEWAY_TIMEOUT_STATUS:
                event('gateway timeout')
                break
              default:
                event('query error')
            }

            return {type: 'UNKNOWN_ERROR', message, code}
          } catch {
            return {
              type: 'UNKNOWN_ERROR',
              message: 'Failed to execute Flux query',
            }
          }
        })
      })
      .catch(e => {
        if (e.name === 'AbortError') {
          return Promise.reject(new CancellationError())
        }

        return Promise.reject(e)
      })

    pending.current[id] = () => {
      controller.abort()
    }

    return {
      id,
      promise,
      cancel: () => {
        cancel(id)
      },
    }
  }

  const cancel = (queryID?: string) => {
    if (!queryID) {
      Object.values(pending.current).forEach(c => c())
      pending.current = {}
      return
    }

    if (!pending.current.hasOwnProperty(queryID)) {
      return
    }

    pending.current[queryID]()

    delete pending.current[queryID]
  }

  const query = (
    text: string,
    override: QueryScope,
    options: QueryOptions
  ): Promise<FluxResult> => {
    const result = basic(text, override, options)

    const promise: any = result.promise.then(async raw => {
      if (raw.type !== 'SUCCESS') {
        throw new Error(raw.message)
      }
      if (raw.didTruncate) {
        dispatch(notify(resultTooLarge(raw.bytesRead)))
      }
      const parsed = await fromFlux(raw.csv)

      return {
        source: text,
        parsed,
        error: null,
        truncated: raw.didTruncate,
        bytes: raw.bytesRead,
      } as FluxResult
    })

    promise.cancel = result.cancel
    return promise
  }

  return (
    <QueryContext.Provider
      value={{
        query,
        cancel,
        basic,
      }}
    >
      {children}
    </QueryContext.Provider>
  )
}

export default QueryProvider
