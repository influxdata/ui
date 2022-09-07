import {Dispatch} from 'react'
import {get} from 'lodash'

import {queryBuilderFetcher} from 'src/timeMachine/apis/QueryBuilderFetcher'

// Utils
import {event} from 'src/cloud/utils/reporting'

// API
import {fetchAllBuckets} from 'src/buckets/api'

// Types
import {
  Bucket,
  GetState,
  RemoteDataState,
  ResourceType,
  NotificationAction,
} from 'src/types'
import {
  Action as AlertBuilderAction,
  setEvery,
} from 'src/alerting/actions/alertBuilder'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {getAll} from 'src/resources/selectors'
import {getStatus} from 'src/resources/selectors'
import {getTimeRangeWithTimezone} from 'src/dashboards/selectors'
import {
  getActiveQuery,
  getActiveTimeMachine,
  getWindowPeriodFromTimeRange,
} from 'src/timeMachine/selectors'

// Actions
import {editActiveQueryWithBuilderSync} from 'src/timeMachine/actions'
import {
  Action,
  addTagSelectorSync,
  removeTagSelectorSync,
  setAggregateWindow,
  setBuilderBucket,
  setBuilderBuckets,
  setBuilderBucketsStatus,
  setBuilderTagKeys,
  setBuilderTagKeySelection,
  setBuilderTagKeysStatus,
  setBuilderTagsStatus,
  setBuilderTagValues,
  setBuilderTagValuesSelection,
  setBuilderTagValuesStatus,
  setFunctions,
} from 'src/timeMachine/actions/queryBuilder'
import {setBuckets} from 'src/buckets/actions/creators'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Constants
import {AGG_WINDOW_AUTO} from 'src/timeMachine/constants/queryBuilder'
import {CLOUD} from 'src/shared/constants'

export const removeTagSelector = (index: number) => (
  dispatch: Dispatch<Action>
) => {
  queryBuilderFetcher.cancelFindValues(index)
  queryBuilderFetcher.cancelFindKeys(index)

  dispatch(removeTagSelectorSync(index))
  dispatch(loadTagSelector(index))
}

const loadTagSelectorValues = (index: number) => async (
  dispatch: Dispatch<Action | ReturnType<typeof loadTagSelector>>,
  getState: GetState
) => {
  const startTime = Date.now()

  const state = getState()
  const {buckets, tags} = getActiveQuery(state).builderConfig
  const tagsSelections = tags.slice(0, index)

  if (!buckets[0]) {
    return
  }

  const bucket = buckets[0]

  const allBuckets = getAll<Bucket>(state, ResourceType.Buckets)
  const foundBucket = allBuckets.find(b => b.name === bucket)
  const orgID = get(foundBucket, 'orgID', getOrg(getState()).id)

  dispatch(setBuilderTagValuesStatus(index, RemoteDataState.Loading))

  try {
    const timeRange = getTimeRangeWithTimezone(state)
    const key = getActiveQuery(getState()).builderConfig.tags[index].key
    const searchTerm =
      getActiveTimeMachine(getState()).queryBuilder.tags[index]
        ?.valuesSearchTerm ?? ''

    const values = await queryBuilderFetcher.findValues(index, {
      url: '/api/v2/query',
      orgID,
      bucket,
      tagsSelections,
      key,
      searchTerm,
      timeRange,
    })

    const {values: selectedValues} = tags[index]

    for (const selectedValue of selectedValues) {
      // Even if the selected values didn't come back in the results, let them
      // be selected anyway
      if (!values.includes(selectedValue)) {
        values.unshift(selectedValue)
      }
    }

    dispatch(setBuilderTagValues(index, values))
    dispatch(loadTagSelector(index + 1))
    event(
      'loadTagSelectorValues function',
      {
        time: startTime,
      },
      {duration: Date.now() - startTime}
    )
  } catch (e) {
    if (e.name === 'CancellationError') {
      return
    }

    console.error(e)
    dispatch(setBuilderTagValuesStatus(index, RemoteDataState.Error))
  }
}

