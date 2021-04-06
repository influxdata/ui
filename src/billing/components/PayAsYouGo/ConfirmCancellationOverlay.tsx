import React, {PureComponent} from 'react'

class CancellationOverlay extends PureComponent {
  render() {
    return (
      <div className="cancellation-overlay--content">
        <p>
          This action is irreversible and cannot be undone. Are you sure you
          want to cancel your service and close your account?
        </p>
      </div>
    )
  }
}

export default CancellationOverlay
