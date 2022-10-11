import React, {FC, useEffect, useRef} from 'react'
import {useDispatch} from 'react-redux'
import {useSelector} from 'react-redux'
import {nanoid} from 'nanoid'
import {parse, format_from_js_file} from '@influxdata/flux-lsp-browser'

import {getOrg} from 'src/organizations/selectors'
import {fromFlux} from '@influxdata/giraffe'
import {FluxResult} from 'src/types/flows'
import {propertyTime} from 'src/shared/utils/getMinDurationFromAST'

// Constants
import {FLUX_RESPONSE_BYTES_LIMIT} from 'src/shared/constants'
import {SELECTABLE_TIME_RANGES} from 'src/shared/constants/timeRanges'
import {
  RATE_LIMIT_ERROR_STATUS,
  RATE_LIMIT_ERROR_TEXT,
  GATEWAY_TIMEOUT_STATUS,
  REQUEST_TIMEOUT_STATUS,
} from 'src/cloud/constants'
import {isFlagEnabled, getFlagValue} from 'src/shared/utils/featureFlag'
import {notify} from 'src/shared/actions/notifications'
import {resultTooLarge} from 'src/shared/copy/notifications'

// Types
import {CancellationError, File} from 'src/types'
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

/*
  Given an arbitrary text chunk of a Flux CSV, trim partial lines off of the end
  of the text.

  For example, given the following partial Flux response,

            r,baz,3
      foo,bar,baz,2
      foo,bar,b

  we want to trim the last incomplete line, so that the result is

            r,baz,3
      foo,bar,baz,2

*/
const trimPartialLines = (partialResp: string): string => {
  let i = partialResp.length - 1

  while (partialResp[i] !== '\n') {
    if (i <= 0) {
      return partialResp
    }

    i -= 1
  }

  return partialResp.slice(0, i + 1)
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
  ).map(node => {
    return (node.arguments[0]?.properties || []).reduce(
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
  })

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

const joinOption = (
  ast: any,
  optionName: string,
  defaults: Record<string, string> = {}
) => {
  // remove and join duplicate options declared in the query
  const joinedOption = remove(
    ast,
    node =>
      node.type === 'OptionStatement' && node.assignment.id.name === optionName
  ).reduce((acc, curr) => {
    // eslint-disable-next-line no-extra-semi
    ;(curr.assignment?.init?.properties || []).reduce((_acc, _curr) => {
      if (_curr.key?.name && _curr.value?.location?.source) {
        _acc[_curr.key.name] = _curr.value.location.source
      }

      return _acc
    }, acc)

    return acc
  }, defaults)

  const optionVals = Object.entries(joinedOption)
    .map(([k, v]) => `${k}: ${v}`)
    .join(',\n')
  if (!optionVals.length) {
    return null
  }

  return isFlagEnabled('fastFlows')
    ? parseQuery(`option ${optionName} = {\n${optionVals}\n}\n`)
    : parse(`option ${optionName} = {\n${optionVals}\n}\n`)
}

export const simplify = (text, vars = {}, params = {}) => {
  try {
    const ast = isFlagEnabled('fastFlows') ? parseQuery(text) : parse(text)

    // find all `v.varname` references and apply
    // their default value from `vars`
    // filtering this way prevents flooding the query with all
    // variable definitions on accident and simplifies the filtering
    // logic required to support that by centralizing it here
    const referencedVars = find(
      ast,
      node => node?.type === 'MemberExpression' && node?.object?.name === 'v'
    )
      .map(node => node.property.name)
      .reduce((acc, curr) => {
        acc[curr] = vars[curr]
        return acc
      }, {})

    const variableOption = joinOption(ast, 'v', referencedVars)

    if (variableOption) {
      ast.body.unshift(variableOption.body[0])
    }

    // load in windowPeriod at the last second, because it needs to self reference all the things
    if (referencedVars.hasOwnProperty('windowPeriod')) {
      _addWindowPeriod(ast, variableOption)
    }

    // give the same treatment to parameters
    const referencedParams = find(
      ast,
      node =>
        node?.type === 'MemberExpression' && node?.object?.name === 'param'
    )
      .map(node => node.property.name)
      .reduce((acc, curr) => {
        acc[curr] = params[curr]
        return acc
      }, {})

    const paramOption = joinOption(ast, 'param', referencedParams)

    if (paramOption) {
      ast.body.unshift(paramOption.body[0])
    }

    // Join together any duplicate task options
    const taskOption = joinOption(ast, 'task')
    if (taskOption) {
      ast.body.unshift(taskOption.body[0])
    }

    // turn it back into a query
    return format_from_js_file(ast)
  } catch {
    return ''
  }
}

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

const updateWindowPeriod = (
  query: string,
  override: QueryScope = {},
  mode: 'json' | 'ast' = 'ast'
) => {
  const options: Record<string, any> = {}

  if (Object.keys(override?.vars ?? {}).length) {
    options.v = override.vars
  }
  if (Object.keys(override?.params ?? {}).length) {
    options.params = override.params
  }
  if (Object.keys(override?.task ?? {}).length) {
    options.task = override.task
  }

  const optionTexts = Object.entries(options)
    .map(([k, v]) => {
      const vals = Object.entries(v).map(([_k, _v]) => `  ${_k}: ${_v}`)
      return `option ${k} =  {${vals.join(',\n')}}`
    })
    .join('\n\n')

  const queryAST = parse(query)
  let optionAST = parse(optionTexts)

  // only run this if the query need a windowPeriod
  if (
    !find(
      queryAST,
      node =>
        node?.type === 'MemberExpression' &&
        node?.object?.name === 'v' &&
        node?.property?.name === 'windowPeriod'
    ).length
  ) {
    if (mode === 'ast') {
      return optionAST
    }

    return options
  } else if (isFlagEnabled('dontSolveWindowPeriod')) {
    if (options?.v?.timeRangeStart && options?.v?.timeRangeStop) {
      const NOW = Date.now()
      const range = find(
        optionAST,
        node =>
          node?.type === 'OptionStatement' && node?.assignment?.id?.name === 'v'
      ).reduce(
        (acc, curr) => {
          acc.start =
            find(
              curr,
              n => n.type === 'Property' && n?.key?.name === 'timeRangeStart'
            )[0]?.value ?? acc.start

          acc.stop =
            find(
              curr,
              n => n.type === 'Property' && n?.key?.name === 'timeRangeStop'
            )[0]?.value ?? acc.stop

          return acc
        },
        {
          start: null,
          stop: null,
        }
      )
      const duration =
        propertyTime(queryAST, range.stop, NOW) -
        propertyTime(queryAST, range.start, NOW)
      const foundDuration = SELECTABLE_TIME_RANGES.find(
        tr => tr.seconds * 1000 === duration
      )

      if (foundDuration) {
        options.v.windowPeriod = `${foundDuration.windowPeriod} ms`
      } else {
        options.v.windowPeriod = `${Math.round(
          duration / DESIRED_POINTS_PER_GRAPH
        )} ms`
      }
    } else {
      options.v.windowPeriod = `${FALLBACK_WINDOW_PERIOD} ms`
    }

    // write the mutations back out into the AST
    optionAST = parse(
      Object.entries(options)
        .map(([k, v]) => {
          const vals = Object.entries(v).map(([_k, _v]) => `  ${_k}: ${_v}`)
          return `option ${k} =  {${vals.join(',\n')}}`
        })
        .join('\n\n')
    )
  }

  try {
    const _optionAST = JSON.parse(JSON.stringify(optionAST))
    // make sure there's a variable in there named windowPeriod so later logic doesnt bail
    find(
      _optionAST,
      node =>
        node?.type === 'OptionStatement' && node?.assignment?.id?.name === 'v'
    ).forEach(node => {
      if (
        find(
          node,
          n => n.type === 'Property' && n?.key?.name === 'windowPeriod'
        ).length
      ) {
        return
      }

      if (isFlagEnabled('dontSolveWindowPeriod')) {
        throw new Error('v.windowPeriod is used and not defined')
      }

      node.assignment.init.properties.push({
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
    })

    const substitutedAST = {
      package: '',
      type: 'Package',
      files: [queryAST, _optionAST],
    }

    // use the whole query to get that option set by reference
    _addWindowPeriod(substitutedAST, _optionAST)

    if (mode === 'ast') {
      return _optionAST
    }

    // TODO write window period back out to json object
    return options
  } catch (e) {
    // there's a bunch of weird errors until we replace windowPeriod
    console.error(e)
    if (mode === 'ast') {
      return optionAST
    }
    return options
  }
}

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
