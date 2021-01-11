import React, {Component} from 'react'
import {Alert, ComponentColor, IconFont} from '@influxdata/clockface'

class AlertStatusCancelled extends Component {
  render() {
    return (
      <Alert
        color={ComponentColor.Danger}
        icon={IconFont.AlertTriangle}
        className="padded-alert"
      >
        {this.messageText()}
      </Alert>
    )
  }

  messageText() {
    // TODO(ariel): figure out what isOperator is
    // const {isOperator} = this.props

    // if (isOperator) {
    //   return 'This account has been cancelled'
    // }

    return 'Hey there, it looks like your account has been cancelled. Please contact support at support@influxdata.com to extract data from your buckets.'
  }
}
export default AlertStatusCancelled
