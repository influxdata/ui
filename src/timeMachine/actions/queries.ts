// Libraries
import {parse} from 'src/languageSupport/languages/flux/parser'
import {get, sortBy} from 'lodash'

// API
import {
  runQuery,
  processResponse,
  processResponseBlob,
  RunQueryResult,
  RunQuerySuccessResult,
} from 'src/shared/apis/query'
import {
  getCachedResultsOrRunQuery,
  resetQueryCacheByQuery,
} from 'src/shared/apis/queryCache'
import {runStatusesQuery} from 'src/alerting/utils/statusEvents'

// Actions
import {notify} from 'src/shared/actions/notifications'
import {hydrateVariables} from 'src/variables/actions/thunks'

// Constants
import {rateLimitReached, resultTooLarge} from 'src/shared/copy/notifications'

// Utils
import {buildUsedVarsOption} from 'src/variables/utils/buildVarsOption'
import {findNodes} from 'src/shared/utils/ast'
import {event} from 'src/cloud/utils/reporting'
import {asSimplyKeyValueVariables, hashCode} from 'src/shared/apis/queryCache'
import {filterUnusedVarsBasedOnQuery} from 'src/shared/utils/filterUnusedVars'
import {downloadBlob} from 'src/shared/utils/download'
import {createDateTimeFormatter} from 'src/utils/datetime/formatters'

// Types
import {CancelBox} from 'src/types/promises'
import {
  GetState,
  RemoteDataState,
  StatusRow,
  Node,
  ResourceType,
  Bucket,
  QueryEditMode,
  BuilderTagsType,
  Variable,
  AppState,
} from 'src/types'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {getAll} from 'src/resources/selectors/index'
import {isCurrentPageDashboard} from 'src/dashboards/selectors'
import {getAllVariables} from 'src/variables/selectors'
import {getActiveTimeMachine, getActiveQuery} from 'src/timeMachine/selectors'

export type Action = SaveDraftQueriesAction | SetQueryResults

interface SetQueryResults {
  type: 'SET_QUERY_RESULTS'
  payload: {
    status: RemoteDataState
    files?: string[]
    fetchDuration?: number
    errorMessage?: string
    statuses?: StatusRow[][]
  }
}

export const setQueryResults = (
  status: RemoteDataState,
  files?: string[],
  fetchDuration?: number,
  errorMessage?: string,
  statuses?: StatusRow[][]
): SetQueryResults => ({
  type: 'SET_QUERY_RESULTS',
  payload: {
    status,
    files,
    fetchDuration,
    errorMessage,
    statuses,
  },
})

let pendingCheckStatuses: CancelBox<StatusRow[][]> = null

export const getOrgIDFromBuckets = (
  text: string,
  allBuckets: Bucket[]
): string | null => {
  try {
    const ast = parse(text)
    const bucketsInQuery: string[] = findNodes(ast, isFromBucket).map(node =>
      get(node, 'arguments.0.properties.0.value.value', '')
    )

    // if there are buckets from multiple orgs in a query, query will error, and user will receive error from query
    const bucketMatch = allBuckets.find(a => bucketsInQuery.includes(a.name))

    return get(bucketMatch, 'orgID', null)
  } catch (e) {
    console.error(e)
    return null
  }
}

// We only need a minimum of one bucket, function, and tag,
export const getQueryFromFlux = (text: string) => {
  const ast = parse(text)

  const aggregateWindowQuery: string[] = findNodes(ast, isFromFunction).map(
    node => get(node, 'arguments.0.properties.0.value.values.0.magnitude', '')
  )

  const bucketsInQuery: string[] = findNodes(ast, isFromBucket).map(node =>
    get(node, 'arguments.0.properties.0.value.value', '')
  )

  const functionsInQuery: string[] = findNodes(ast, isFromFunction).map(node =>
    get(node, 'arguments.0.properties.1.value.name', '')
  )

  const tagsKeysInQuery: string[] = findNodes(ast, isFromTag).map(node =>
    get(node, 'arguments.0.properties.0.value.body.left.property.value', '')
  )

  const tagsValuesInQuery: string[] = findNodes(ast, isFromTag).map(node =>
    get(node, 'arguments.0.properties.0.value.body.right.value', '')
  )

  const functionName = functionsInQuery.join()
  const aggregateWindowName = aggregateWindowQuery.join()
  const firstTagKey = tagsKeysInQuery.pop()
  const firstValueKey = tagsValuesInQuery.pop()

  // we need [bucket], functions=[{1}], tags = [{aggregateFunctionType: "filter",key: "_measurement",values:["cpu", "disk"]}]
  return {
    builderConfig: {
      buckets: bucketsInQuery,
      functions: [{name: functionName}],
      tags: [
        {
          aggregateFunctionType: 'filter',
          key: firstTagKey,
          values: [firstValueKey],
        } as BuilderTagsType,
      ],
      aggregateWindow: {period: aggregateWindowName},
    },
    editMode: 'builder' as QueryEditMode,
    name: '',
    text: text,
  }
}

