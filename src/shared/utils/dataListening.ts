// Utils
import {runQuery} from 'src/shared/apis/query'
import {LoadingState} from 'src/shared/components/DataListening/ConnectionInformation'

// Types
import {RunQueryResponse} from 'src/types/queries'

export const TIMEOUT_MILLISECONDS = 60000
export const TIMER_WAIT = 1000

export const continuouslyCheckForData = (orgID, bucket, updateResponse) => {
  const startTime = Date.now()

  const intervalId = setInterval(() => {
    checkForData(orgID, bucket)
      .then(value => {
        if (value === LoadingState.Done) {
          updateResponse(LoadingState.Done)
          clearInterval(intervalId)
          return
        }
        if (value === LoadingState.Error) {
          updateResponse(LoadingState.Error)
          clearInterval(intervalId)
        }
        const timePassed = Date.now() - startTime
        if (timePassed > TIMEOUT_MILLISECONDS) {
          updateResponse(LoadingState.NotFound)
          clearInterval(intervalId)
        }
      })
      .catch(() => {
        updateResponse(LoadingState.Error)
        clearInterval(intervalId)
      })
  }, TIMER_WAIT)

  return intervalId
}

export const checkForData = async (orgID, bucket): Promise<LoadingState> => {
  const script = `from(bucket: "${bucket}")
      |> range(start: -1h)`

  try {
    const result = await runQuery(orgID, script).promise

    if (result.type !== RunQueryResponse.SUCCESS) {
      throw new Error(result.message)
    }

    // if the bucket is empty, the CSV returned is '\r\n' which has a length of 2
    // so instead,  we check for the trimmed version.
    const responseLength = result.csv.trim().length

    if (responseLength > 1) {
      return LoadingState.Done
    }
  } catch {
    return LoadingState.Error
  }

  return LoadingState.NotFound
}
