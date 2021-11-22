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
import {getQuartzMe} from 'src/me/selectors'
import {NotificationButtonElement} from 'src/types'

const OrgProfileTab: FC = () => {
  const quartzMe = useSelector(getQuartzMe)
  const org = useSelector(getOrg)
  const history = useHistory()
  const {status, users} = useContext(UsersContext)
  const dispatch = useDispatch()

  const handleShowDeleteOverlay = () => {
    if (
      isFlagEnabled('trackCancellations') &&
      isFlagEnabled('rudderstackReporting')
    ) {
      const payload = {
        org: org.id,
        tier: quartzMe?.accountType,
        email: quartzMe?.email,
      }

      event('Delete Organization Initiated', payload)
      track('DeleteOrgInitiation', payload)
    }

    history.push(`/orgs/${org.id}/about/delete`)
  }

  const handleShowWarning = () => {
    const buttonElement: NotificationButtonElement = onDismiss =>
      getDeleteAccountWarningButton(`/orgs/${org.id}/users`, onDismiss)
    dispatch(notify(deleteAccountWarning(buttonElement)))
  }

  let handleDeleteClick = handleShowDeleteOverlay

  if (users.length > 1) {
    handleDeleteClick = handleShowWarning
  }

  return (
    <PageSpinner loading={status}>
      <>
        {CLOUD && quartzMe?.accountType === 'free' && (
          <>
            <FlexBox.Child>
              <h4 style={{marginBottom: '4px'}}>Delete Organization</h4>
              <p style={{margin: '0px'}}>
                Delete your Free InfluxDB Cloud account and remove any data that
                you have loaded.
              </p>
            </FlexBox.Child>
            <FlexBox.Child>
              <Button
                testID="delete-org--button"
                text="Delete"
                icon={IconFont.Trash_New}
                onClick={handleDeleteClick}
              />
            </FlexBox.Child>
          </>
        )}
      </>
    </PageSpinner>
  )
}

export default OrgProfileTab
