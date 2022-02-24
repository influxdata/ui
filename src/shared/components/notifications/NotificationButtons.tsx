// Libraries
import React from 'react'
import {Link} from 'react-router-dom'

// Types
import {NotificationDismiss} from 'src/types'

export const getDeleteAccountWarningButton = (
  url: string,
  onDismiss: NotificationDismiss
): JSX.Element => {
  return (
    <Link to={url} onClick={onDismiss} data-testID="go-to-users--link">
      Go to Users page
    </Link>
  )
}
