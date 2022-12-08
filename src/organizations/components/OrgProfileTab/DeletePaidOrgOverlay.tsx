// Libraries
import React, {FC, useContext, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
  Alert,
  AlignItems,
  Button,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  FlexBox,
  FlexDirection,
  IconFont,
  Input,
  InputLabel,
  InputType,
  Overlay,
} from '@influxdata/clockface'

// Selectors
import {
  selectCurrentAccount,
  selectCurrentOrg,
  selectUser,
} from 'src/identity/selectors'

// API
import {deleteOrganization} from 'src/identity/apis/org'

// Constants
import {CLOUD_URL} from 'src/shared/constants'

// Notifications
import {deleteOrgFailed} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'

// Utils
import {OverlayContext} from 'src/overlays/components/OverlayController'
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'
import {setToLocalStorage} from 'src/localStorage'

// Styles
import './DeletePaidOrgOverlay.scss'

// Required to avoid unwarranted console errors from clockface <Input /> when type=radio.
const noop = () => null

export const DeletePaidOrgOverlay: FC = () => {
  const account = useSelector(selectCurrentAccount)
  const org = useSelector(selectCurrentOrg)
  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  const {onClose} = useContext(OverlayContext)

  const [deleteButtonStatus, setDeleteButtonStatus] = useState(
    ComponentStatus.Disabled
  )
  const [userAcceptedTerms, setUserAcceptedTerms] = useState(false)

  const orgDeleteInProgress = deleteButtonStatus === ComponentStatus.Loading
  const onClickCancel = orgDeleteInProgress ? noop : onClose

  const toggleAcceptedTerms = () => {
    const currentAcceptanceStatus = !userAcceptedTerms
    setUserAcceptedTerms(currentAcceptanceStatus)

    setDeleteButtonStatus(
      currentAcceptanceStatus
        ? ComponentStatus.Default
        : ComponentStatus.Disabled
    )
  }

  const handleDeleteOrg = async () => {
    try {
      setDeleteButtonStatus(ComponentStatus.Loading)

      await deleteOrganization(org.id)

      setDeleteButtonStatus(ComponentStatus.Default)
      // Adding (and on reload, removing) this property from local storage
      // is a work-around so that it's possible for the user to be notified of org deletion
      // AFTER app reload. See src/components/notifications/Notifications.tsx,
      // which detects the property, and if found, sends a notification then deletes it.
      onClose()
      setToLocalStorage('justDeletedOrg', org.name)
      window.location.href = `${CLOUD_URL}`
    } catch (err) {
      dispatch(notify(deleteOrgFailed(org.name)))
      reportErrorThroughHoneyBadger(err, {
        name: 'Org deletion failed',
        context: {
          user,
          account,
          org,
        },
      })
      setDeleteButtonStatus(ComponentStatus.Disabled)
      setUserAcceptedTerms(false)
    }
  }

  return (
    <Overlay.Container
      className="org-delete-overlay"
      maxWidth={600}
      testID="create-org-overlay--container"
    >
      <Overlay.Header
        testID="create-org-overlay--header"
        title="Delete Organization"
        onDismiss={onClickCancel}
      />
      <Overlay.Body>
        <Alert
          className="org-delete-overlay--warning-message"
          color={ComponentColor.Danger}
          icon={IconFont.AlertTriangle}
        >
          You will be able to recover this organization's data for up to 7 days
          by contacting support. It will be unrecoverable afterwards.
        </Alert>
        <br />
        <ul>
          <li>
            All of your writes, queries, and tasks for <b>{org.name}</b> will be{' '}
            <b>suspended immediately</b>.
          </li>
          <li>
            Your final billing statement will be calculated for any usage and
            storage incurred prior to the deletion of your organization and your
            credit card will be charged for the amount.
          </li>
          <li>
            Before continuing, you are responsible for exporting any data or
            content - including dashboards, tasks, and variables - from the user
            interface.
          </li>
          <li>
            On deleting this organization, you will return to your default
            organization in the current account. If this is the last
            organization in your account, you will be prompted to create a new
            organization.
          </li>
        </ul>
        <FlexBox
          alignItems={AlignItems.FlexStart}
          className="org-delete-overlay--conditions-instruction"
          direction={FlexDirection.Row}
        >
          <FlexBox
            data-testid="org-delete-overlay--accept-terms-box"
            direction={FlexDirection.Row}
            onClick={toggleAcceptedTerms}
          >
            <Input
              checked={userAcceptedTerms}
              className="org-delete-overlay--accept-terms-radio-button"
              onChange={noop}
              size={ComponentSize.ExtraSmall}
              testID="org-delete-overlay--accept-terms-radio-button"
              titleText="I understand and agree to these conditions."
              type={InputType.Checkbox}
            ></Input>
            <InputLabel
              active={true}
              className="org-delete-overlay--conditions-instruction"
              size={ComponentSize.Small}
            >
              I understand and agree to these conditions.
            </InputLabel>
          </FlexBox>
        </FlexBox>
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          color={ComponentColor.Default}
          onClick={onClickCancel}
          testID="create-org-form-cancel"
          text="Cancel"
        />
        <Button
          color={ComponentColor.Danger}
          onClick={handleDeleteOrg}
          status={deleteButtonStatus}
          testID="create-org-form-submit"
          text="Delete Organization"
        />
      </Overlay.Footer>
    </Overlay.Container>
  )
}