export const loadTagSelector = (index: number) => async (
  dispatch: Dispatch<Action | ReturnType<typeof loadTagSelectorValues>>,
  getState: GetState
) => {
  const startTime = Date.now()

  const {buckets, tags} = getActiveQuery(getState()).builderConfig

  if (!tags[index] || !buckets[0]) {
    return
  }

  dispatch(setBuilderTagKeysStatus(index, RemoteDataState.Loading))

  const state = getState()
  const tagsSelections = tags.slice(0, index)

  const bucket = buckets[0]

  const allBuckets = getAll<Bucket>(getState(), ResourceType.Buckets)
  const foundBucket = allBuckets.find(b => b.name === bucket)

  const orgID = get(foundBucket, 'orgID', getOrg(getState()).id)

  try {
    const timeRange = getTimeRangeWithTimezone(state)

    const searchTerm =
      getActiveTimeMachine(state).queryBuilder.tags[index]?.keysSearchTerm ?? ''

    const keys = await queryBuilderFetcher.findKeys(index, {
      url: '/api/v2/query',
      orgID,
      bucket,
      tagsSelections,
      searchTerm,
      timeRange,
    })

    const {key} = tags[index]

    if (!key) {
      let defaultKey: string

      if (index === 0 && keys.includes('_measurement')) {
        defaultKey = '_measurement'
      } else {
        defaultKey = keys[0]
      }

      dispatch(setBuilderTagKeySelection(index, defaultKey))
    } else if (!keys.includes(key)) {
      // Even if the selected key didn't come back in the results, let it be
      // selected anyway
      keys.unshift(key)
    }

    dispatch(setBuilderTagKeys(index, keys))
    dispatch(loadTagSelectorValues(index))
    event(
      'loadTagSelector function',
      {
        time: startTime,
      },
      {duration: Date.now() - startTime}
    )
  } catch (e) {
    if (e.name === 'CancellationError') {
      return
    }

    console.error(e)
    dispatch(setBuilderTagKeysStatus(index, RemoteDataState.Error))
  }
}

export const loadBuckets = () => async (
  dispatch: Dispatch<
    Action | ReturnType<typeof selectBucket> | ReturnType<typeof setBuckets>
  >,
  getState: GetState
) => {
  if (
    getStatus(getState(), ResourceType.Buckets) === RemoteDataState.NotStarted
  ) {
    dispatch(setBuckets(RemoteDataState.Loading))
  }
  const startTime = Date.now()
  const orgID = getOrg(getState()).id
  dispatch(setBuilderBucketsStatus(RemoteDataState.Loading))

  let bucketsResponse
  try {
    if (CLOUD) {
      // a limit of -1 means fetch all buckets for this org
      bucketsResponse = await fetchAllBuckets(orgID, -1)
    } else {
      bucketsResponse = await fetchAllBuckets(orgID)
    }

    dispatch(
      setBuckets(RemoteDataState.Done, bucketsResponse.normalizedBuckets)
    )

    const allBuckets = bucketsResponse.buckets.map(b => b.name)

    const systemBuckets = allBuckets.filter(b => b.startsWith('_'))
    const userBuckets = allBuckets.filter(b => !b.startsWith('_'))
    const buckets = [...userBuckets, ...systemBuckets]

    const selectedBucket = getActiveQuery(getState()).builderConfig.buckets[0]

    dispatch(setBuilderBuckets(buckets))

    if (selectedBucket && buckets.includes(selectedBucket)) {
      dispatch(selectBucket(selectedBucket))
    } else {
      dispatch(selectBucket(buckets[0], true))
    }
    event(
      'loadBuckets function',
      {
        time: startTime,
      },
      {duration: Date.now() - startTime}
    )
  } catch (e) {
    if (e.name === 'CancellationError') {
      return
    }

    console.error(e)
    dispatch(setBuilderBucketsStatus(RemoteDataState.Error))
  }
}

export const setWindowPeriodSelectionMode = (mode: 'custom' | 'auto') => (
  dispatch: Dispatch<Action | AlertBuilderAction>,
  getState: GetState
) => {
  if (mode === 'custom') {
    const windowPeriod = getWindowPeriodFromTimeRange(getState())

    dispatch(setAggregateWindow(windowPeriod))
  }
  if (mode === 'auto') {
    dispatch(setAggregateWindow(AGG_WINDOW_AUTO))
  }
}

export const selectAggregateWindow = (period: string) => (
  dispatch: Dispatch<Action | AlertBuilderAction>
) => {
  dispatch(setAggregateWindow(period))
  dispatch(setEvery(period))
}

