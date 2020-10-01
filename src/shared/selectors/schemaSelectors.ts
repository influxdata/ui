// Types
import {AppState} from 'src/types'
import {BucketSchema} from 'src/shared/reducers/schema'

export const getSchemaByBucketName = (
  state: AppState,
  bucketName: string
): BucketSchema | null => {
  return state.flow.schema[bucketName] || null
}
