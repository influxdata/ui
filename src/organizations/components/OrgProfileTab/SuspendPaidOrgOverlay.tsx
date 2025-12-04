// Libraries
import React, {FC, useContext, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Link} from 'react-router-dom'

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

// Notifications
import {
  deleteOrgDelayed,
  deleteOrgFailed,
  deleteOrgSuccess,
} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'

// Utils
import {OverlayContext} from 'src/overlays/components/OverlayController'
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'

// Actions
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Eventing
import {DeleteOrgOverlay, multiOrgTag} from 'src/identity/events/multiOrgEvents'
import {event} from 'src/cloud/utils/reporting'

// Styles
import './SuspendPaidOrgOverlay.scss'

// Constants
import {CLOUD_URL} from 'src/shared/constants'
const WAIT_IN_MS_BEFORE_REDIRECTING_TO_DEFAULT_ORG = 4000
const WAIT_IN_MS_BEFORE_SHOWING_DELAY_NOTIFICATION = 5000

// Required to avoid unwarranted console errors from clockface <Input /> when type=radio.
const noop = () => null

const linkStyle = {
  color: 'white',
  textDecoration: 'underline',
}

export const SuspendPaidOrgOverlay: FC = () => {
  const account = useSelector(selectCurrentAccount)
  const org = useSelector(selectCurrentOrg)
  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  const {onClose, params} = useContext(OverlayContext)

  const [deleteButtonStatus, setDeleteButtonStatus] = useState(
    ComponentStatus.Disabled
  )
  const [userAcceptedTerms, setUserAcceptedTerms] = useState(false)

  const orgDeleteInProgress = deleteButtonStatus === ComponentStatus.Loading
  const onClickCancel = orgDeleteInProgress ? noop : onClose

  const handleContactSupport = () => {
    dispatch(showOverlay('contact-support', null, dismissOverlay))
  }

  const SupportLink = (): JSX.Element => {
    return (
      <span style={linkStyle}>
        Please{' '}
        <a
          href="#"
          onClick={handleContactSupport}
          style={{color: 'white', textDecoration: 'underline'}}
        >
          contact support
        </a>{' '}
        to reach our support team.
      </span>
    )
  }

  const toggleAcceptedTerms = () => {
    const currentAcceptanceStatus = !userAcceptedTerms
    setUserAcceptedTerms(currentAcceptanceStatus)

    setDeleteButtonStatus(
      currentAcceptanceStatus
        ? ComponentStatus.Default
        : ComponentStatus.Disabled
    )
  }

  const handleDeleteOrg = () => {
    setDeleteButtonStatus(ComponentStatus.Loading)

    const responseTimer = setTimeout(() => {
      dispatch(notify(deleteOrgDelayed(SupportLink)))

      toggleAcceptedTerms()
    }, WAIT_IN_MS_BEFORE_SHOWING_DELAY_NOTIFICATION)

    deleteOrganization(org.id)
      .then(() => {
        clearTimeout(responseTimer)
        dispatch(notify(deleteOrgSuccess(org.name, account.name)))
        event(DeleteOrgOverlay.DeleteOrg, multiOrgTag, {
          accountId: account.id,
          accoutnName: account.name,
          accountType: account.type,
          orgName: org.name,
          userId: org.id,
        })
        setTimeout(() => {
          onClose()
          window.location.href = CLOUD_URL
        }, WAIT_IN_MS_BEFORE_REDIRECTING_TO_DEFAULT_ORG)
      })
      .catch(err => {
        clearTimeout(responseTimer)
        dispatch(notify(deleteOrgFailed(SupportLink, org.name)))
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
      })
  }

  return (
    <Overlay.Container
      className="org-delete-overlay"
      maxWidth={750}
      testID="create-org-overlay--container"
    >
      <Overlay.Header
        onDismiss={onClickCancel}
        testID="create-org-overlay--header"
        title="Delete Organization"
      />
      <Overlay.Body>
        <Alert
          className="org-delete-overlay--warning-message"
          color={ComponentColor.Danger}
          icon={IconFont.AlertTriangle}
        >
          You will be able to recover this organization's data for up to 7 days
          by contacting support. It will be unrecoverable afterwards.
          {params.userCount > 1 && (
            <>
              <br />
              <br />
              <Link to={`/orgs/${org.id}/members`} onClick={onClickCancel}>
                {params.userCount} users in this organization
              </Link>{' '}
              will lose access to all organization data immediately.
            </>
          )}
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
