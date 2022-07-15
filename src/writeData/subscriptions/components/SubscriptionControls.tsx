// Libraries
import React, {FC, useContext} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {
  Button,
  ButtonType,
  ComponentColor,
  ComponentStatus,
  FlexBox,
  FlexDirection,
  ComponentSize,
  JustifyContent,
} from '@influxdata/clockface'
import StatusHeader from 'src/writeData/subscriptions/components/StatusHeader'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'
import {AppSettingContext} from 'src/shared/contexts/app'
import {checkRequiredFields} from 'src/writeData/subscriptions/utils/form'

// Types
import {SUBSCRIPTIONS, LOAD_DATA} from 'src/shared/constants/routes'
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/BrokerDetails.scss'

interface Props {
  currentSubscription: Subscription
  updateForm: (any) => void
  edit: boolean
  setEdit: (any) => void
  loading: any
  saveForm: (any) => void
  setStatus: (any) => void
  onFocus?: () => void
}

const SubscriptionControls: FC<Props> = ({
  currentSubscription,
  edit,
  setEdit,
  saveForm,
  setStatus,
}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
  const {navbarMode} = useContext(AppSettingContext)
  const requiredFields = checkRequiredFields(currentSubscription)
  const navbarOpen = navbarMode === 'expanded'

  return (
    <div
      className="update-broker-form__fixed"
      style={
        {
          width: navbarOpen ? '61%' : '69%'
        }
      }
    >
      <FlexBox
        className="update-broker-form__fixed__broker-buttons"
        direction={FlexDirection.Row}
        margin={ComponentSize.Medium}
        justifyContent={JustifyContent.SpaceBetween}
      >
        <StatusHeader
          currentSubscription={currentSubscription}
          setStatus={setStatus}
        />
        <div>
          <Button
            text="Close"
            color={ComponentColor.Tertiary}
            onClick={() => {
              event('close button clicked', {}, {feature: 'subscriptions'})
              history.push(`/orgs/${org.id}/${LOAD_DATA}/${SUBSCRIPTIONS}`)
            }}
            titleText="Cancel update of Subscription and return to list"
            type={ButtonType.Button}
            testID="update-sub-form--cancel"
          />
          <Button
            text={edit ? 'Cancel' : 'Edit'}
            color={ComponentColor.Secondary}
            onClick={() => {
              event('edit button clicked', {}, {feature: 'subscriptions'})
              setEdit(!edit)
            }}
            type={ButtonType.Button}
            titleText="Edit"
            testID="update-sub-form--edit"
          />
          {edit ? (
            <Button
              type={ButtonType.Button}
              text="Save Changes"
              color={ComponentColor.Success}
              onClick={() => {
                saveForm(currentSubscription)
              }}
              testID="update-sub-form--submit"
              status={
                requiredFields
                  ? ComponentStatus.Default
                  : ComponentStatus.Disabled
              }
            />
          ) : (
            <Button
              text="View Data"
              color={ComponentColor.Success}
              onClick={() => {
                event(
                  'view data button clicked',
                  {},
                  {feature: 'subscriptions'}
                )
                history.push(`/orgs/${org.id}/notebooks`)
              }}
              type={ButtonType.Button}
              testID="update-broker-form--view-data"
              status={ComponentStatus.Default}
            />
          )}
        </div>
      </FlexBox>
    </div>
    // <div className="update-broker-form__line"></div>
  )
}
export default SubscriptionControls
