import React, {Component} from 'react'

import {
  Panel,
  ComponentSize,
  ComponentColor,
  Button,
} from '@influxdata/clockface'

import CancellationOverlay from './CancellationOverlay'

class CancellationPanel extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isOverlayVisible: false,
    }
  }

  render() {
    return (
      <>
        <Panel>
          <Panel.Header size={ComponentSize.Medium}>
            <h4>Cancel Service</h4>
            {this.cancelButton()}
          </Panel.Header>
          <Panel.Body size={ComponentSize.Medium}>
            {this.cancelText()}
          </Panel.Body>
        </Panel>
        {this.cancelOverlay()}
      </>
    )
  }

  cancelButton() {
    return (
      <Button
        color={ComponentColor.Default}
        onClick={this.handleShowOverlay}
        text="Cancel Service"
        size={ComponentSize.Small}
      />
    )
  }

  cancelText() {
    return (
      <p>
        You only pay for what you use. To temporarily pause your service, just
        shut off your writes and queries.
      </p>
    )
  }

  cancelOverlay() {
    const {isOverlayVisible} = this.state
    return (
      <CancellationOverlay
        isOverlayVisible={isOverlayVisible}
        onHideOverlay={this.handleHideOverlay}
      />
    )
  }

  handleShowOverlay = () => {
    this.setState({isOverlayVisible: true})
  }

  handleHideOverlay = () => {
    this.setState({isOverlayVisible: false})
  }
}

export default CancellationPanel
