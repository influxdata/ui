// Libraries
import React, {FC, useContext, useRef} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Components
import {
  Button,
  IconFont,
  FlexBox,
  Popover,
  PopoverInteraction,
  PopoverPosition,
} from '@influxdata/clockface'
import {OrgUsersLink} from 'src/shared/components/notifications/NotificationButtons'
import PageSpinner from 'src/perf/components/PageSpinner'

// Contexts
import {UsersContext} from 'src/users/context/users'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {
  selectCurrentIdentity,
  selectOrgCreationAllowance,
  selectOrgSuspendable,
} from 'src/identity/selectors'

// Notifications
import {deleteOrgWarning} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'

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
  const {status} = useContext(UsersContext)
  const {user, account} = useSelector(selectCurrentIdentity)

  const freeAccountWithOneOrg = account.type === 'free' && user.orgCount === 1
  const shouldShowDeleteOrgButton =
    CLOUD && isFlagEnabled('createDeleteOrgs') && !freeAccountWithOneOrg

  return (
    <PageSpinner loading={status}>
      <>{shouldShowDeleteOrgButton && <DeleteOrgButton />}</>
    </PageSpinner>
  )
}

const popoverStyle = {padding: '10px'}

const DeleteOrgButton: FC = () => {
  const dispatch = useDispatch()
  const org = useSelector(getOrg)
  const orgCanBeSuspended = useSelector(selectOrgSuspendable)
  const canCreateOrgs = useSelector(selectOrgCreationAllowance)
  const {users} = useContext(UsersContext)

  const popoverRef = useRef()

  const handleClickCreateOrg = (hidePopup: Function) => {
    dispatch(
      showOverlay('create-organization', null, () => dispatch(dismissOverlay()))
    )
    hidePopup()
  }

  const handleClickUpgradeAccount = (hidePopup: Function) => {
    dispatch(
      showOverlay('marketo-upgrade-account-overlay', null, () =>
        dispatch(dismissOverlay())
      )
    )
    hidePopup()
  }

  const shouldShowUsersWarning = users.length > 1

  const handleSuspendOrg = () => {
    if (orgCanBeSuspended) {
      if (shouldShowUsersWarning) {
        const buttonElement: NotificationButtonElement = onDismiss =>
          OrgUsersLink(`/orgs/${org.id}/members`, onDismiss)
        dispatch(notify(deleteOrgWarning(buttonElement)))
      } else {
        dispatch(
          showOverlay('suspend-org-in-paid-account', null, () =>
            dispatch(dismissOverlay())
          )
        )
      }
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
        <>
          {!orgCanBeSuspended && (
            <Popover
              contents={onHide => (
                <div>
                  <>
                    <Popover.DismissButton onClick={onHide} />
                    <b>"{org.name}"</b> cannot be deleted because it is your
                    last accessible organization in this account. <br />
                    To continue, please{' '}
                    <a
                      className="delete-org-panel--create-org-link"
                      onClick={
                        canCreateOrgs
                          ? () => handleClickCreateOrg(onHide)
                          : () => handleClickUpgradeAccount(onHide)
                      }
                      style={linkStyle}
                    >
                      {canCreateOrgs
                        ? 'create another organization'
                        : 'upgrade this account'}
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
