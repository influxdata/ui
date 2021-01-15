import React, {PureComponent} from 'react'

import {
  Overlay,
  Alert,
  ComponentColor,
  ComponentSize,
  IconFont,
  Button,
  ComponentStatus,
} from '@influxdata/clockface'

import TermsCancellationOverlay from './TermsCancellationOverlay'
import ConfirmCancellationOverlay from './ConfirmCancellationOverlay'

interface Props {
  isOverlayVisible: boolean
  onHideOverlay: () => void
}
interface State {
  hasAgreedToTerms: boolean
  hasClickedCancel: boolean
}

class CancellationOverlay extends PureComponent<Props, State> {
  private ref: React.RefObject<HTMLFormElement>

  constructor(props) {
    super(props)

    this.ref = React.createRef<HTMLFormElement>()

    this.state = {
      hasAgreedToTerms: false,
      hasClickedCancel: false,
    }
  }

  render() {
    const {isOverlayVisible, onHideOverlay} = this.props

    return (
      <form action="/billing/account_cancellation" method="POST" ref={this.ref}>
        <Overlay visible={isOverlayVisible} className="cancellation-overlay">
          <Overlay.Container maxWidth={600}>
            <Overlay.Header title="Cancel Service" onDismiss={onHideOverlay} />
            <Overlay.Body>
              <Alert
                color={ComponentColor.Danger}
                icon={IconFont.AlertTriangle}
              >
                This action cannot be undone
              </Alert>
              {this.overlayBody}
            </Overlay.Body>
            <Overlay.Footer>
              <Button
                color={ComponentColor.Danger}
                onClick={this.handleCancelService}
                text={this.buttonText}
                size={ComponentSize.Small}
                status={this.buttonStatus}
              />
            </Overlay.Footer>
          </Overlay.Container>
        </Overlay>
      </form>
    )
  }

  private get buttonStatus() {
    const {hasAgreedToTerms} = this.state
    return hasAgreedToTerms ? ComponentStatus.Default : ComponentStatus.Disabled
  }

  private get overlayBody() {
    const {hasClickedCancel, hasAgreedToTerms} = this.state

    if (!hasClickedCancel) {
      return (
        <TermsCancellationOverlay
          hasAgreedToTerms={hasAgreedToTerms}
          onAgreedToTerms={this.handleAgreeToTerms}
        />
      )
    }
    return <ConfirmCancellationOverlay />
  }

  private get buttonText() {
    const {hasClickedCancel} = this.state

    if (!hasClickedCancel) {
      return 'I understand, Cancel Service'
    }
    return 'Confirm and Cancel Service'
  }

  private handleAgreeToTerms = () => {
    const {hasAgreedToTerms} = this.state
    this.setState({hasAgreedToTerms: !hasAgreedToTerms})
  }

  private handleCancelService = () => {
    const {hasClickedCancel} = this.state
    const {onHideOverlay} = this.props

    if (!hasClickedCancel) {
      this.setState({hasClickedCancel: true})
    } else {
      this.ref.current.submit()

      onHideOverlay()
    }
  }
}

export default CancellationOverlay
