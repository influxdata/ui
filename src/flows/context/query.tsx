import React, {FC, useContext, useMemo, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {parse} from 'src/external/parser'
import {runQuery} from 'src/shared/apis/query'
import {getWindowVars} from 'src/variables/utils/getWindowVars'
import {buildVarsOption} from 'src/variables/utils/buildVarsOption'
import {getTimeRangeVars} from 'src/variables/utils/getTimeRangeVars'
import {getVariables, asAssignment} from 'src/variables/selectors'
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
import {
  generateHashedQueryID,
  setQueryByHashID,
} from 'src/timeMachine/actions/queries'
import {notify} from 'src/shared/actions/notifications'
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'

// Constants
import {
  notebookRunSuccess,
  notebookRunFail,
} from 'src/shared/copy/notifications'
import {PROJECT_NAME} from 'src/flows'

// Types
import {AppState, ResourceType, RemoteDataState} from 'src/types'
interface Stage {
  text: string
  instances: string[]
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

const PREVIOUS_REGEXP = /__PREVIOUS_RESULT__/g

const findOrgID = (text, buckets) => {
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
    if (flow?.range) {
      return variables
        .map(v => asAssignment(v))
        .concat(getTimeRangeVars(flow.range))
    }

    variables.map(v => asAssignment(v))
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

  const query = (text: string): Promise<FluxResult> => {
    const orgID = findOrgID(text, buckets)
    const windowVars = getWindowVars(text, vars)
    const extern = buildVarsOption([...vars, ...windowVars])
    const queryID = generateHashedQueryID(text, variables, orgID)
    event('runQuery', {context: 'flows'})
    const result = runQuery(orgID, text, extern)
    setQueryByHashID(queryID, result)
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
