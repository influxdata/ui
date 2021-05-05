import React, {FC, useContext, useMemo} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {getVariables} from 'src/variables/selectors'
import {FlowContext} from 'src/flows/context/flow.current'
import {RunModeContext, RunMode} from 'src/flows/context/runMode'
import {ResultsContext} from 'src/flows/context/results'
import {QueryContext} from 'src/flows/context/query'
import {event} from 'src/cloud/utils/reporting'
import {FluxResult} from 'src/types/flows'
import {PIPE_DEFINITIONS} from 'src/flows'
import {notify} from 'src/shared/actions/notifications'
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'
import {parseDuration, timeRangeToDuration} from 'src/shared/utils/duration'
import {useEvent, sendEvent} from 'src/unity/hooks/useEvent'

// Constants
import {
  notebookRunSuccess,
  notebookRunFail,
} from 'src/shared/copy/notifications'
import {TIME_RANGE_START, TIME_RANGE_STOP} from 'src/variables/constants'
import {PROJECT_NAME} from 'src/flows'

// Types
import {AppState, RemoteDataState, Variable} from 'src/types'

interface Instance {
  id: string
  modifier?: string
}

export interface Stage {
  text: string
  instances: Instance[]
}

export interface FlowQueryContextType {
  generateMap: (withSideEffects?: boolean) => Stage[]
  query: (text: string) => Promise<FluxResult>
  basic: (text: string) => any
  queryAll: () => void
}

export const DEFAULT_CONTEXT: FlowQueryContextType = {
  generateMap: () => [],
  query: (_: string) => Promise.resolve({} as FluxResult),
  basic: (_: string) => {},
  queryAll: () => {},
}

export const FlowQueryContext = React.createContext<FlowQueryContextType>(
  DEFAULT_CONTEXT
)

const PREVIOUS_REGEXP = /__PREVIOUS_RESULT__/g
const CURRENT_REGEXP = /__CURRENT_RESULT__/g

const generateTimeVar = (which, value): Variable =>
  ({
    orgID: '',
    id: which,
    name: which,
    arguments: {
      type: 'system',
      values: [value],
    },
    status: RemoteDataState.Done,
    labels: [],
  } as Variable)

export const FlowQueryProvider: FC = ({children}) => {
  const {flow} = useContext(FlowContext)
  const {runMode} = useContext(RunModeContext)
  const {add, update} = useContext(ResultsContext)
  const {query: queryAPI, basic: basicAPI} = useContext(QueryContext)

  const dispatch = useDispatch()
  const notebookQueryKey = `queryAll-${flow?.name}`
  const variables = useSelector((state: AppState) => getVariables(state))

  // Share querying event across tabs
  const handleStorageEvent = e => {
    if (e.key === notebookQueryKey && e.newValue === notebookQueryKey) {
      _queryAll()
    }
  }
  useEvent('storage', handleStorageEvent)

  const vars = useMemo(() => {
    const _vars = [...variables]

    if (!flow?.range) {
      return _vars.reduce((acc, curr) => {
        acc[curr.name] = curr
        return acc
      }, {})
    }

    // Here we add in those optional time range variables if we have them
    if (!flow.range.upper) {
      _vars.push(generateTimeVar(TIME_RANGE_STOP, 'now()'))
    } else if (isNaN(Date.parse(flow.range.upper))) {
      _vars.push(generateTimeVar(TIME_RANGE_STOP, null))
    } else {
      _vars.push(generateTimeVar(TIME_RANGE_STOP, flow.range.upper))
    }

    if ((flow.range.type as any) !== 'custom') {
      const duration = parseDuration(timeRangeToDuration(flow.range))

      _vars.push(generateTimeVar(TIME_RANGE_START, duration))
    } else if (isNaN(Date.parse(flow.range.lower))) {
      _vars.push(generateTimeVar(TIME_RANGE_START, null))
    } else {
      _vars.push(generateTimeVar(TIME_RANGE_START, flow.range.lower))
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

        const create = text => {
          const stage = {
            text: '',
            instances: [{id: pipeID}],
            requirements: {},
          }
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

        const append = (modifier?) => {
          if (!stages.length) {
            return
          }

          const text = (modifier || '').replace(
            CURRENT_REGEXP,
            stages[stages.length - 1].text
          )

          stages[stages.length - 1].instances = [
            ...stages[stages.length - 1].instances.filter(i => i.id !== pipeID),
            {
              id: pipeID,
              modifier: text,
            },
          ]
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
    event('runQuery', {context: 'flows'})

    return queryAPI(text, vars)
  }

  const basic = (text: string): Promise<FluxResult> => {
    return basicAPI(text, vars)
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

  // Use localstorage to communicate query execution to other tabs
  const queryAll = () => {
    sendEvent(notebookQueryKey)
    _queryAll()
  }

  const _queryAll = () => {
    if (status === RemoteDataState.Loading) {
      return
    }

    const map = generateMap(runMode === RunMode.Run)

    if (!map.length) {
      return
    }

    event('Running Notebook QueryAll')

    Promise.all(
      map
        .reduce((acc, curr) => {
          acc.push({
            text: curr.text,
            instances: curr.instances.filter(i => !i.modifier).map(i => i.id),
          })

          return acc.concat(
            curr.instances
              .filter(i => i.modifier)
              .map(i => ({
                text: i.modifier,
                instances: [i.id],
              }))
          )
        }, [])
        .filter(stage => !!stage.instances.length)
        .map(stage => {
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

  if (!flow?.range) {
    return null
  }

  return (
    <FlowQueryContext.Provider value={{query, basic, generateMap, queryAll}}>
      {children}
    </FlowQueryContext.Provider>
  )
}
