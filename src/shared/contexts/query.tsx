import React, {FC, useEffect, useRef} from 'react'
import {useSelector} from 'react-redux'
import {nanoid} from 'nanoid'
import {parse, format_from_js_file} from '@influxdata/flux-lsp-browser'
import {
  GATEWAY_TIMEOUT_STATUS,
  REQUEST_TIMEOUT_STATUS,
} from 'src/cloud/constants'

import {getOrg} from 'src/organizations/selectors'
import {fromFlux, fastFromFlux} from '@influxdata/giraffe'
import {
  FluxResult,
  QueryScope,
  InternalFromFluxResult,
  Column,
} from 'src/types/flows'
import {propertyTime} from 'src/shared/utils/getMinDurationFromAST'

// Constants
import {SELECTABLE_TIME_RANGES} from 'src/shared/constants/timeRanges'
import {
  RATE_LIMIT_ERROR_STATUS,
  RATE_LIMIT_ERROR_TEXT,
} from 'src/cloud/constants'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Types
import {CancellationError, File} from 'src/types'
import {RunQueryResult} from 'src/shared/apis/query'
import {event} from 'src/cloud/utils/reporting'

interface CancelMap {
  [key: string]: () => void
}

export interface QueryContextType {
  basic: (text: string, override: QueryScope, callback?: any) => any
  query: (
    text: string,
    override: QueryScope,
    callback?: any
  ) => Promise<FluxResult>
  cancel: (id?: string) => void
}

export const DEFAULT_CONTEXT: QueryContextType = {
  basic: (_: string, __: QueryScope, _callback?: any) => {},
  query: (_: string, __: QueryScope, _callback?: any) =>
    Promise.resolve({} as FluxResult),
  cancel: (_?: string) => {},
}

export const QueryContext = React.createContext<QueryContextType>(
  DEFAULT_CONTEXT
)

const DESIRED_POINTS_PER_GRAPH = 360
const FALLBACK_WINDOW_PERIOD = 15000

// Finds all instances of nodes that match with the test function
// and returns them as an array
export const find = (node: File, test, acc = []) => {
  if (!node) {
    return acc
  }

  if (test(node)) {
    acc.push(node)
  }

  Object.values(node).forEach(val => {
    if (Array.isArray(val)) {
      val.forEach(_val => {
        find(_val, test, acc)
      })
    } else if (typeof val === 'object') {
      find(val, test, acc)
    }
  })

  return acc
}

// Removes all instances of nodes that match with the test function
// and returns the nodes that were returned as an array
export const remove = (node: File, test, acc = []) => {
  if (!node) {
    return acc
  }

  Object.entries(node).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      let ni = 0
      while (ni < val.length) {
        if (test(val[ni])) {
          acc.push(val[ni])
          val.splice(ni, 1)
          continue
        }
        remove(val[ni], test, acc)
        ni++
      }
    } else if (typeof val === 'object') {
      if (val && test(val)) {
        delete node[key]
      } else {
        remove(val, test, acc)
      }
    }
  })

  return acc
}

