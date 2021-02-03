import React from 'react'
import {SparkleSpinner} from '@influxdata/clockface'
import {RemoteDataState} from 'src/types'

const CsvUploaderSuccess = () => (
  <div className="line-protocol--spinner" data-testid="csv-uploader--success">
    <p
      data-testid="line-protocol--status"
      className="line-protocol--status done"
    >
      Data Written Successfully
    </p>
    <SparkleSpinner loading={RemoteDataState.Done} sizePixels={220} />
    <p className="line-protocol--status done">Hooray!</p>
  </div>
)

export default CsvUploaderSuccess
