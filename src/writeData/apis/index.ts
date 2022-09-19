// Utils
import {getErrorMessage} from 'src/utils/api'
import {runQuery} from 'src/shared/apis/query'

// Types
import {RemoteDataState} from 'src/types'

export const handleRunQuery = async (
  orgID: string,
  query: string,
  extern: any,
  controller: AbortController,
  setUploadState: (RemoteDataState: RemoteDataState) => void,
  setUploadError: (string: string) => void
): Promise<void> => {
  const response = await runQuery(orgID, query, extern, controller).promise

  if (response.type === 'SUCCESS') {
    setUploadState(RemoteDataState.Done)
    return
  }
  if (response.type === 'RATE_LIMIT_ERROR') {
    setUploadState(RemoteDataState.Error)
    setUploadError('Failed due to plan limits: read cardinality reached')
    return
  }
  if (response.type === 'UNKNOWN_ERROR') {
    const error = getErrorMessage(response)
    throw new Error(error)
  }
}