const isFromBucket = (node: Node) => {
  return (
    get(node, 'type') === 'CallExpression' &&
    get(node, 'callee.type') === 'Identifier' &&
    get(node, 'callee.name') === 'from' &&
    get(node, 'arguments.0.properties.0.key.name') === 'bucket'
  )
}

const isFromFunction = (node: Node) => {
  return (
    get(node, 'callee.type') === 'Identifier' &&
    get(node, 'callee.name') === 'aggregateWindow' &&
    get(node, 'arguments.0.properties.1.key.name') === 'fn'
  )
}

const isFromTag = (node: Node) => {
  return (
    get(node, 'callee.type') === 'Identifier' &&
    get(node, 'callee.name') === 'filter' &&
    get(node, 'arguments.0.properties.0.value.type') === 'FunctionExpression'
  )
}

export const generateHashedQueryID = (
  query: string,
  vars: Variable[],
  orgID: string
): string => {
  const hashedQuery = `${hashCode(query)}`
  const usedVars = filterUnusedVarsBasedOnQuery(vars, [query])
  const variables = sortBy(usedVars, ['name'])
  const simplifiedVariables = variables.map(v => asSimplyKeyValueVariables(v))
  const stringifiedVars = JSON.stringify(simplifiedVariables)
  // create the queryID based on the query & vars
  const hashedVariables = `${hashCode(stringifiedVars)}`

  return `${hashedQuery}_${hashedVariables}_${hashCode(orgID)}`
}

const queryReference = {}

export const cancelQueryByHashID = (queryID: string): void => {
  if (queryID in queryReference) {
    queryReference[queryID].cancel()
    delete queryReference[queryID]
  }
}

const cancelQuerysByHashIDs = (queryIDs?: string[]): void => {
  if (queryIDs.length > 0) {
    queryIDs.forEach(queryID => cancelQueryByHashID(queryID))
  }
  Object.keys(queryReference).forEach((queryID: string) => {
    cancelQueryByHashID(queryID)
  })
}

export const cancelAllRunningQueries = () => dispatch => {
  cancelQuerysByHashIDs(Object.keys(queryReference))
  dispatch(setQueryResults(RemoteDataState.Done, null, null))
}

export const setQueryByHashID = (queryID: string, result: any): void => {
  queryReference[queryID] = {
    cancel: result.cancel,
    issuedAt: Date.now(),
    promise: result.promise,
    status: RemoteDataState.Loading,
  }
  result.promise
    .then(() => {
      queryReference[queryID].status = RemoteDataState.Done
    })
    .catch(error => {
      if (error.name === 'CancellationError' || error.name === 'AbortError') {
        if (queryID in queryReference) {
          queryReference[queryID].status = RemoteDataState.Done
        } else {
          queryReference[queryID] = {
            ...queryReference[queryID],
            status: RemoteDataState.Done,
          }
        }
        return
      }
      if (queryID in queryReference) {
        queryReference[queryID].status = RemoteDataState.Error
      } else {
        queryReference[queryID] = {
          ...queryReference[queryID],
          status: RemoteDataState.Error,
        }
      }
    })
}

export const timeMachineQueryErrorNotification = (
  results: RunQueryResult[],
  dispatch
) => {
  for (const result of results) {
    if (result.type === 'UNKNOWN_ERROR') {
      throw new Error(result.message)
    }

    if (result.type === 'RATE_LIMIT_ERROR') {
      dispatch(notify(rateLimitReached(result.retryAfter)))

      throw new Error(result.message)
    }

    if (result.didTruncate) {
      dispatch(notify(resultTooLarge(result.bytesRead)))
    }
  }
}

export const runTimeMachineQuery = (
  queryText: string,
  state: AppState,
  abortController: AbortController,
  processor = processResponse
) => {
  const allBuckets = getAll<Bucket>(state, ResourceType.Buckets)
  const allVariables = getAllVariables(state)

  event('executeQueries query', {}, {query: queryText})

  const orgID = getOrgIDFromBuckets(queryText, allBuckets) || getOrg(state).id
  if (getOrg(state).id === orgID) {
    event('orgData_queried')
  }

  const extern = buildUsedVarsOption(queryText, allVariables)
  event('runQuery', {context: 'timeMachine'})
  return runQuery(orgID, queryText, extern, abortController, processor)
}

