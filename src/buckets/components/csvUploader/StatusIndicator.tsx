// Libraries
import React, {FC} from 'react'
import cn from 'classnames'

// Components
import {SparkleSpinner} from '@influxdata/clockface'

// Types
import {RemoteDataState} from 'src/types'

const getStatusText = (s, writeError) => {
  let status = ''
  let message = ''
  switch (s) {
    case RemoteDataState.Loading:
      status = 'Loading...'
      message = 'Just a moment'
      break
    case RemoteDataState.Done:
      status = 'Data Written Successfully'
      message = 'Hooray!'
      break
    case RemoteDataState.Error:
      status = 'Unable to Write Data'
      message = `${writeError}`
      break
  }

  return {
    status,
    message,
  }
}

const className = status =>
  cn(`line-protocol--status`, {
    loading: status === RemoteDataState.Loading,
    success: status === RemoteDataState.Done,
    error: status === RemoteDataState.Error,
  })

interface Props {
  uploadError: string
  uploadState: RemoteDataState
}
const StatusIndicator: FC<Props> = ({uploadError, uploadState}) => {
  let testID = ''

  switch (uploadState) {
    case RemoteDataState.Done:
      testID = 'success'
      break
    case RemoteDataState.Loading:
      testID = 'loading'
      break
    case RemoteDataState.Error:
      testID = 'error'
      break
    default:
      testID = ''
  }

  return (
    <div
      className="line-protocol--spinner"
      data-testid={`csv-uploader--${testID}`}
    >
      <p data-testid="line-protocol--status" className={className(status)}>
        {getStatusText(uploadState, uploadError).status}
      </p>
      <SparkleSpinner loading={uploadState} sizePixels={220} />
      <p className={className(status)}>
        {getStatusText(uploadState, uploadError).message}
      </p>
    </div>
  )
}

export default StatusIndicator
