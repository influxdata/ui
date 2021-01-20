import React from 'react'
import {SparkleSpinner} from '@influxdata/clockface'
import {RemoteDataState} from 'src/types'

const CsvUploaderError = () => (
  <div className="line-protocol--spinner">
    <p
      data-testid="line-protocol--status"
      className="line-protocol--status error"
    >
      Failed to Write Data
    </p>
    <SparkleSpinner loading={RemoteDataState.Error} sizePixels={220} />
    <p className="line-protocol--status error">
      Make sure your CSV is properly formatted and try again
    </p>
  </div>
)

export default CsvUploaderError
