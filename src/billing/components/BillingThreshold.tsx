import React, {Component} from 'react'

import {
  Input,
  Button,
  ReflessPopover,
  PopoverPosition,
} from '@influxdata/clockface'

class BillingThreshold extends Component {
  render() {
    const {
      isNotifyActive,
      balanceThreshold,
      onNotify,
      onBalanceThreshold,
      notifyEmail,
      onEmailChange,
    } = this.props

    if (isNotifyActive) {
      return (
        <>
          <ReflessPopover
            position={PopoverPosition.Above}
            contents={() => (
              <Button onClick={onNotify} text="Do not notify me" />
            )}
          >
            <strong>
              <a href="#">Notify me&nbsp;</a>
            </strong>
          </ReflessPopover>
          <span>via&nbsp;</span>
          <ReflessPopover
            position={PopoverPosition.Above}
            contents={() => (
              <Input
                type="email"
                onChange={onEmailChange}
                value={notifyEmail}
                style={{width: '250px'}}
              />
            )}
          >
            <strong>
              <a href="#">{notifyEmail}&nbsp;</a>
            </strong>
          </ReflessPopover>
          <span>if monthly usage exceeds&nbsp;</span>
          <ReflessPopover
            position={PopoverPosition.Above}
            contents={() => (
              <Input
                type="number"
                onChange={onBalanceThreshold}
                value={balanceThreshold}
                style={{width: '75px'}}
                min={10}
              />
            )}
          >
            <strong>
              <a href="#">{`$${balanceThreshold}`}</a>
            </strong>
          </ReflessPopover>
        </>
      )
    }

    return (
      <>
        <ReflessPopover
          position={PopoverPosition.Above}
          contents={() => (
            <Button onClick={onNotify} text="Notify me via email" />
          )}
        >
          <strong>
            <a href="#">Do not notify me&nbsp;</a>
          </strong>
        </ReflessPopover>
        <span>about monthly usage exceptions</span>
      </>
    )
  }
}

export default BillingThreshold
