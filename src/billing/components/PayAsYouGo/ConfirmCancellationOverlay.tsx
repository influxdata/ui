import React, {FC} from 'react'

const ConfirmCancellationOverlay: FC = () => (
  <div className="cancellation-overlay--content">
    <p>
      This action is irreversible and cannot be undone. Are you sure you want to
      cancel your service and close your account?
    </p>
  </div>
)

export default ConfirmCancellationOverlay
