// Libraries
import React from 'react'

// Types
import {ErrorMessageComponent} from 'src/types'

import {SafeBlankLink} from 'src/utils/SafeBlankLink'

const DefaultErrorMessage: ErrorMessageComponent = () => {
  return (
    <p
      className="default-error-message"
      style={{display: 'flex', placeContent: 'center'}}
    >
      An InfluxDB error has occurred. Please report the issue&nbsp;
      <SafeBlankLink href="https://github.com/influxdata/ui/issues/new?template=bug_report.md">
        here
      </SafeBlankLink>
      .
    </p>
  )
}

export default DefaultErrorMessage
