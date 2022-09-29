import React, {FC, useContext, useEffect, useRef} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {FlowContext} from 'src/flows/context/flow.current'
import {ResultsContext} from 'src/flows/context/results'
import {
  QueryContext,
  QueryScope,
  OverrideMechanism,
  simplify,
} from 'src/shared/contexts/query'
import {event} from 'src/cloud/utils/reporting'
import {FluxResult} from 'src/types/flows'
import {PIPE_DEFINITIONS, PROJECT_NAME} from 'src/flows'
import {notify} from 'src/shared/actions/notifications'
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'
import {useEvent, sendEvent} from 'src/users/hooks/useEvent'
import {getOrg} from 'src/organizations/selectors'

// Constants
import {notebookRunFail} from 'src/shared/copy/notifications'

// Types
import {RemoteDataState} from 'src/types'

export interface Stage {
  id: string
  scope: QueryScope
  source?: string
  visual?: string
}

export interface FlowQueryContextType {
  generateMap: (doubleForceUpdate?: boolean) => Stage[]
  printMap: (id?: string) => void
  query: (text: string, override?: QueryScope) => Promise<FluxResult>
  basic: (text: string, override?: QueryScope) => any
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
  basic: (_: string, __?: QueryScope) => {},
  simplify: (_: string) => '',
  queryAll: () => {},
  queryDependents: () => {},
  getPanelQueries: _ => ({
    id: '',
    scope: {
      region: '',
      org: '',
    },
    source: '',
    visual: '',
  }),
  status: RemoteDataState.NotStarted,
}

export const FlowQueryContext =
  React.createContext<FlowQueryContextType>(DEFAULT_CONTEXT)

export const FlowQueryProvider: FC = ({children}) => {
  const {flow} = useContext(FlowContext)
  const {setResult, setStatuses, statuses} = useContext(ResultsContext)
  const {query: queryAPI, basic: basicAPI} = useContext(QueryContext)
  const org = useSelector(getOrg) ?? {id: ''}

  const dispatch = useDispatch()
  const notebookQueryKey = `queryAll-${flow?.name}`

  useEffect(() => {
    if (!flow?.range) {
      return
    }
    _generateMap()
    queryAll()
  }, [flow?.range?.lower, flow?.range?.upper])

  useEffect(() => {
    if (flow?.readOnly) {
      queryAll()
    }
  }, [flow?.readOnly])

  // Share querying event across tabs
  const handleStorageEvent = e => {
    if (e.key === notebookQueryKey && e.newValue === notebookQueryKey) {
      _queryAll()
    }
  }
  useEvent('storage', handleStorageEvent)

  const _map = useRef([])
  let timeRangeStart, timeRangeStop

  if (!flow?.range) {
    timeRangeStart = timeRangeStop = null
  } else {
    if (flow.range.type === 'selectable-duration') {
      timeRangeStart = '-' + flow.range.duration
    } else if (flow.range.type === 'duration') {
      timeRangeStart = '-' + flow.range.lower
    } else if (isNaN(Date.parse(flow.range.lower))) {
      timeRangeStart = null
    } else {
      timeRangeStart = new Date(flow.range.lower).toISOString()
    }

    if (!flow.range.upper) {
      timeRangeStop = 'now()'
    } else if (isNaN(Date.parse(flow.range.upper))) {
      timeRangeStop = null
    } else {
      timeRangeStop = new Date(flow.range.upper).toISOString()
    }
  }

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
          vars: {
            timeRangeStart,
            timeRangeStop,
          },
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
        meta.scope = PIPE_DEFINITIONS[panel.type].scope(panel, last.scope)
      }

      if (typeof PIPE_DEFINITIONS[panel.type].source === 'function') {
        meta.source = PIPE_DEFINITIONS[panel.type].source(
          panel,
          '' + last.source,
          meta.scope
        )
      }

      if (typeof PIPE_DEFINITIONS[panel.type].visual === 'function') {
        meta.visual = PIPE_DEFINITIONS[panel.type].visual(
          panel,
          '' + last.source,
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

  const generateMap = (doubleForceUpdate?: boolean): Stage[] => {
    // this is to get around an issue where a panel is added, which triggers the useEffect that updates
    // _map.current and a rerender that updates the panel view components within the same render cycle
    // leading to a panel on the list without a corresponding map entry
    const forceUpdate =
      (flow?.data?.allIDs ?? []).join(' ') !==
      (_map.current ?? []).map(m => m.id).join(' ')

    if (forceUpdate || doubleForceUpdate) {
      // doubleForceUpdate is used to resolve react life cycle issue
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
    const _override: QueryScope = {
      region: window.location.origin,
      org: org.id,
      ...(override || {}),
    }

    return queryAPI(text, _override, {
      overrideMechanism: OverrideMechanism.Inline,
    })
  }

  const basic = (text: string, override?: QueryScope): Promise<FluxResult> => {
    const _override: QueryScope = {
      region: window.location.origin,
      org: org.id,
      ...(override || {}),
    }

    return basicAPI(text, _override, {
      overrideMechanism: OverrideMechanism.Inline,
    })
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
      })
      .catch(e => {
        event('run_notebook_fail')
        dispatch(notify(notebookRunFail(PROJECT_NAME)))

        // NOTE: this shouldn't fire, but lets wrap it for completeness
        throw e
      })
  }

  const simple = (text: string) => {
    return simplify(text, {
      timeRangeStart,
      timeRangeStop,
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
