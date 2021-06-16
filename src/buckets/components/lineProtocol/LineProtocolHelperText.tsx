// Libraries
import React, {FC} from 'react'

// Constants
import {DOCS_URL_VERSION} from 'src/shared/constants/fluxFunctions'

const LineProtocolHelperText: FC<{}> = () => {
  return (
    <p>
      Need help writing InfluxDB Line Protocol?{' '}
      <a
        href={`https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/syntax/line-protocol/`}
        target="_blank"
      >
        See Documentation
      </a>
    </p>
  )
}

export default LineProtocolHelperText
