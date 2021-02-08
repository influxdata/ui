// Libraries
import React from 'react'

// Types
import {ErrorMessageComponent} from 'src/types'
import {GIT_SHA} from 'src/shared/constants'

const DefaultErrorMessage: ErrorMessageComponent = () => {
  const SHA_PARAM: string = `Version=${GIT_SHA}`
  return (
    <p
      className="default-error-message"
      style={{display: 'flex', placeContent: 'center'}}
    >
      An InfluxDB error has occurred. Please report the issue&nbsp;
      <a
        href={`https://github.com/influxdata/ui/issues/new?template=bug_report.md&title=${SHA_PARAM}`}
      >
        here
      </a>
      .
    </p>
  )
}

export default DefaultErrorMessage
