// Libraries
import {parse} from 'src/external/parser'
import {get, sortBy} from 'lodash'

// API
import {runQuery, RunQuerySuccessResult} from 'src/shared/apis/query'
import {
  getCachedResultsOrRunQuery,
  resetQueryCacheByQuery,
} from 'src/shared/apis/queryCache'
import {runStatusesQuery} from 'src/alerting/utils/statusEvents'

// Actions
import {notify} from 'src/shared/actions/notifications'
import {hydrateVariables} from 'src/variables/actions/thunks'

// Constants
import {
  rateLimitReached,
  resultTooLarge,
  demoDataAvailability,
  updateAggregateType,
} from 'src/shared/copy/notifications'

// Utils
import {getActiveTimeMachine, getActiveQuery} from 'src/timeMachine/selectors'
import fromFlux from 'src/shared/utils/fromFlux'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getAllVariables, asAssignment} from 'src/variables/selectors'
import {buildVarsOption} from 'src/variables/utils/buildVarsOption'
import {findNodes} from 'src/shared/utils/ast'
import {
  isDemoDataAvailabilityError,
  demoDataErrorMessage,
} from 'src/cloud/utils/demoDataErrors'
import {isAggregateTypeError} from 'src/utils/aggregateTypeErrors'
import {event} from 'src/cloud/utils/reporting'
import {asSimplyKeyValueVariables, hashCode} from 'src/shared/apis/queryCache'
import {filterUnusedVarsBasedOnQuery} from 'src/shared/utils/filterUnusedVars'
import {
  getAggregateTypeErrorButton,
  getDemoDataErrorButton,
} from 'src/shared/components/notifications/NotificationButtons'

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
  NotificationButtonElement,
} from 'src/types'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {getAll} from 'src/resources/selectors/index'
import {isCurrentPageDashboard} from 'src/dashboards/selectors'

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
  const ast = parse(text)
  const bucketsInQuery: string[] = findNodes(ast, isFromBucket).map(node =>
    get(node, 'arguments.0.properties.0.value.value', '')
  )

  // if there are buckets from multiple orgs in a query, query will error, and user will receive error from query
  const bucketMatch = allBuckets.find(a => bucketsInQuery.includes(a.name))

  return get(bucketMatch, 'orgID', null)
}

// We only need a minimum of one bucket, function, and tag,
export const getQueryFromFlux = (text: string) => {
  const ast = parse(text)

  const aggregateWindowQuery: string[] = findNodes(
    ast,
    isFromFunction
  ).map(node =>
    get(node, 'arguments.0.properties.0.value.values.0.magnitude', '')
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
        queryReference[queryID].status = RemoteDataState.Done
        return
      }
      queryReference[queryID].status = RemoteDataState.Error
    })
}

export const executeQueries = (abortController?: AbortController) => async (
  dispatch,
  getState: GetState
) => {
  const executeQueriesStartTime = Date.now()

  const state = getState()

  const allBuckets = getAll<Bucket>(state, ResourceType.Buckets)

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

    const variableAssignments = allVariables
      .map(v => asAssignment(v))
      .filter(v => !!v)

    const startTime = window.performance.now()
    const startDate = Date.now()

    const pendingResults = queries.map(({text}) => {
      event('executeQueries query', {}, {query: text})
      const orgID = getOrgIDFromBuckets(text, allBuckets) || getOrg(state).id

      if (getOrg(state).id === orgID) {
        event('orgData_queried')
      } else {
        event('demoData_queried')
      }

      const extern = buildVarsOption(variableAssignments)

      event('runQuery', {context: 'timeMachine'})

      const queryID = generateHashedQueryID(text, allVariables, orgID)
      if (isCurrentPageDashboard(state)) {
        // reset any existing matching query in the cache
        resetQueryCacheByQuery(text)
        const result = getCachedResultsOrRunQuery(
          orgID,
          text,
          getAllVariables(state)
        )
        setQueryByHashID(queryID, result)

        return result
      }
      const result = runQuery(orgID, text, extern, abortController)
      setQueryByHashID(queryID, result)
      return result
    })
    const results = await Promise.all(pendingResults.map(r => r.promise))

    const duration = window.performance.now() - startTime

    event('executeQueries querying', {time: startDate}, {duration})

    let statuses = [[]] as StatusRow[][]
    const {
      alertBuilder: {id: checkID},
    } = state

    if (checkID) {
      const extern = buildVarsOption(variableAssignments)
      pendingCheckStatuses = runStatusesQuery(getOrg(state).id, checkID, extern)
      statuses = await pendingCheckStatuses.promise
    }

    for (const result of results) {
      if (result.type === 'UNKNOWN_ERROR') {
        if (isDemoDataAvailabilityError(result.code, result.message)) {
          const message = demoDataErrorMessage()
          const buttonElement: NotificationButtonElement = onDismiss =>
            getDemoDataErrorButton(onDismiss)
          dispatch(notify(demoDataAvailability(message, buttonElement)))
        }
        if (
          isAggregateTypeError(result.code, result.message) &&
          state.currentExplorer.isAutoFunction
        ) {
          const message = `It looks like you're trying to apply a number-based aggregate function to a string, which cannot be processed. You can fix this by selecting the Aggregate Function "Last"`
          const buttonElement: NotificationButtonElement = onDismiss =>
            getAggregateTypeErrorButton(onDismiss)
          dispatch(notify(updateAggregateType(message, buttonElement)))
        }

        throw new Error(result.message)
      }

      if (result.type === 'RATE_LIMIT_ERROR') {
        dispatch(notify(rateLimitReached(result.retryAfter)))

        throw new Error(result.message)
      }

      if (result.didTruncate) {
        dispatch(notify(resultTooLarge(result.bytesRead)))
      }

      if (isFlagEnabled('fluxParser')) {
        // TODO: this is just here for validation. since we are already eating
        // the cost of parsing the results, we should store the output instead
        // of the raw input
        fromFlux(result.csv)
      }
    }

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
    dispatch(setQueryResults(RemoteDataState.Error, null, null, error.message))
  }
}

interface SaveDraftQueriesAction {
  type: 'SAVE_DRAFT_QUERIES'
}

const saveDraftQueries = (): SaveDraftQueriesAction => ({
  type: 'SAVE_DRAFT_QUERIES',
})

export const saveAndExecuteQueries = (
  abortController?: AbortController
) => dispatch => {
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

    if (isFlagEnabled('fluxParser')) {
      // TODO: this is just here for validation. since we are already eating
      // the cost of parsing the results, we should store the output instead
      // of the raw input
      fromFlux(result.csv)
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
