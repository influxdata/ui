import React from 'react'
import {SparkleSpinner} from '@influxdata/clockface'
import {RemoteDataState} from 'src/types'

const CsvUploaderError = () => (
  <div className="line-protocol--spinner" data-testid="csv-uploader--error">
    <p
      data-testid="line-protocol--status"
      className="line-protocol--status error"
    >
      Failed to Write Data
    </p>
    <SparkleSpinner loading={RemoteDataState.Error} sizePixels={220} />
    <p className="line-protocol--status error">
      Please make sure that CSV was in
      <a
        target="_blank"
        href="https://docs.influxdata.com/influxdb/v2.0/write-data/developer-tools/csv/#csv-annotations"
      >
        &nbsp;Annotated Format&nbsp;
      </a>
      and try again
    </p>
  </div>
)

export default CsvUploaderError
