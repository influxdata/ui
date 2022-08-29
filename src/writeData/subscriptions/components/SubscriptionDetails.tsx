// Libraries
import React, {FC, useEffect} from 'react'

// Components
import {Form, Overlay} from '@influxdata/clockface'
import SubscriptionFormContent from 'src/writeData/subscriptions/components/SubscriptionFormContent'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Types
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/SubscriptionDetails.scss'

interface Props {
  currentSubscription: Subscription
  updateForm: (any) => void
  buckets: any
  bucket: any
  edit: boolean
  onFocus?: () => void
}

const SubscriptionDetails: FC<Props> = ({
  currentSubscription,
  updateForm,
  buckets,
  bucket,
  edit,
  onFocus,
}) => {
  useEffect(() => {
    event('visited subscription details page', {}, {feature: 'subscriptions'})
  }, [])

  useEffect(() => {
    if (edit) {
      updateForm({...currentSubscription, bucket: bucket.name})
    }
  }, [bucket, currentSubscription, edit, updateForm])

  return (
    buckets && (
      <div
        className="update-subscription-form"
        id="subscription"
        onFocus={onFocus}
        tabIndex={-1}
      >
        <Form
          onSubmit={() => {}}
          testID="update-subscription-form--overlay-form"
        >
          <Overlay.Header title="Topic Subscription"></Overlay.Header>
          <Overlay.Body>
            <SubscriptionFormContent
              currentSubscription={currentSubscription}
              updateForm={updateForm}
              className="update"
              edit={edit}
            />
          </Overlay.Body>
          <div className="update-subscription-form__line"></div>
        </Form>
      </div>
    )
  )
}

export default SubscriptionDetails
