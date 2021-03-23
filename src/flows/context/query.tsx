import React, {FC, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {parse} from 'src/external/parser'
import {runQuery} from 'src/shared/apis/query'
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

// Types
import {
  AppState,
  ResourceType,
  RemoteDataState,
  Variable,
  OptionStatement,
  VariableAssignment,
  ObjectExpression,
} from 'src/types'

interface VariableMap {
  [key: string]: Variable
}

export interface QueryContextType {
  query: (text: string, vars?: VariableMap) => Promise<FluxResult>
}

export const DEFAULT_CONTEXT: QueryContextType = {
  query: (_: string, __?: VariableMap) => Promise.resolve({} as FluxResult),
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

export const QueryProvider: FC = ({children}) => {
  const buckets = useSelector((state: AppState) => getSortedBuckets(state))
  const bucketsLoadingState = useSelector((state: AppState) =>
    getStatus(state, ResourceType.Buckets)
  )
  const org = useSelector(getOrg)

  const dispatch = useDispatch()

  useEffect(() => {
    if (bucketsLoadingState === RemoteDataState.NotStarted) {
      dispatch(getBuckets())
    }
  }, [bucketsLoadingState, dispatch])

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
      ;(((optionAST.body[0] as OptionStatement) // eslint-disable-line no-extra-semi
        .assignment as VariableAssignment)
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
    const cartesianProduct = starts.map(start =>
      stops.map(stop => [start, stop])
    )

    const durations = []
      .concat(...cartesianProduct)
      .map(([start, stop]) => stop - start)
      .filter(d => d > 0)

    const queryDuration = Math.min(...durations)
    const foundDuration = SELECTABLE_TIME_RANGES.find(
      tr => tr.seconds * 1000 === queryDuration
    )

    if (foundDuration) {
      ;(((optionAST.body[0] as OptionStatement) // eslint-disable-line no-extra-semi
        .assignment as VariableAssignment)
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

  const query = (text: string, vars: VariableMap = {}): Promise<FluxResult> => {
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

    const result = runQuery(orgID, text, optionAST)

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
    <QueryContext.Provider value={{query}}>{children}</QueryContext.Provider>
  )
}

export default QueryProvider
