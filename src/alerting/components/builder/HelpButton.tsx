// Libraries
import React, {FunctionComponent} from 'react'

// Components
import {Button} from '@influxdata/clockface'

// Constants
import {DOCS_URL_VERSION} from 'src/shared/constants/fluxFunctions'

const HelpButton: FunctionComponent = () => {
  const handleClick = () => {
    const newTab = window.open(
      `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/monitor-alert/checks/create/#configure-the-check`
    )
    newTab.focus()
  }

  return (
    <Button
      titleText="Learn more about alerting"
      text="Help"
      onClick={handleClick}
    />
  )
}

export default HelpButton
