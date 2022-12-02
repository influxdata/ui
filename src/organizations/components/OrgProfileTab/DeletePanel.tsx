// Libraries
import React, {FC, useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {track} from 'rudder-sdk-js'

// Components
import {Button, IconFont, FlexBox} from '@influxdata/clockface'
import PageSpinner from 'src/perf/components/PageSpinner'
import {UsersContext} from 'src/users/context/users'
import {getDeleteAccountWarningButton} from 'src/shared/components/notifications/NotificationButtons'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {notify} from 'src/shared/actions/notifications'
import {deleteAccountWarning} from 'src/shared/copy/notifications'
import {CLOUD} from 'src/shared/constants'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {event} from 'src/cloud/utils/reporting'

// Types
import {selectCurrentIdentity} from 'src/identity/selectors'
import {NotificationButtonElement} from 'src/types'

import 'src/organizations/components/OrgProfileTab/style.scss'
import {dismissOverlay, showOverlay} from 'src/overlays/actions/overlays'

const DeletePanel: FC = () => {
  const {user, account} = useSelector(selectCurrentIdentity)
  const org = useSelector(getOrg)
  const history = useHistory()
  const {status, users} = useContext(UsersContext)
  const dispatch = useDispatch()

  const handleDeletePaidAccount = () => {
    dispatch(
      showOverlay('delete-org-in-paid-account', null, () =>
        dispatch(dismissOverlay())
      )
    )
  }

  const handleShowDeleteOverlay = () => {
    const payload = {
      org: org.id,
      tier: account.type,
      email: user.email,
    }
    event('DeleteOrgInitiation Event', payload)

    if (isFlagEnabled('rudderstackReporting')) {
      track('DeleteOrgInitiation', payload)
    }

    history.push(`/orgs/${org.id}/org-settings/delete`)
  }

  const handleShowWarning = () => {
    const buttonElement: NotificationButtonElement = onDismiss =>
      getDeleteAccountWarningButton(`/orgs/${org.id}/members`, onDismiss)
    dispatch(notify(deleteAccountWarning(buttonElement)))
  }

  let handleDeleteFreeAccount = handleShowDeleteOverlay

  if (users.length > 1) {
    handleDeleteFreeAccount = handleShowWarning
  }

  return (
    <PageSpinner loading={status}>
      <>
        {CLOUD && account.type === 'free' && (
          <>
            <FlexBox.Child>
              <h4>Delete Organization</h4>
              <p className="org-profile-tab--heading org-profile-tab--deleteHeading">
                Delete your Free InfluxDB Cloud account and remove any data that
                you have loaded.
              </p>
            </FlexBox.Child>
            <FlexBox.Child>
              <Button
                testID="delete-org--button"
                text="Delete"
                icon={IconFont.Trash_New}
                onClick={handleDeleteFreeAccount}
              />
            </FlexBox.Child>
          </>
        )}
        {CLOUD &&
          isFlagEnabled('createDeleteOrgs') &&
          (account.type === 'pay_as_you_go' || account.type === 'contract') && (
            <>
              <FlexBox.Child>
                <h4>Delete Organization</h4>
                <p className="org-profile-tab--heading org-profile-tab--deleteHeading">
                  Delete the <b>{org.name}</b> organization and remove any data
                  that you have loaded.
                </p>
              </FlexBox.Child>
              <FlexBox.Child>
                <Button
                  testID="delete-org--button"
                  text="Delete"
                  icon={IconFont.Trash_New}
                  onClick={handleDeletePaidAccount}
                />
              </FlexBox.Child>
            </>
          )}
      </>
    </PageSpinner>
  )
}

export default DeletePanel
