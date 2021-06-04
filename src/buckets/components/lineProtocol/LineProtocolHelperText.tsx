// Libraries
import React, {FC} from 'react'

const LineProtocolHelperText: FC<{}> = () => {
  return (
    <p>
      Need help writing InfluxDB Line Protocol?{' '}
      <a
        href="https://docs.influxdata.com/influxdb/cloud/reference/syntax/line-protocol/"
        target="_blank"
      >
        See Documentation
      </a>
    </p>
  )
}

export default LineProtocolHelperText
