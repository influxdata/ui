// Types
import {BuilderAggregateFunctionType, RemoteDataState} from 'src/types'

export type Action =
  | ReturnType<typeof setBuilderAggregateFunctionType>
  | ReturnType<typeof setBuilderBucket>
  | ReturnType<typeof setBuilderBuckets>
  | ReturnType<typeof setBuilderBucketsStatus>
  | ReturnType<typeof setBuilderTagKeys>
  | ReturnType<typeof setBuilderTagKeysStatus>
  | ReturnType<typeof setBuilderTagValues>
  | ReturnType<typeof setBuilderTagValuesStatus>
  | ReturnType<typeof setBuilderTagKeySelection>
  | ReturnType<typeof setBuilderTagValuesSelection>
  | ReturnType<typeof addTagSelectorSync>
  | ReturnType<typeof removeTagSelectorSync>
  | ReturnType<typeof setFunctions>
  | ReturnType<typeof setAggregateWindow>
  | ReturnType<typeof setAggregateFillValues>
  | ReturnType<typeof setValuesSearchTerm>
  | ReturnType<typeof setKeysSearchTerm>
  | ReturnType<typeof setBuilderTagsStatus>

export const setBuilderAggregateFunctionType = (
  builderAggregateFunctionType: BuilderAggregateFunctionType,
  index: number
) => ({
  type: 'SET_BUILDER_AGGREGATE_FUNCTION_TYPE' as 'SET_BUILDER_AGGREGATE_FUNCTION_TYPE',
  payload: {builderAggregateFunctionType, index},
})

export const setBuilderBucketsStatus = (bucketsStatus: RemoteDataState) => ({
  type: 'SET_BUILDER_BUCKETS_STATUS' as 'SET_BUILDER_BUCKETS_STATUS',
  payload: {bucketsStatus},
})

export const setBuilderBuckets = (buckets: string[]) => ({
  type: 'SET_BUILDER_BUCKETS' as 'SET_BUILDER_BUCKETS',
  payload: {buckets},
})

export const setBuilderBucket = (bucket: string, resetSelections: boolean) => ({
  type: 'SET_BUILDER_BUCKET_SELECTION' as 'SET_BUILDER_BUCKET_SELECTION',
  payload: {bucket, resetSelections},
})

export const setBuilderTagsStatus = (status: RemoteDataState) => ({
  type: 'SET_BUILDER_TAGS_STATUS' as 'SET_BUILDER_TAGS_STATUS',
  payload: {status},
})

export const setBuilderTagKeys = (index: number, keys: string[]) => ({
  type: 'SET_BUILDER_TAG_KEYS' as 'SET_BUILDER_TAG_KEYS',
  payload: {index, keys},
})

export const setBuilderTagKeysStatus = (
  index: number,
  status: RemoteDataState
) => ({
  type: 'SET_BUILDER_TAG_KEYS_STATUS' as 'SET_BUILDER_TAG_KEYS_STATUS',
  payload: {index, status},
})

export const setBuilderTagValues = (index: number, values: string[]) => ({
  type: 'SET_BUILDER_TAG_VALUES' as 'SET_BUILDER_TAG_VALUES',
  payload: {index, values},
})

export const setBuilderTagValuesStatus = (
  index: number,
  status: RemoteDataState
) => ({
  type: 'SET_BUILDER_TAG_VALUES_STATUS' as 'SET_BUILDER_TAG_VALUES_STATUS',
  payload: {index, status},
})

export const setBuilderTagKeySelection = (index: number, key: string) => ({
  type: 'SET_BUILDER_TAG_KEY_SELECTION' as 'SET_BUILDER_TAG_KEY_SELECTION',
  payload: {index, key},
})

export const setBuilderTagValuesSelection = (
  index: number,
  values: string[]
) => ({
  type: 'SET_BUILDER_TAG_VALUES_SELECTION' as 'SET_BUILDER_TAG_VALUES_SELECTION',
  payload: {index, values},
})

export const addTagSelectorSync = () => ({
  type: 'ADD_TAG_SELECTOR' as 'ADD_TAG_SELECTOR',
})

export const removeTagSelectorSync = (index: number) => ({
  type: 'REMOVE_TAG_SELECTOR' as 'REMOVE_TAG_SELECTOR',
  payload: {index},
})

export const setFunctions = (functions: string[]) => ({
  type: 'SELECT_BUILDER_FUNCTION' as 'SELECT_BUILDER_FUNCTION',
  payload: {functions},
})

export const setAggregateWindow = (period: string) => ({
  type: 'SET_AGGREGATE_WINDOW' as 'SET_AGGREGATE_WINDOW',
  payload: {period},
})

export const setAggregateFillValues = (fillValues: boolean) => ({
  type: 'SET_AGGREGATE_FILL_VALUES' as 'SET_AGGREGATE_FILL_VALUES',
  payload: {fillValues},
})

export const setValuesSearchTerm = (index: number, searchTerm: string) => ({
  type: 'SET_BUILDER_VALUES_SEARCH_TERM' as 'SET_BUILDER_VALUES_SEARCH_TERM',
  payload: {index, searchTerm},
})

export const setKeysSearchTerm = (index: number, searchTerm: string) => ({
  type: 'SET_BUILDER_KEYS_SEARCH_TERM' as 'SET_BUILDER_KEYS_SEARCH_TERM',
  payload: {index, searchTerm},
})
