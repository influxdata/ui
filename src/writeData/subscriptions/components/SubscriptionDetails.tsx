// Libraries
import React, {FC, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {
  Button,
  Form,
  Overlay,
  ButtonType,
  ComponentColor,
  ComponentStatus,
} from '@influxdata/clockface'
import SubscriptionFormContent from 'src/writeData/subscriptions/components/SubscriptionFormContent'
import StatusHeader from 'src/writeData/subscriptions/components/StatusHeader'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'

// Types
import {SUBSCRIPTIONS, LOAD_DATA} from 'src/shared/constants/routes'
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/SubscriptionDetails.scss'

interface Props {
  currentSubscription: Subscription
  setFormActive: (string) => void
  updateForm: (any) => void
  buckets: any
  bucket: any
  edit: boolean
  setEdit: (any) => void
  singlePage: boolean
  setStatus: (any) => void
}

const SubscriptionDetails: FC<Props> = ({
  currentSubscription,
  setFormActive,
  updateForm,
  buckets,
  bucket,
  edit,
  setEdit,
  singlePage,
  setStatus,
}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
  useEffect(() => {
    event('visited subscription details page', {}, {feature: 'subscriptions'})
  }, [])
  useEffect(() => {
    if (edit) {
      updateForm({...currentSubscription, bucket: bucket.name})
    }
  }, [bucket])
  return (
    buckets && (
      <div className="update-subscription-form" id="subscription">
        <Form
          onSubmit={() => {}}
          testID="update-subscription-form--overlay-form"
        >
          {!singlePage && (
            <StatusHeader
              currentSubscription={currentSubscription}
              setStatus={setStatus}
            />
          )}
          <Overlay.Header title="Topic Subscription"></Overlay.Header>
          <Overlay.Body>
            <SubscriptionFormContent
              currentSubscription={currentSubscription}
              updateForm={updateForm}
              className="update"
              edit={edit}
            />
          </Overlay.Body>

          {!singlePage ? (
            <Overlay.Footer>
              <Button
                text="Close"
                color={ComponentColor.Tertiary}
                onClick={() => {
                  event('close button clicked', {}, {feature: 'subscriptions'})
                  history.push(`/orgs/${org.id}/${LOAD_DATA}/${SUBSCRIPTIONS}`)
                }}
                titleText="Cancel update and return to Subscriptions list"
                type={ButtonType.Button}
                testID="update-subscription-form--cancel"
              />
              <Button
                text="Edit"
                color={edit ? ComponentColor.Success : ComponentColor.Secondary}
                onClick={() => {
                  event('edit button clicked', {}, {feature: 'subscriptions'})
                  setEdit(!edit)
                }}
                type={ButtonType.Button}
                titleText="Edit"
                testID="update-subscription-form--edit"
              />
              <Button
                text="Next"
                color={ComponentColor.Secondary}
                onClick={() => {
                  event('next button clicked', {}, {feature: 'subscriptions'})
                  setFormActive('parsing')
                }}
                type={ButtonType.Button}
                titleText="Next"
                testID="update-subscription-form--submit"
              />
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
                testID="update-subscription-form--view-data"
                status={ComponentStatus.Default}
              />
            </Overlay.Footer>
          ) : (
            <div className="update-subscription-form__line"></div>
          )}
        </Form>
      </div>
    )
  )
}

export default SubscriptionDetails
