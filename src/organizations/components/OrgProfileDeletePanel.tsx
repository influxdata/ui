// Libraries
import React, {FC, useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Components
import {
  Button,
  ComponentSize,
  Panel,
  IconFont,
  FlexBox,
  AlignItems,
  FlexDirection,
  JustifyContent,
} from '@influxdata/clockface'
import PageSpinner from 'src/perf/components/PageSpinner'
import {UsersContext} from 'src/users/context/users'
import {getDeleteAccountWarningButton} from 'src/shared/components/notifications/NotificationButtons'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {notify} from 'src/shared/actions/notifications'
import {deleteAccountWarning} from 'src/shared/copy/notifications'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

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
        {isFlagEnabled('selfDeletion') && quartzMe?.accountType === 'free' && (
          <Panel.Body size={ComponentSize.ExtraSmall}>
            <FlexBox
              stretchToFitWidth={true}
              alignItems={AlignItems.Center}
              direction={FlexDirection.Row}
              justifyContent={JustifyContent.SpaceBetween}
            >
              <div>
                <h5 style={{marginBottom: '0'}}>
                  Delete Organization {org.name}
                </h5>
                <p style={{marginTop: '2px'}}>
                  Delete your Free InfluxDB Cloud account and remove any data
                  that you have loaded.
                </p>
              </div>
              <Button
                testID="delete-org--button"
                text="Delete"
                icon={IconFont.Trash}
                onClick={handleDeleteClick}
              />
            </FlexBox>
          </Panel.Body>
        )}
      </>
    </PageSpinner>
  )
}

export default OrgProfileTab
