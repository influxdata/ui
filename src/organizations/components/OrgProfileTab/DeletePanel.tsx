// Libraries
import React, {FC, useContext, useRef} from 'react'
import {track} from 'rudder-sdk-js'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Components
import {
  Button,
  IconFont,
  FlexBox,
  Popover,
  PopoverInteraction,
  PopoverPosition,
} from '@influxdata/clockface'
import {getDeleteAccountWarningButton} from 'src/shared/components/notifications/NotificationButtons'
import PageSpinner from 'src/perf/components/PageSpinner'

// Contexts
import {UsersContext} from 'src/users/context/users'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {
  selectCurrentAccount,
  selectCurrentIdentity,
  selectOrgSuspendable,
  selectUser,
} from 'src/identity/selectors'

// Notifications
import {deleteAccountWarning} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Constants
import {CLOUD} from 'src/shared/constants'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {dismissOverlay, showOverlay} from 'src/overlays/actions/overlays'

// Types
import {NotificationButtonElement} from 'src/types'

// Styles
import 'src/organizations/components/OrgProfileTab/style.scss'

const linkStyle = {textDecoration: 'underline'}

export const DeletePanel: FC = () => {
  const {user, account} = useSelector(selectCurrentIdentity)
  const {status} = useContext(UsersContext)

  const shouldShowDeleteFreeAccountButton =
    CLOUD && account.type === 'free' && user.orgCount === 1

  const shouldShowDeleteOrgButton =
    CLOUD &&
    isFlagEnabled('createDeleteOrgs') &&
    !shouldShowDeleteFreeAccountButton

  return (
    <PageSpinner loading={status}>
      <>
        {shouldShowDeleteFreeAccountButton && <DeleteFreeAccountButton />}
        {shouldShowDeleteOrgButton && <DeleteOrgButton />}
      </>
    </PageSpinner>
  )
}

const DeleteFreeAccountButton: FC = () => {
  const account = useSelector(selectCurrentAccount)
  const history = useHistory()
  const org = useSelector(getOrg)
  const user = useSelector(selectUser)
  const {users} = useContext(UsersContext)

  const dispatch = useDispatch()

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

  let handleDeleteAccountFree = handleShowDeleteOverlay

  if (users.length > 1) {
    handleDeleteAccountFree = handleShowWarning
  }

  return (
    <>
      <FlexBox.Child>
        <h4>Delete Organization</h4>
        <p className="org-profile-tab--heading org-profile-tab--deleteHeading">
          Delete your Free InfluxDB Cloud account and remove any data that you
          have loaded.
        </p>
      </FlexBox.Child>
      <FlexBox.Child>
        <Button
          testID="delete-org--button"
          text="Delete"
          icon={IconFont.Trash_New}
          onClick={handleDeleteAccountFree}
        />
      </FlexBox.Child>
    </>
  )
}

const popoverStyle = {padding: '10px'}

const DeleteOrgButton: FC = () => {
  const dispatch = useDispatch()
  const org = useSelector(getOrg)
  const orgCanBeSuspended = useSelector(selectOrgSuspendable)
  const popoverRef = useRef()

  const handleClickCreateOrg = (hidePopup: Function) => {
    dispatch(
      showOverlay('create-organization', null, () => dispatch(dismissOverlay()))
    )
    hidePopup()
  }

  const handleSuspendOrg = () => {
    if (orgCanBeSuspended) {
      dispatch(
        showOverlay('suspend-org-in-paid-account', null, () =>
          dispatch(dismissOverlay())
        )
      )
    }
  }

  return (
    <>
      <FlexBox.Child>
        <h4>Delete Organization</h4>
        <p className="org-profile-tab--heading org-profile-tab--deleteHeading">
          Delete the <b>{org.name}</b> organization and remove any data that you
          have loaded.
        </p>
      </FlexBox.Child>
      <FlexBox.Child>
        <>
          {!orgCanBeSuspended && (
            <Popover
              contents={onHide => (
                <div>
                  <>
                    <Popover.DismissButton onClick={onHide} />
                    <b>"{org.name}"</b> cannot be deleted because it is the last
                    organization in this account. <br />
                    To delete "{org.name}", please{' '}
                    <a
                      className="delete-org-panel--create-org-link"
                      onClick={() => handleClickCreateOrg(onHide)}
                      style={linkStyle}
                    >
                      create another organization
                    </a>{' '}
                    first.
                  </>
                </div>
              )}
              hideEvent={PopoverInteraction.Click}
              position={PopoverPosition.ToTheRightTop}
              showEvent={PopoverInteraction.Click}
              style={popoverStyle}
              triggerRef={popoverRef}
            />
          )}
          <Button
            icon={IconFont.Trash_New}
            onClick={handleSuspendOrg}
            ref={popoverRef}
            testID="delete-org--button"
            text="Delete"
          />
        </>
      </FlexBox.Child>
    </>
  )
}
