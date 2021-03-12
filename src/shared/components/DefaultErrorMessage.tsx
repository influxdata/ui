// Libraries
import React from 'react'

// Types
import {ErrorMessageComponent} from 'src/types'

const DefaultErrorMessage: ErrorMessageComponent = () => {
  return (
    <p
      className="default-error-message"
      style={{display: 'flex', placeContent: 'center'}}
    >
      An InfluxDB error has occurred. Please report the issue&nbsp;
      <a href="https://github.com/influxdata/ui/issues/new?template=bug_report.md">
        here
      </a>
      .
    </p>
  )
}

export default DefaultErrorMessage
