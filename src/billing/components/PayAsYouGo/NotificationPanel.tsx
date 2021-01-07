import React, {Component} from 'react'

import {
  Panel,
  ComponentSize,
  Button,
  ComponentColor,
} from '@influxdata/clockface'
import NotificationSettingsOverlay from 'src/billing/components/PayAsYouGo/NotificationSettingsOverlay'

import axios from 'axios'

class NotificationPanel extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isOverlayVisible: false,
      isNotifyActive: props.isNotify,
      balanceThreshold: props.balanceThreshold,
      notifyEmail: props.notifyEmail,
    }
  }
  render() {
    const {
      isOverlayVisible,
      notifyEmail,
      balanceThreshold,
      isNotifyActive,
    } = this.state

    return (
      <>
        <Panel testID="notification-settings">
          <Panel.Header>
            <h4>Notification Settings</h4>
            <Button
              color={ComponentColor.Default}
              onClick={this.handleShowOverlay}
              text="Notification Settings"
              size={ComponentSize.Small}
            />
          </Panel.Header>
          <Panel.Body>
            <div className="billing-notification">
              {isNotifyActive ? (
                <p>
                  Sending Notifications to {notifyEmail} when monthly usage
                  exceeds ${balanceThreshold}
                </p>
              ) : (
                <p>Usage Notifications disabled</p>
              )}
            </div>
          </Panel.Body>
        </Panel>
        <NotificationSettingsOverlay
          isOverlayVisible={isOverlayVisible}
          onHideOverlay={this.handleHideOverlay}
          notifyEmail={notifyEmail}
          balanceThreshold={balanceThreshold}
          onEmailChange={this.handleEmail}
          onBalanceThresholdChange={this.handleBalanceThreshold}
          onUpdateInfo={this.handleUpdatedInfo}
          isNotifyActive={isNotifyActive}
          onToggleChange={this.changeToggle}
          onSubmitThreshold={this.handleSubmitThreshold}
        />
      </>
    )
  }

  changeToggle = () => {
    const {isNotifyActive} = this.state
    this.setState({isNotifyActive: !isNotifyActive})
  }

  handleShowOverlay = () => {
    this.setState({isOverlayVisible: true})
  }

  handleHideOverlay = () => {
    this.setState({isOverlayVisible: false})
  }

  handleEmail = e => {
    this.setState({notifyEmail: e.target.value})
  }

  handleBalanceThreshold = e => {
    this.setState({balanceThreshold: e.target.value})
  }

  handleUpdatedInfo = data => {
    this.setState({
      notifyEmail: data.notifyEmail,
      balanceThreshold: data.balanceThreshold,
      isNotify: data.notifyEmail,
    })
  }

  handleSubmitThreshold = async () => {
    const {balanceThreshold, notifyEmail, isNotifyActive} = this.state

    const payload = {
      notifyEmail: notifyEmail,
      balanceThreshold: balanceThreshold.toString(),
      isNotify: isNotifyActive,
    }
    const url = 'privateAPI/balance_threshold'
    const {data} = await axios.put(url, payload)
    this.handleUpdatedInfo(data)
    this.handleHideOverlay()
  }
}

export default NotificationPanel
