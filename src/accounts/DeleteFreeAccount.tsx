// Libraries
import React, {FC, useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {track} from 'rudder-sdk-js'

import {Button, IconFont, FlexBox} from '@influxdata/clockface'

import {OrgUsersLink} from 'src/shared/components/notifications/NotificationButtons'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {selectCurrentAccount, selectUser} from 'src/identity/selectors'

// Contexts
import {UsersContext} from 'src/users/context/users'

// Notifications
import {deleteAccountWarning} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Types
import {NotificationButtonElement} from 'src/types'

export const DeleteFreeAccountButton: FC = () => {
  const account = useSelector(selectCurrentAccount)
  const history = useHistory()
  const org = useSelector(getOrg)
  const user = useSelector(selectUser)
  const {users} = useContext(UsersContext)
  const dispatch = useDispatch()

  const shouldShowUsersWarning = users.length > 1

  const handleClickDeleteFreeAccount = () => {
    if (shouldShowUsersWarning) {
      showRemoveUsersWarning()
    } else {
      showDeleteFreeAccountOverlay()
    }
  }

  const showDeleteFreeAccountOverlay = () => {
    const payload = {
      org: org.id,
      tier: account.type,
      email: user.email,
    }
    event('DeleteOrgInitiation Event', payload)

    if (isFlagEnabled('rudderstackReporting')) {
      track('DeleteOrgInitiation', payload)
    }

    history.push(`/orgs/${org.id}/accounts/settings/delete`)
  }

  const showRemoveUsersWarning = () => {
    const buttonElement: NotificationButtonElement = onDismiss =>
      OrgUsersLink(`/orgs/${org.id}/members`, onDismiss)
    dispatch(notify(deleteAccountWarning(buttonElement)))
  }

  return (
    <>
      <FlexBox.Child style={{marginTop: '30px'}}>
        <h4>Delete Account</h4>
        <p className="org-profile-tab--heading org-profile-tab--deleteHeading">
          Delete your Free InfluxDB Cloud account and remove any data that you
          have loaded.
        </p>
        <Button
          testID="delete-org--button"
          text="Delete"
          icon={IconFont.Trash_New}
          onClick={handleClickDeleteFreeAccount}
        />
      </FlexBox.Child>
    </>
  )
}
