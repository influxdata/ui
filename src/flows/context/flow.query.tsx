import React, {
  FC,
  useContext,
  useMemo,
  useEffect,
  useState,
  useRef,
} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {getVariables} from 'src/variables/selectors'
import {FlowContext} from 'src/flows/context/flow.current'
import {ResultsContext} from 'src/flows/context/results'
import {QueryContext, simplify} from 'src/shared/contexts/query'
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
  generateMap: () => Stage[]
  printMap: (id?: string) => void
  query: (text: string, override?: QueryScope) => Promise<FluxResult>
  basic: (text: string) => any
  simplify: (text: string) => string
  queryAll: () => void
  queryDependents: (startID: string) => void
  getPanelQueries: (id: string) => Stage | null
  status: RemoteDataState
}

export const DEFAULT_CONTEXT: FlowQueryContextType = {
  generateMap: () => [],
  printMap: () => {},
  query: (_: string, __: QueryScope) => Promise.resolve({} as FluxResult),
  basic: (_: string) => {},
  simplify: (_: string) => '',
  queryAll: () => {},
  queryDependents: () => {},
  getPanelQueries: _ => ({
    id: '',
    scope: {vars: {}},
    source: '',
    visual: '',
  }),
  status: RemoteDataState.NotStarted,
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
  const {setResult, setStatuses, statuses} = useContext(ResultsContext)
  const {query: queryAPI, basic: basicAPI} = useContext(QueryContext)
  const org = useSelector(getOrg) ?? {id: ''}
  const [prevLower, setPrevLower] = useState<string>(flow?.range?.lower)

  const dispatch = useDispatch()
  const notebookQueryKey = `queryAll-${flow?.name}`
  const variables = useSelector((state: AppState) => getVariables(state))

  useEffect(() => {
    if (flow?.range?.lower !== prevLower) {
      // only run the query if a previously set value has been changed.
      // unless we're in presentation mode, then we should run the query on load.
      if (prevLower || flow.readOnly) {
        queryAll()
      }
      setPrevLower(flow?.range?.lower)
    }
  }, [flow])

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

  const _map = useRef([])
  const _generateMap = (): Stage[] => {
    const stages = (flow?.data?.allIDs ?? []).reduce((acc, panelID) => {
      const panel = flow.data.byID[panelID]

      if (!panel) {
        return acc
      }

      const last = acc[acc.length - 1] || {
        scope: {
          region: window.location.origin,
          org: org.id,
        },
        source: '',
        visual: '',
      }

      const meta = {
        ...last,
        id: panelID,
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
          '' + (acc[acc.length - 1]?.source || ''),
          meta.scope
        )
      }

      acc.push(meta)
      return acc
    }, [])

    _map.current = stages
    return stages
  }

  useEffect(() => {
    _generateMap()
  }, [flow])

  const generateMap = (): Stage[] => {
    // this is to get around an issue where a panel is added, which triggers the useEffect that updates
    // _map.current and a rerender that updates the panel view components within the same render cycle
    // leading to a panel on the list without a corresponding map entry
    const forceUpdate =
      (flow?.data?.allIDs ?? []).join(' ') !==
      (_map.current ?? []).map(m => m.id).join(' ')

    if (forceUpdate) {
      _generateMap()
    }

    return _map.current
  }

  // TODO figure out a better way to cache these requests
  const getPanelQueries = (id: string): Stage | null => {
    if (!id) {
      return null
    }

    return generateMap().find(i => i.id === id)
  }

  // This function allows the developer to see the queries
  // that the panels are generating through a notebook. Each
  // panel should have a source query, any panel that needs
  // to display some data should have a visualization query
  const printMap = (id?: string) => {
    /* eslint-disable no-console */
    // Grab all the ids in the order that they're presented
    generateMap().forEach(i => {
      console.log(
        `\n\n%cPanel: %c ${i.id}`,
        'font-family: sans-serif; font-size: 16px; font-weight: bold; color: #000',
        i.id === id
          ? 'font-weight: bold; font-size: 16px; color: #666'
          : 'font-weight: normal; font-size: 16px; color: #888'
      )

      console.log(
        `%c Scope: \n%c ${JSON.stringify(i.scope, null, 2)}`,
        'font-family: sans-serif; font-weight: bold; font-size: 14px; color: #666',
        'font-family: monospace; color: #888'
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

  const query = (text: string, override?: QueryScope): Promise<FluxResult> => {
    event('runQuery', {context: 'flows'})

    const _override: QueryScope = {
      region: window.location.origin,
      org: org.id,
      ...(override || {}),
      vars: {
        ...vars,
        ...(override?.vars || {}),
      },
    }

    return queryAPI(text, _override)
  }

  const basic = (text: string, override?: QueryScope): Promise<FluxResult> => {
    const _override: QueryScope = {
      region: window.location.origin,
      org: org.id,
      ...(override || {}),
      vars: {
        ...vars,
        ...(override?.vars || {}),
      },
    }

    return basicAPI(text, _override)
  }

  const stati = Object.values(statuses)

  let status = RemoteDataState.Done

  if (stati.every(s => s === RemoteDataState.NotStarted)) {
    status = RemoteDataState.NotStarted
  } else if (stati.includes(RemoteDataState.Error)) {
    status = RemoteDataState.Error
  } else if (stati.includes(RemoteDataState.Loading)) {
    status = RemoteDataState.Loading
  }

  const queryDependents = (startID: string) => {
    sendEvent(notebookQueryKey)
    _queryDependents(startID)
  }

  const _queryDependents = (startID: string) => {
    if (status === RemoteDataState.Loading) {
      return
    }

    let map = generateMap()

    if (!map.length) {
      return
    }

    map = map.slice(map.findIndex(m => m.id === startID))
    event('Running Notebook QueryDependents')

    setStatuses(
      map
        .filter(q => !!q?.visual)
        .reduce((a, c) => {
          a[c.id] = RemoteDataState.Loading
          return a
        }, {})
    )
    Promise.all(
      map
        .filter(q => !!q?.visual)
        .map(stage => {
          return query(stage.visual, stage.scope)
            .then(response => {
              setStatuses({[stage.id]: RemoteDataState.Done})
              setResult(stage.id, response)
            })
            .catch(e => {
              setResult(stage.id, {
                error: e.message,
              })
              setStatuses({[stage.id]: RemoteDataState.Error})
            })
        })
    )
      .then(() => {
        event('run_notebook_success')
        dispatch(notify(notebookRunSuccess(PROJECT_NAME)))
      })
      .catch(e => {
        event('run_notebook_fail')
        dispatch(notify(notebookRunFail(PROJECT_NAME)))

        // NOTE: this shouldn't fire, but lets wrap it for completeness
        throw e
      })
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

    const map = generateMap()

    if (!map.length) {
      return
    }

    event('Running Notebook QueryAll')

    setStatuses(
      map
        .filter(q => !!q?.visual)
        .reduce((a, c) => {
          a[c.id] = RemoteDataState.Loading
          return a
        }, {})
    )

    Promise.all(
      map
        .filter(q => !!q.visual)
        .map(stage => {
          return query(stage.visual, stage.scope)
            .then(response => {
              setResult(stage.id, response)
              setStatuses({[stage.id]: RemoteDataState.Done})
            })
            .catch(e => {
              setResult(stage.id, {
                error: e.message,
              })
              setStatuses({[stage.id]: RemoteDataState.Error})
            })
        })
    )
      .then(() => {
        event('run_notebook_success')
        dispatch(notify(notebookRunSuccess(PROJECT_NAME)))
      })
      .catch(e => {
        event('run_notebook_fail')
        dispatch(notify(notebookRunFail(PROJECT_NAME)))

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
        queryDependents,
        getPanelQueries,
        status,
      }}
    >
      {children}
    </FlowQueryContext.Provider>
  )
}
