// Libraries
import React, {FC} from 'react'

const CsvUploaderHelperText: FC<{}> = () => {
  return (
    <p>
      Need help writing InfluxDB Annotated CSV ?{' '}
      <a
        href="https://docs.influxdata.com/influxdb/v2.0/reference/syntax/annotated-csv/"
        target="_blank"
        rel="noreferrer"
      >
        See Documentation
      </a>
    </p>
  )
}

export default CsvUploaderHelperText