export const selectBucket = (
  bucket: string,
  resetSelections: boolean = false
) => (dispatch: Dispatch<Action | ReturnType<typeof loadTagSelector>>) => {
  dispatch(setBuilderBucket(bucket, resetSelections))
  dispatch(loadTagSelector(0))
}

export const selectTagValue = (index: number, value: string) => (
  dispatch: Dispatch<Action | ReturnType<typeof addTagSelector>>,
  getState: GetState
) => {
  const state = getState()
  const {
    timeMachines: {activeTimeMachineID},
  } = state
  const tags = getActiveQuery(state).builderConfig.tags
  const currentTag = tags[index]
  const values = currentTag.values

  let newValues: string[]

  if (values.includes(value)) {
    newValues = values.filter(v => v !== value)
  } else if (
    activeTimeMachineID === 'alerting' &&
    currentTag.key === '_field'
  ) {
    newValues = [value]
  } else if (
    isFlagEnabled('newQueryBuilder') &&
    index === 0 &&
    !isFlagEnabled('measurementMultiselect')
  ) {
    newValues = [value]
  } else {
    newValues = [...values, value]
  }

  if (newValues.length === 0 && index === 0) {
    dispatch(removeTagSelector(index + 1))
  }
  dispatch(setBuilderTagValuesSelection(index, newValues))

  // don't add a new tag filter if we're grouping
  if (currentTag.aggregateFunctionType === 'group') {
    return
  }

  if (index === tags.length - 1 && newValues.length) {
    dispatch(addTagSelector())
  } else {
    dispatch(loadTagSelector(index + 1))
  }
}

export const multiSelectBuilderFunction = (name: string) => (
  dispatch: Dispatch<Action | NotificationAction>,
  getState: GetState
) => {
  const {draftQueries, activeQueryIndex} = getActiveTimeMachine(getState())
  const functions = draftQueries[activeQueryIndex].builderConfig.functions

  const functionNames = functions.map(f => f.name)
  const clickedFunctionAlreadySelected = functionNames.includes(name)

  if (!clickedFunctionAlreadySelected) {
    // add clicked to selected
    dispatch(setFunctions([...functionNames, name]))
  } else {
    dispatch(setFunctions(functionNames.filter(n => n != name)))
  }
}

export const singleSelectBuilderFunction = (name: string) => (
  dispatch: Dispatch<Action>,
  getState: GetState
) => {
  const {draftQueries, activeQueryIndex} = getActiveTimeMachine(getState())
  const functions = draftQueries[activeQueryIndex].builderConfig.functions

  const functionNames = functions.map(f => f.name)
  const clickedFunctionAlreadySelected = functionNames.includes(name)

  if (!clickedFunctionAlreadySelected) {
    // select clicked function
    dispatch(setFunctions([name]))
  } else {
    if (functions.length > 1) {
      // if more than one function is selected, remove clicked from selected
      dispatch(setFunctions(functionNames.filter(n => n != name)))
    }
  }
}

export const selectTagKey = (index: number, key: string) => (
  dispatch: Dispatch<Action>
) => {
  dispatch(setBuilderTagKeySelection(index, key))
  dispatch(loadTagSelectorValues(index))
}

export const searchTagValues = (index: number) => (
  dispatch: Dispatch<Action>
) => {
  dispatch(loadTagSelectorValues(index))
}

export const searchTagKeys = (index: number) => (
  dispatch: Dispatch<Action>
) => {
  dispatch(loadTagSelector(index))
}

export const addTagSelector = () => (
  dispatch: Dispatch<Action>,
  getState: GetState
) => {
  dispatch(addTagSelectorSync())

  const newIndex = getActiveQuery(getState()).builderConfig.tags.length - 1

  dispatch(loadTagSelector(newIndex))
}

export const reloadTagSelectors = () => (dispatch: Dispatch<Action>) => {
  dispatch(setBuilderTagsStatus(RemoteDataState.Loading))
  dispatch(loadTagSelector(0))
}

export const setBuilderBucketIfExists = (bucketName: string) => (
  dispatch: Dispatch<
    Action | ReturnType<typeof editActiveQueryWithBuilderSync>
  >,
  getState: GetState
) => {
  const buckets = getAll<Bucket>(getState(), ResourceType.Buckets)
  if (buckets.find(b => b.name === bucketName)) {
    dispatch(editActiveQueryWithBuilderSync())
    dispatch(setBuilderBucket(bucketName, true))
  }
}
