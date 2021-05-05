import React, {FC, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {v4 as UUID} from 'uuid'

import {parse} from 'src/external/parser'
import {buildVarsOption} from 'src/variables/utils/buildVarsOption'
import {asAssignment} from 'src/variables/selectors'
import {getOrg} from 'src/organizations/selectors'
import {getBuckets} from 'src/buckets/actions/thunks'
import {getSortedBuckets} from 'src/buckets/selectors'
import {getStatus} from 'src/resources/selectors'
import {fromFlux} from '@influxdata/giraffe'
import {FluxResult} from 'src/types/flows'
import {propertyTime} from 'src/shared/utils/getMinDurationFromAST'

// Constants
import {SELECTABLE_TIME_RANGES} from 'src/shared/constants/timeRanges'
import {API_BASE_PATH} from 'src/shared/constants'
import {
  RATE_LIMIT_ERROR_STATUS,
  RATE_LIMIT_ERROR_TEXT,
} from 'src/cloud/constants'

// Types
import {
  AppState,
  ResourceType,
  RemoteDataState,
  Variable,
  OptionStatement,
  VariableAssignment,
  ObjectExpression,
  CancellationError,
  File,
} from 'src/types'
import {RunQueryResult} from 'src/shared/apis/query'

interface CancelMap {
  [key: string]: () => void
}

interface VariableMap {
  [key: string]: Variable
}

export interface QueryContextType {
  basic: (text: string, vars?: VariableMap) => any
  query: (text: string, vars?: VariableMap) => Promise<FluxResult>
  cancel: (id?: string) => void
}

export const DEFAULT_CONTEXT: QueryContextType = {
  basic: (_: string, __?: VariableMap) => {},
  query: (_: string, __?: VariableMap) => Promise.resolve({} as FluxResult),
  cancel: (_?: string) => {},
}

export const QueryContext = React.createContext<QueryContextType>(
  DEFAULT_CONTEXT
)

const DESIRED_POINTS_PER_GRAPH = 360
const FALLBACK_WINDOW_PERIOD = 15000

const _walk = (node, test, acc = []) => {
  if (!node) {
    return acc
  }

  if (test(node)) {
    acc.push(node)
  }

  Object.values(node).forEach(val => {
    if (Array.isArray(val)) {
      val.forEach(_val => {
        _walk(_val, test, acc)
      })
    } else if (typeof val === 'object') {
      _walk(val, test, acc)
    }
  })

  return acc
}

export const updateBucketInAST = (ast: File, name: string) => {
  _walk(ast, node => {
    if (
      node?.type === 'CallExpression' &&
      node?.callee?.type === 'Identifier' &&
      node?.callee?.name === 'from' &&
      node?.arguments[0]?.properties[0]?.key?.name === 'bucket'
    ) {
      node.arguments[0].properties[0].value.location.source = `"${name}"`
    }
  })
}

const _getVars = (
  ast,
  allVars: VariableMap = {},
  acc: VariableMap = {}
): VariableMap =>
  _walk(
    ast,
    node => node?.type === 'MemberExpression' && node?.object?.name === 'v'
  )
    .map(node => node.property.name)
    .reduce((tot, curr) => {
      if (tot.hasOwnProperty(curr)) {
        return tot
      }

      if (!allVars[curr]) {
        tot[curr] = null
        return tot
      }
      tot[curr] = allVars[curr]

      if (tot[curr].arguments.type === 'query') {
        _getVars(parse(tot[curr].arguments.values.query), allVars, tot)
      }

      return tot
    }, acc)

const _addWindowPeriod = (ast, optionAST): void => {
  const queryRanges = _walk(
    ast,
    node =>
      node?.callee?.type === 'Identifier' && node?.callee?.name === 'range'
  ).map(node =>
    (node.arguments[0]?.properties || []).reduce(
      (acc, curr) => {
        if (curr.key.name === 'start') {
          acc.start = propertyTime(ast, curr.value, Date.now())
        }

        if (curr.key.name === 'stop') {
          acc.stop = propertyTime(ast, curr.value, Date.now())
        }

        return acc
      },
      {
        start: '',
        stop: Date.now(),
      }
    )
  )

  if (!queryRanges.length) {
    ;(((optionAST.body[0] as OptionStatement).assignment as VariableAssignment) // eslint-disable-line no-extra-semi
      .init as ObjectExpression).properties.push({
      type: 'Property',
      key: {
        type: 'Identifier',
        name: 'windowPeriod',
      },
      value: {
        type: 'DurationLiteral',
        values: [{magnitude: FALLBACK_WINDOW_PERIOD, unit: 'ms'}],
      },
    })

    return
  }
  const starts = queryRanges.map(t => t.start)
  const stops = queryRanges.map(t => t.stop)
  const cartesianProduct = starts.map(start => stops.map(stop => [start, stop]))

  const durations = []
    .concat(...cartesianProduct)
    .map(([start, stop]) => stop - start)
    .filter(d => d > 0)

  const queryDuration = Math.min(...durations)
  const foundDuration = SELECTABLE_TIME_RANGES.find(
    tr => tr.seconds * 1000 === queryDuration
  )

  if (foundDuration) {
    ;(((optionAST.body[0] as OptionStatement).assignment as VariableAssignment) // eslint-disable-line no-extra-semi
      .init as ObjectExpression).properties.push({
      type: 'Property',
      key: {
        type: 'Identifier',
        name: 'windowPeriod',
      },
      value: {
        type: 'DurationLiteral',
        values: [{magnitude: foundDuration.windowPeriod, unit: 'ms'}],
      },
    })

    return
  }
  ;(((optionAST.body[0] as OptionStatement).assignment as VariableAssignment) // eslint-disable-line no-extra-semi
    .init as ObjectExpression).properties.push({
    type: 'Property',
    key: {
      type: 'Identifier',
      name: 'windowPeriod',
    },
    value: {
      type: 'DurationLiteral',
      values: [
        {
          magnitude: Math.round(queryDuration / DESIRED_POINTS_PER_GRAPH),
          unit: 'ms',
        },
      ],
    },
  })
}

export const QueryProvider: FC = ({children}) => {
  const buckets = useSelector((state: AppState) => getSortedBuckets(state))
  const bucketsLoadingState = useSelector((state: AppState) =>
    getStatus(state, ResourceType.Buckets)
  )
  const [pending, setPending] = useState({} as CancelMap)
  const org = useSelector(getOrg)

  const dispatch = useDispatch()

  useEffect(() => {
    if (bucketsLoadingState === RemoteDataState.NotStarted) {
      dispatch(getBuckets())
    }
  }, [bucketsLoadingState, dispatch])

  // this one cancels all pending queries when you
  // navigate away from the query provider
  useEffect(() => {
    return () => {
      Object.values(pending).forEach(c => c())
    }
  }, [])

  const _getOrg = ast => {
    const queryBuckets = _walk(
      ast,
      node =>
        node?.type === 'CallExpression' &&
        node?.callee?.type === 'Identifier' &&
        node?.callee?.name === 'from' &&
        node?.arguments[0]?.properties[0]?.key?.name === 'bucket'
    ).map(node => node?.arguments[0]?.properties[0]?.value.value)

    return (
      buckets.find(buck => queryBuckets.includes(buck.name))?.orgID || org.id
    )
  }

  const basic = (text: string, vars: VariableMap = {}) => {
    // Some preamble for setting the stage
    const baseAST = parse(text)
    const usedVars = _getVars(baseAST, vars)
    const optionAST = buildVarsOption(
      Object.values(usedVars)
        .filter(v => !!v)
        .map(v => asAssignment(v))
    )

    // Make a version of the query with the variables loaded
    const ast = {
      package: '',
      type: 'Package',
      files: [baseAST, optionAST],
    }

    // Here we grab the org from the contents of the query, in case it references a sampledata bucket
    const orgID = _getOrg(ast)

    // load in windowPeriod at the last second, because it needs to self reference all the things
    if (usedVars.hasOwnProperty('windowPeriod')) {
      _addWindowPeriod(ast, optionAST)
    }

    const url = `${API_BASE_PATH}api/v2/query?${new URLSearchParams({orgID})}`

    const headers = {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
    }

    const body = {
      query: text,
      extern: optionAST,
      dialect: {annotations: ['group', 'datatype', 'default']},
    }

    const controller = new AbortController()

    const id = UUID()
    const promise = fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    })
      .then(response => {
        if (pending[id]) {
          delete pending[id]
          setPending({...pending})
        }
        return response
      })
      .then(
        (response: Response): Promise<RunQueryResult> => {
          if (response.status === 200) {
            return response.text().then(csv => ({
              type: 'SUCCESS',
              csv,
              bytesRead: csv.length,
              didTruncate: false,
            }))
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

              return {type: 'UNKNOWN_ERROR', message, code}
            } catch {
              return {
                type: 'UNKNOWN_ERROR',
                message: 'Failed to execute Flux query',
              }
            }
          })
        }
      )
      .catch(e => {
        if (e.name === 'AbortError') {
          return Promise.reject(new CancellationError())
        }

        return Promise.reject(e)
      })

    pending[id] = () => {
      controller.abort()
    }

    setPending({
      ...pending,
    })

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
      Object.values(pending).forEach(c => c())
      setPending({})
      return
    }

    if (!pending.hasOwnProperty(queryID)) {
      return
    }

    pending[queryID]()

    delete pending[queryID]

    setPending(pending)
  }

  const query = (text: string, vars: VariableMap = {}): Promise<FluxResult> => {
    const result = basic(text, vars)

    return result.promise
      .then(raw => {
        if (raw.type !== 'SUCCESS') {
          throw new Error(raw.message)
        }

        return raw
      })
      .then(raw => {
        return new Promise((resolve, reject) => {
          requestAnimationFrame(() => {
            try {
              const parsed = fromFlux(raw.csv)
              resolve({
                source: text,
                parsed,
                error: null,
              } as FluxResult)
            } catch (e) {
              reject(e)
            }
          })
        })
      })
  }

  if (bucketsLoadingState !== RemoteDataState.Done) {
    return null
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