const _addWindowPeriod = (ast, optionAST): void => {
  const NOW = Date.now()

  const queryRanges = find(
    ast,
    node =>
      node?.callee?.type === 'Identifier' && node?.callee?.name === 'range'
  ).map(node =>
    (node.arguments[0]?.properties || []).reduce(
      (acc, curr) => {
        if (curr.key.name === 'start') {
          acc.start = propertyTime(ast, curr.value, NOW)
        }

        if (curr.key.name === 'stop') {
          acc.stop = propertyTime(ast, curr.value, NOW)
        }

        return acc
      },
      {
        start: '',
        stop: NOW,
      }
    )
  )

  const windowPeriod = find(
    optionAST,
    node => node?.type === 'Property' && node?.key?.name === 'windowPeriod'
  )
  if (!queryRanges.length) {
    windowPeriod.forEach(node => {
      node.value = {
        type: 'DurationLiteral',
        values: [{magnitude: FALLBACK_WINDOW_PERIOD, unit: 'ms'}],
      }
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
    windowPeriod.forEach(node => {
      node.value = {
        type: 'DurationLiteral',
        values: [{magnitude: foundDuration.windowPeriod, unit: 'ms'}],
      }
    })

    return
  }

  windowPeriod.forEach(node => {
    node.value = {
      type: 'DurationLiteral',
      values: [
        {
          magnitude: Math.round(queryDuration / DESIRED_POINTS_PER_GRAPH),
          unit: 'ms',
        },
      ],
    }
  })
}

export const simplify = (text, vars = {}) => {
  try {
    const ast = isFlagEnabled('fastFlows') ? parseQuery(text) : parse(text)
    const referencedVars = find(
      ast,
      node => node?.type === 'MemberExpression' && node?.object?.name === 'v'
    )
      .map(node => node.property.name)
      .reduce((acc, curr) => {
        acc[curr] = vars[curr]
        return acc
      }, {})

    // Grab all variables that are defined in the query while removing the old definition from the AST
    const queryDefinedVars = remove(
      ast,
      node => node.type === 'OptionStatement' && node.assignment.id.name === 'v'
    ).reduce((acc, curr) => {
      // eslint-disable-next-line no-extra-semi
      ;(curr.assignment?.init?.properties || []).reduce((_acc, _curr) => {
        if (_curr.key?.name && _curr.value?.location?.source) {
          _acc[_curr.key.name] = _curr.value.location.source
        }

        return _acc
      }, acc)

      return acc
    }, {})

    // Merge the two variable maps, allowing for any user defined variables to override
    // global system variables
    Object.keys(queryDefinedVars).forEach(vari => {
      if (referencedVars.hasOwnProperty(vari)) {
        referencedVars[vari] = queryDefinedVars[vari]
      }
    })

    const varVals = Object.entries(referencedVars)
      .map(([k, v]) => `${k}: ${v}`)
      .join(',\n')
    const optionAST = isFlagEnabled('fastFlows')
      ? parseQuery(`option v = {\n${varVals}\n}\n`)
      : parse(`option v = {\n${varVals}\n}\n`)

    if (varVals.length) {
      ast.body.unshift(optionAST.body[0])
    }

    // load in windowPeriod at the last second, because it needs to self reference all the things
    if (referencedVars.hasOwnProperty('windowPeriod')) {
      _addWindowPeriod(ast, optionAST)
    }

    // Join together any duplicate task options
    const taskParams = remove(
      ast,
      node =>
        node.type === 'OptionStatement' && node.assignment.id.name === 'task'
    )
      .reverse()
      .reduce((acc, curr) => {
        // eslint-disable-next-line no-extra-semi
        ;(curr.assignment?.init?.properties || []).reduce((_acc, _curr) => {
          if (_curr.key?.name && _curr.value?.location?.source) {
            _acc[_curr.key.name] = _curr.value.location.source
          }

          return _acc
        }, acc)

        return acc
      }, {})

    if (Object.keys(taskParams).length) {
      const taskVals = Object.entries(taskParams)
        .map(([k, v]) => `${k}: ${v}`)
        .join(',\n')
      const taskAST = isFlagEnabled('fastFlows')
        ? parseQuery(`option task = {\n${taskVals}\n}\n`)
        : parse(`option task = {\n${taskVals}\n}\n`)
      ast.body.unshift(taskAST.body[0])
    }

    // turn it back into a query
    return format_from_js_file(ast)
  } catch {
    return ''
  }
}

const parseCSV = (() => {
  const worker = new Worker('./csv.worker', {type: 'module'})
  const queue = {}
  let counter = 0

  worker.onmessage = msg => {
    const idx = msg.data[0]
    const data = msg.data[1] as InternalFromFluxResult

    if (!queue[idx]) {
      return
    }

    // NOTE Only POJOs survive the jump between webworkers and the main thread, so here
    // we have to rewrap the response to mimic the giraffe fromFlux interface

    Object.defineProperty(data.table, 'length', {
      get: () =>
        (Object.values(data?.table?.columns ?? {})[0]?.data ?? []).length || 0,
    })
    Object.defineProperty(data.table, 'columnKeys', {
      get: () => Object.keys(data.table.columns),
    })
    data.table.getColumn = (
      columnKey: string,
      columnType?: string
    ): any[] | null => {
      const column = data.table.columns[columnKey]

      if (!column) {
        return null
      }

      // Allow time columns to be retrieved as number columns
      const isWideningTimeType =
        columnType === 'number' && column.type === 'time'

      if (columnType && columnType !== column.type && !isWideningTimeType) {
        return null
      }

      switch (columnType) {
        case 'number':
          return column.data as number[]
        case 'time':
          return column.data as number[]
        case 'string':
          return column.data as string[]
        case 'boolean':
          return column.data as boolean[]
        default:
          return column.data as any[]
      }
    }

    data.table.addColumn = (
      columnKey: string,
      fluxDataType: string,
      type: string,
      _data: any[],
      name?: string
    ) => {
      data.table.columns[columnKey] = {
        name: name || columnKey,
        fluxDataType,
        type,
        data: _data,
      } as Column

      return data.table
    }

    data.table.getColumnName = (columnKey: string): string => {
      const column = data.table.columns[columnKey]

      if (!column) {
        return null
      }

      return column.name
    }

    data.table.getColumnType = (columnKey: string) => {
      const column = data.table.columns[columnKey]

      if (!column) {
        return null
      }

      return column.type
    }

    data.table.getOriginalColumnType = (columnKey: string) => {
      const column = data.table.columns[columnKey]

      if (!column) {
        return null
      }

      return column.fluxDataType
    }

    queue[idx](data)
  }

  return (csv: string) =>
    new Promise<InternalFromFluxResult>(resolve => {
      queue[++counter] = resolve
      worker.postMessage([counter, csv])
    })
})()

export const parseQuery = (() => {
  const qs = {}

  return q => {
    const key = btoa(q)
    if (!qs[key]) {
      qs[key] = parse(q)
    }

    return qs[key]
  }
})()

export const QueryProvider: FC = ({children}) => {
  const pending = useRef({} as CancelMap)
  const org = useSelector(getOrg)

  // this one cancels all pending queries when you
  // navigate away from the query provider
  useEffect(() => {
    return () => {
      Object.values(pending.current).forEach(c => c())
    }
  }, [])

  const basic = (text: string, override?: QueryScope, callback?: any) => {
    const query = simplify(text, override?.vars || {})

    const orgID = override?.org || org.id

    const url = `${override?.region ||
      window.location.origin}/api/v2/query?${new URLSearchParams({orgID})}`

    const headers = {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
    }

    if (override?.token) {
      headers['Authorization'] = `Token ${override.token}`
    }

    const body = {
      query,
      dialect: {annotations: ['group', 'datatype', 'default']},
    }

    const controller = new AbortController()

    const id = nanoid()
    const promise = fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    })
      .then(
        async (response: Response): Promise<RunQueryResult> => {
          if (response.status === 200) {
            const reader = response.body.getReader()
            const decoder = new TextDecoder()

            let csv = ''
            let bytesRead = 0

            let read = await reader.read()

            while (!read.done) {
              if (!pending.current[id]) {
                throw new CancellationError()
              }
              const text = decoder.decode(read.value)

              if (callback) {
                callback(text)
              }

              bytesRead += read.value.byteLength

              csv += text
              read = await reader.read()
            }

            reader.cancel()
            if (pending.current[id]) {
              delete pending.current[id]
            }

            return {
              type: 'SUCCESS',
              csv,
              bytesRead,
              didTruncate: false,
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
        }
      )
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

  // class MagicCSV {
  //   public pointer = 0

  //   constructor(value) {
  //     this.pointer = value
  //   }

  //   public append() {}
  // }

  const query = (
    text: string,
    override?: QueryScope,
    callback?: any
  ): Promise<FluxResult> => {
    // const magicCsv = new MagicCSV(0)
    // function parsePartial(text: string) {
    //   const partial = fastFromFlux(text)
    //   magicCsv.append(partial)
    //   if (callback) {
    //     callback(partial)
    //   }
    // }
    const result = basic(text, override, callback)

    const promise: any = result.promise
      .then(raw => {
        if (raw.type !== 'SUCCESS') {
          throw new Error(raw.message)
        }

        return raw
      })
      .then(raw => {
        // if (callback) {
        //   return magicCsv
        // }
        if (isFlagEnabled('fastFlows')) {
          return parseCSV(raw.csv)
        }
        if (isFlagEnabled('fastFromFlux')) {
          return fastFromFlux(raw.csv)
        }
        return fromFlux(raw.csv)
      })
      .then(
        parsed =>
          ({
            source: text,
            parsed,
            error: null,
          } as FluxResult)
      )

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
