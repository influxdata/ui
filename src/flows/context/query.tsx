import React, {FC, useContext, useMemo, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {parse} from 'src/external/parser'
import {runQuery} from 'src/shared/apis/query'
import {buildVarsOption} from 'src/variables/utils/buildVarsOption'
import {getVariables, asAssignment} from 'src/variables/selectors'
import {getOrg} from 'src/organizations/selectors'
import {getBuckets} from 'src/buckets/actions/thunks'
import {getSortedBuckets} from 'src/buckets/selectors'
import {getStatus} from 'src/resources/selectors'
import {FlowContext} from 'src/flows/context/flow.current'
import {RunModeContext, RunMode} from 'src/flows/context/runMode'
import {ResultsContext} from 'src/flows/context/results'
import {fromFlux} from '@influxdata/giraffe'
import {event} from 'src/cloud/utils/reporting'
import {FluxResult} from 'src/types/flows'
import {PIPE_DEFINITIONS} from 'src/flows'
import {propertyTime} from 'src/shared/utils/getMinDurationFromAST'
import {notify} from 'src/shared/actions/notifications'
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'
import {parseDuration, timeRangeToDuration} from 'src/shared/utils/duration'

// Constants
import {
  notebookRunSuccess,
  notebookRunFail,
} from 'src/shared/copy/notifications'
import {TIME_RANGE_START, TIME_RANGE_STOP} from 'src/variables/constants'
import {SELECTABLE_TIME_RANGES} from 'src/shared/constants/timeRanges'
import {PROJECT_NAME} from 'src/flows'

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

interface Stage {
  text: string
  instances: string[]
}

interface VariableMap {
  [key: string]: Variable
}

export interface QueryContextType {
  generateMap: (withSideEffects?: boolean) => Stage[]
  query: (text: string) => Promise<FluxResult>
  queryAll: () => void
}

export const DEFAULT_CONTEXT: QueryContextType = {
  generateMap: () => [],
  query: (_: string) => Promise.resolve({} as FluxResult),
  queryAll: () => {},
}

export const QueryContext = React.createContext<QueryContextType>(
  DEFAULT_CONTEXT
)

const DESIRED_POINTS_PER_GRAPH = 360
const FALLBACK_WINDOW_PERIOD = 15000

const PREVIOUS_REGEXP = /__PREVIOUS_RESULT__/g

export const QueryProvider: FC = ({children}) => {
  const {flow} = useContext(FlowContext)
  const {runMode} = useContext(RunModeContext)
  const {add, update} = useContext(ResultsContext)

  const variables = useSelector((state: AppState) => getVariables(state))

  const buckets = useSelector((state: AppState) => getSortedBuckets(state))
  const bucketsLoadingState = useSelector((state: AppState) =>
    getStatus(state, ResourceType.Buckets)
  )

  const dispatch = useDispatch()

  useEffect(() => {
    if (bucketsLoadingState === RemoteDataState.NotStarted) {
      dispatch(getBuckets())
    }
  }, [bucketsLoadingState, dispatch])

  const vars = useMemo(() => {
    const _vars = [...variables]

    if (!flow?.range) {
      return _vars.reduce((acc, curr) => {
        acc[curr.name] = curr
        return acc
      }, {})
    }

    if (!flow.range.upper) {
      _vars.push({
        orgID: '',
        id: TIME_RANGE_STOP,
        name: TIME_RANGE_STOP,
        arguments: {
          type: 'system',
          values: ['now()'],
        },
        status: RemoteDataState.Done,
        labels: [],
      })
    } else if (isNaN(Date.parse(flow.range.upper))) {
      _vars.push({
        orgID: '',
        id: TIME_RANGE_STOP,
        name: TIME_RANGE_STOP,
        arguments: {
          type: 'system',
          values: [null],
        },
        status: RemoteDataState.Done,
        labels: [],
      })
    } else {
      _vars.push({
        orgID: '',
        id: TIME_RANGE_STOP,
        name: TIME_RANGE_STOP,
        arguments: {
          type: 'system',
          values: [flow.range.upper],
        },
        status: RemoteDataState.Done,
        labels: [],
      })
    }

    if ((flow.range.type as any) !== 'custom') {
      const duration = parseDuration(timeRangeToDuration(flow.range))

      _vars.push({
        orgID: '',
        id: TIME_RANGE_START,
        name: TIME_RANGE_START,
        arguments: {
          type: 'system',
          values: [duration],
        },
        status: RemoteDataState.Done,
        labels: [],
      })
    } else if (isNaN(Date.parse(flow.range.lower))) {
      _vars.push({
        orgID: '',
        id: TIME_RANGE_START,
        name: TIME_RANGE_START,
        arguments: {
          type: 'system',
          values: [null],
        },
        status: RemoteDataState.Done,
        labels: [],
      })
    } else {
      _vars.push({
        orgID: '',
        id: TIME_RANGE_START,
        name: TIME_RANGE_START,
        arguments: {
          type: 'system',
          values: [flow.range.lower],
        },
        status: RemoteDataState.Done,
        labels: [],
      })
    }

    return _vars.reduce((acc, curr) => {
      acc[curr.name] = curr
      return acc
    }, {})
  }, [variables, flow?.range])

  const generateMap = (withSideEffects?: boolean): Stage[] => {
    return flow.data.allIDs
      .reduce((stages, pipeID) => {
        const pipe = flow.data.get(pipeID)

        const stage = {
          text: '',
          instances: [pipeID],
          requirements: {},
        }

        const create = text => {
          if (text && PREVIOUS_REGEXP.test(text) && stages.length) {
            stage.text = text.replace(
              PREVIOUS_REGEXP,
              stages[stages.length - 1].text
            )
          } else {
            stage.text = text
          }

          stages.push(stage)
        }

        const append = () => {
          if (stages.length) {
            stages[stages.length - 1].instances.push(pipeID)
          }
        }

        if (
          PIPE_DEFINITIONS[pipe.type] &&
          PIPE_DEFINITIONS[pipe.type].generateFlux
        ) {
          PIPE_DEFINITIONS[pipe.type].generateFlux(
            pipe,
            create,
            append,
            withSideEffects
          )
        } else {
          append()
        }

        return stages
      }, [])
      .map(queryStruct => {
        const queryText =
          Object.entries(queryStruct.requirements)
            .map(([key, value]) => `${key} = (\n${value}\n)\n\n`)
            .join('') + queryStruct.text

        return {
          text: queryText,
          instances: queryStruct.instances,
        }
      })
  }

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

  const _getVars = (ast, acc: VariableMap = {}): VariableMap =>
    _walk(
      ast,
      node => node?.type === 'MemberExpression' && node?.object?.name === 'v'
    )
      .map(node => node.property.name)
      .reduce((tot, curr) => {

        if (tot.hasOwnProperty(curr)) {
          return tot
        }

          if (!vars[curr]) {
              tot[curr] = null
              return tot
          }
        tot[curr] = vars[curr]

        if (tot[curr].arguments.type === 'query') {
          _getVars(parse(tot[curr].arguments.values.query), tot)
        }

        return tot
      }, acc)

  const query = (text: string): Promise<FluxResult> => {
    // Some preamble for setting the stage
    const baseAST = parse(text)
    const usedVars = _getVars(baseAST)
    const optionAST = buildVarsOption(Object.values(usedVars).filter(v => !!v).map(v => asAssignment(v)))

    const ast = {
      package: '',
      type: 'Package',
      files: [baseAST, optionAST],
    }

    // Here we grab the org from the contents of the query
    const queryBuckets = _walk(
      ast,
      node =>
        node?.type === 'CallExpression' &&
        node?.callee?.type === 'Identifier' &&
        node?.callee?.name === 'from' &&
        node?.arguments[0]?.properties[0]?.key?.name === 'bucket'
    ).map(node => node?.arguments[0]?.properties[0]?.value.value)
    const orgID =
      buckets.find(buck => queryBuckets.includes(buck.name))?.orgID ||
      useSelector(getOrg).id

    // This is all for trying to tease out a window period
    if (usedVars.hasOwnProperty('windowPeriod')) {
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
        ;(((optionAST.body[0] as OptionStatement)
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
      } else {
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
          ;(((optionAST.body[0] as OptionStatement)
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
        } else {
          ;(((optionAST.body[0] as OptionStatement)
            .assignment as VariableAssignment)
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
                  magnitude: Math.round(
                    queryDuration / DESIRED_POINTS_PER_GRAPH
                  ),
                  unit: 'ms',
                },
              ],
            },
          })
        }
      }
    }

    event('runQuery', {context: 'flows'})

    const result = runQuery(orgID, text, optionAST)

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
        } as FluxResult
      })
  }

  const forceUpdate = (id, data) => {
    try {
      update(id, data)
    } catch (_e) {
      add(id, data)
    }
  }

  const statuses = flow ? flow.meta.all.map(({loading}) => loading) : []

  let status = RemoteDataState.Done

  if (statuses.every(s => s === RemoteDataState.NotStarted)) {
    status = RemoteDataState.NotStarted
  } else if (statuses.includes(RemoteDataState.Error)) {
    status = RemoteDataState.Error
  } else if (statuses.includes(RemoteDataState.Loading)) {
    status = RemoteDataState.Loading
  }

  const queryAll = () => {
    if (status === RemoteDataState.Loading) {
      return
    }

    const map = generateMap(runMode === RunMode.Run)

    if (!map.length) {
      return
    }

    event('Running Notebook QueryAll')

    Promise.all(
      map.map(stage => {
        stage.instances.forEach(pipeID => {
          flow.meta.update(pipeID, {loading: RemoteDataState.Loading})
        })
        return query(stage.text)
          .then(response => {
            stage.instances.forEach(pipeID => {
              flow.meta.update(pipeID, {loading: RemoteDataState.Done})
              forceUpdate(pipeID, response)
            })
          })
          .catch(e => {
            stage.instances.forEach(pipeID => {
              forceUpdate(pipeID, {
                error: e.message,
              })
              flow.meta.update(pipeID, {loading: RemoteDataState.Error})
            })
          })
      })
    )
      .then(() => {
        event('run_notebook_success', {runMode})
        dispatch(notify(notebookRunSuccess(runMode, PROJECT_NAME)))
      })
      .catch(e => {
        event('run_notebook_fail', {runMode})
        dispatch(notify(notebookRunFail(runMode, PROJECT_NAME)))

        // NOTE: this shouldn't fire, but lets wrap it for completeness
        throw e
      })
  }

  if (!flow) {
    return (
      <EmptyGraphMessage
        message="Could not find this notebook"
        testID="notebook-not-found"
      />
    )
  }

  if (!flow?.range || bucketsLoadingState !== RemoteDataState.Done) {
    return null
  }

  return (
    <QueryContext.Provider value={{query, generateMap, queryAll}}>
      {children}
    </QueryContext.Provider>
  )
}

export default QueryProvider