export const executeQueries =
  (abortController?: AbortController) =>
  async (dispatch, getState: GetState) => {
    const executeQueriesStartTime = Date.now()

    const state = getState()

    const activeTimeMachine = getActiveTimeMachine(state)
    const queries = activeTimeMachine.view.properties.queries.filter(
      ({text}) => !!text.trim()
    )

    if (!queries.length) {
      dispatch(setQueryResults(RemoteDataState.Done, [], null))
    }

    try {
      // Cancel pending queries before issuing new ones
      cancelAllRunningQueries()

      dispatch(setQueryResults(RemoteDataState.Loading, [], null))

      await dispatch(hydrateVariables())
      const allVariables = getAllVariables(state)
      const allBuckets = getAll<Bucket>(state, ResourceType.Buckets)

      const startTime = window.performance.now()
      const startDate = Date.now()

      const pendingResults = queries.map(({text}) => {
        const orgID = getOrgIDFromBuckets(text, allBuckets) || getOrg(state).id

        const queryID = generateHashedQueryID(text, allVariables, orgID)
        if (isCurrentPageDashboard(state)) {
          // reset any existing matching query in the cache
          resetQueryCacheByQuery(text, allVariables)
          const result = getCachedResultsOrRunQuery(orgID, text, allVariables)
          setQueryByHashID(queryID, result)

          return result
        }
        return runTimeMachineQuery(text, state, abortController)
      })
      const results = await Promise.all(pendingResults.map(r => r.promise))

      const duration = window.performance.now() - startTime
      event('executeQueries querying', {time: startDate}, {duration})

      let statuses = [[]] as StatusRow[][]
      const {
        alertBuilder: {id: checkID},
      } = state

      if (checkID) {
        const extern = buildUsedVarsOption(
          queries.map(query => query.text),
          allVariables
        )
        pendingCheckStatuses = runStatusesQuery(
          getOrg(state).id,
          checkID,
          extern
        )
        statuses = await pendingCheckStatuses.promise
      }
      timeMachineQueryErrorNotification(results, dispatch)

      const files = (results as RunQuerySuccessResult[]).map(r => r.csv)
      dispatch(
        setQueryResults(RemoteDataState.Done, files, duration, null, statuses)
      )

      event(
        'executeQueries function',
        {
          time: executeQueriesStartTime,
        },
        {duration: Date.now() - executeQueriesStartTime}
      )

      return results
    } catch (error) {
      if (error.name === 'CancellationError' || error.name === 'AbortError') {
        dispatch(setQueryResults(RemoteDataState.Done, null, null))
        return
      }

      console.error(error)
      dispatch(
        setQueryResults(RemoteDataState.Error, null, null, error.message)
      )
    }
  }

export const DOWNLOAD_EVENT_COMPLETE = 'Download Complete'
export const runDownloadQuery =
  (abortController?: AbortController) =>
  async (dispatch, getState: GetState) => {
    const state = getState()
    const activeQueryText = getActiveQuery(state).text

    try {
      await dispatch(hydrateVariables())

      const result = await runTimeMachineQuery(
        activeQueryText,
        state,
        abortController,
        processResponseBlob
      ).promise
      if (result.type !== 'SUCCESS') {
        return timeMachineQueryErrorNotification([result], dispatch)
      }

      const formatter = createDateTimeFormatter('YYYY-MM-DD HH:mm')
      const now = formatter.format(new Date()).replace(/[:\s]+/gi, '_')
      const filename = `${now} InfluxDB Data`
      downloadBlob(result.csv as unknown as Blob, filename, '.csv')
    } catch (error) {
      console.error(error)
    }
    abortController.signal.dispatchEvent(new Event(DOWNLOAD_EVENT_COMPLETE))
  }

interface SaveDraftQueriesAction {
  type: 'SAVE_DRAFT_QUERIES'
}

const saveDraftQueries = (): SaveDraftQueriesAction => ({
  type: 'SAVE_DRAFT_QUERIES',
})

export const saveAndExecuteQueries =
  (abortController?: AbortController) => dispatch => {
    dispatch(saveDraftQueries())
    dispatch(setQueryResults(RemoteDataState.Loading, [], null))
    dispatch(executeQueries(abortController))
  }

export const executeCheckQuery = () => async (dispatch, getState: GetState) => {
  const state = getState()
  const {text} = getActiveQuery(state)
  const {id: orgID} = getOrg(state)

  if (text == '') {
    dispatch(setQueryResults(RemoteDataState.Done, [], null))
  }

  try {
    dispatch(setQueryResults(RemoteDataState.Loading, null, null, null))

    const startTime = Date.now()

    const extern = parse(
      'import "influxdata/influxdb/monitor"\noption monitor.write = yield'
    )

    const result = await runQuery(orgID, text, extern).promise
    const duration = Date.now() - startTime

    if (result.type !== 'SUCCESS') {
      return timeMachineQueryErrorNotification([result], dispatch)
    }

    const file = result.csv

    dispatch(setQueryResults(RemoteDataState.Done, [file], duration, null))
  } catch (e) {
    if (e.name === 'CancellationError') {
      return
    }

    console.error(e)
    dispatch(setQueryResults(RemoteDataState.Error, null, null, e.message))
  }
}
