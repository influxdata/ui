// Types
import {RemoteDataState, Filter, CustomTimeRange} from 'src/types'
import {Action as NotifyAction} from 'src/shared/actions/notifications'

export type Action =
  | DeleteFilter
  | ResetFilters
  | SetBucketName
  | SetDeletionStatus
  | SetFiles
  | SetFilter
  | SetIsSerious
  | SetKeysByBucket
  | SetPredicateToDefault
  | SetPreviewStatus
  | SetTimeRange
  | SetValuesByKey
  | NotifyAction

interface DeleteFilter {
  type: 'DELETE_FILTER'
  payload: {index: number}
}

export const deleteFilter = (index: number): DeleteFilter => ({
  type: 'DELETE_FILTER',
  payload: {index},
})

interface ResetFilters {
  type: 'RESET_FILTERS'
}

export const resetFilters = (): ResetFilters => ({
  type: 'RESET_FILTERS',
})

interface SetPredicateToDefault {
  type: 'SET_PREDICATE_DEFAULT'
}

export const resetPredicateState = (): SetPredicateToDefault => ({
  type: 'SET_PREDICATE_DEFAULT',
})

interface SetBucketName {
  type: 'SET_BUCKET_NAME'
  payload: {bucketName: string}
}

export const setBucketName = (bucketName: string): SetBucketName => ({
  type: 'SET_BUCKET_NAME',
  payload: {bucketName},
})

interface SetDeletionStatus {
  type: 'SET_DELETION_STATUS'
  payload: {deletionStatus: RemoteDataState}
}

export const setDeletionStatus = (
  status: RemoteDataState
): SetDeletionStatus => ({
  type: 'SET_DELETION_STATUS',
  payload: {deletionStatus: status},
})

interface SetFiles {
  type: 'SET_FILES'
  payload: {files: string[]}
}

export const setFiles = (files: string[]): SetFiles => ({
  type: 'SET_FILES',
  payload: {files},
})

interface SetFilter {
  type: 'SET_FILTER'
  payload: {
    filter: Filter
    index: number
  }
}

export const setFilter = (filter: Filter, index: number): SetFilter => ({
  type: 'SET_FILTER',
  payload: {filter, index},
})

interface SetIsSerious {
  type: 'SET_IS_SERIOUS'
  payload: {isSerious: boolean}
}

export const setIsSerious = (isSerious: boolean): SetIsSerious => ({
  type: 'SET_IS_SERIOUS',
  payload: {isSerious},
})

interface SetPreviewStatus {
  type: 'SET_PREVIEW_STATUS'
  payload: {previewStatus: RemoteDataState}
}

export const setPreviewStatus = (
  status: RemoteDataState
): SetPreviewStatus => ({
  type: 'SET_PREVIEW_STATUS',
  payload: {previewStatus: status},
})

interface SetTimeRange {
  type: 'SET_DELETE_TIME_RANGE'
  payload: {timeRange: CustomTimeRange}
}

export const setTimeRange = (timeRange: CustomTimeRange): SetTimeRange => ({
  type: 'SET_DELETE_TIME_RANGE',
  payload: {timeRange},
})

interface SetValuesByKey {
  type: 'SET_VALUES_BY_KEY'
  payload: {values: string[]}
}

export const setValues = (values: string[]): SetValuesByKey => ({
  type: 'SET_VALUES_BY_KEY',
  payload: {values},
})

interface SetKeysByBucket {
  type: 'SET_KEYS_BY_BUCKET'
  payload: {keys: string[]}
}

export const setKeys = (keys: string[]): SetKeysByBucket => ({
  type: 'SET_KEYS_BY_BUCKET',
  payload: {keys},
})
