import React, {FC, useContext, useState, useMemo} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {getVariables} from 'src/variables/selectors'
import {FlowContext} from 'src/flows/context/flow.current'
import {RunModeContext, RunMode} from 'src/flows/context/runMode'
import {ResultsContext} from 'src/flows/context/results'
import {QueryContext, simplify} from 'src/flows/context/query'
import {event} from 'src/cloud/utils/reporting'
import {FluxResult, QueryScope} from 'src/types/flows'
import {PIPE_DEFINITIONS, PROJECT_NAME} from 'src/flows'
import {notify} from 'src/shared/actions/notifications'
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'
import {parseDuration, timeRangeToDuration} from 'src/shared/utils/duration'
import {useEvent, sendEvent} from 'src/users/hooks/useEvent'
import {getOrg} from 'src/organizations/selectors'

// Constants
import {
  notebookRunSuccess,
  notebookRunFail,
} from 'src/shared/copy/notifications'
import {TIME_RANGE_START, TIME_RANGE_STOP} from 'src/variables/constants'

// Types
import {AppState, RemoteDataState, Variable} from 'src/types'

export interface Stage {
  id: string
  scope: QueryScope
  source?: string
  visual?: string
}

export interface FlowQueryContextType {
  generateMap: (withSideEffects?: boolean) => Stage[]
  printMap: (id?: string, withSideEffects?: boolean) => void
  query: (text: string) => Promise<FluxResult>
  basic: (text: string) => any
  simplify: (text: string) => string
  queryAll: () => void
  getPanelQueries: (id: string, withSideEffects?: boolean) => Stage
  status: RemoteDataState
  getStatus: (id: string) => RemoteDataState
}

export const DEFAULT_CONTEXT: FlowQueryContextType = {
  generateMap: () => [],
  printMap: () => {},
  query: (_: string) => Promise.resolve({} as FluxResult),
  basic: (_: string) => {},
  simplify: (_: string) => '',
  queryAll: () => {},
  getPanelQueries: (_, _a) => ({id: '', scope: {}, source: '', visual: ''}),
  status: RemoteDataState.NotStarted,
  getStatus: (_: string) => RemoteDataState.NotStarted,
}

export const FlowQueryContext = React.createContext<FlowQueryContextType>(
  DEFAULT_CONTEXT
)

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
  const [loading, setLoading] = useState({})
  const org = useSelector(getOrg)

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

  const getStatus = (id: string) => {
    if (!loading.hasOwnProperty(id)) {
      return RemoteDataState.NotStarted
    }

    return loading[id]
  }

  const generateMap = (withSideEffects?: boolean): Stage[] => {
    const stages = flow.data.allIDs.reduce((acc, panelID) => {
      const panel = flow.data.get(panelID)

      const last = acc[acc.length - 1] || {
        scope: {
          withSideEffects: !!withSideEffects,
          region: window.location.origin,
          org: org.id,
        },
        source: '',
        visual: '',
      }

      const meta = {
        ...last,
        id: panel.id,
        visual: '',
      }

      if (!PIPE_DEFINITIONS[panel.type]) {
        acc.push(meta)
        return acc
      }

      if (typeof PIPE_DEFINITIONS[panel.type].scope === 'function') {
        meta.scope = PIPE_DEFINITIONS[panel.type].scope(
          panel,
          acc[acc.length - 1]?.scope || {}
        )
      }

      if (typeof PIPE_DEFINITIONS[panel.type].source === 'function') {
        meta.source = PIPE_DEFINITIONS[panel.type].source(
          panel,
          '' + (acc[acc.length - 1]?.source || ''),
          meta.scope
        )
      }

      if (typeof PIPE_DEFINITIONS[panel.type].visual === 'function') {
        meta.visual = PIPE_DEFINITIONS[panel.type].visual(
          panel,
          '' + (meta.source || ''),
          meta.scope
        )
      }

      acc.push(meta)
      return acc
    }, [])

    return stages
  }

  // TODO figure out a better way to cache these requests
  const getPanelQueries = (id: string, withSideEffects?: boolean): Stage => {
    return generateMap(withSideEffects).find(i => i.id === id)
  }

  // This function allows the developer to see the queries
  // that the panels are generating through a notebook. Each
  // panel should have a source query, any panel that needs
  // to display some data should have a visualization query
  const printMap = (id?: string, withSideEffects?: boolean) => {
    /* eslint-disable no-console */
    // Grab all the ids in the order that they're presented
    generateMap(withSideEffects).forEach(i => {
      console.log(
        `\n\n%cPanel: %c ${i}`,
        'font-family: sans-serif; font-size: 16px; font-weight: bold; color: #000',
        i.id === id
          ? 'font-weight: bold; font-size: 16px; color: #666'
          : 'font-weight: normal; font-size: 16px; color: #888'
      )

      console.log(
        `%c Source Query: \n%c ${i.source}`,
        'font-family: sans-serif; font-weight: bold; font-size: 14px; color: #666',
        'font-family: monospace; color: #888'
      )
      console.log(
        `%c Visualization Query: \n%c ${i.visual}\n`,
        'font-family: sans-serif; font-weight: bold; font-size: 14px; color: #666',
        'font-family: monospace; color: #888'
      )
    })
    /* eslint-enable no-console */
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

  const statuses = Object.values(loading)

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
        .filter(q => !!q.visual)
        .map(stage => {
          loading[stage.id] = RemoteDataState.Loading
          setLoading(loading)
          return query(stage.visual)
            .then(response => {
              loading[stage.id] = RemoteDataState.Done
              setLoading(loading)
              forceUpdate(stage.id, response)
            })
            .catch(e => {
              forceUpdate(stage.id, {
                error: e.message,
              })
              loading[stage.id] = RemoteDataState.Error
              setLoading(loading)
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

  const simple = (text: string) => {
    return simplify(text, vars)
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
    <FlowQueryContext.Provider
      value={{
        query,
        basic,
        simplify: simple,
        generateMap,
        printMap,
        queryAll,
        getPanelQueries,
        status,
        getStatus,
      }}
    >
      {children}
    </FlowQueryContext.Provider>
  )
}
