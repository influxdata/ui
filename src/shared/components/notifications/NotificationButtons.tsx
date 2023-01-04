// Libraries
import React from 'react'
import {Link} from 'react-router-dom'

// Types
import {NotificationDismiss} from 'src/types'

export const OrgUsersLink = (
  url: string,
  onDismiss: NotificationDismiss
): JSX.Element => {
  return (
    <Link to={url} onClick={onDismiss} data-testid="go-to-users--link">
      Go to Users page
    </Link>
  )
}
