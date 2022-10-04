// Libraries
import React, {FC, useEffect} from 'react'

// Components
import {
  Form,
  Overlay,
  Heading,
  HeadingElement,
  FontWeight,
} from '@influxdata/clockface'
import SubscriptionFormContent from 'src/writeData/subscriptions/components/SubscriptionFormContent'

// Types
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/SubscriptionForm.scss'

interface Props {
  formContent: Subscription
  updateForm: (any) => void
  buckets: any
  bucket: any
  onFocus?: (any) => void
  showUpgradeButton: boolean
}

export const SubscriptionForm: FC<Props> = ({
  formContent,
  updateForm,
  buckets,
  bucket,
  onFocus,
  showUpgradeButton,
}) => {
  useEffect(() => {
    updateForm({...formContent, bucket: bucket.name})
  }, [bucket])

  return (
    formContent &&
    buckets && (
      <div
        className="create-subscription-form"
        id="subscription"
        onFocus={onFocus}
        tabIndex={-1}
      >
        <Form
          onSubmit={() => {}}
          testID="create-subscription-form--overlay-form"
        >
          <Overlay.Header title="Subscribe to a Topic"></Overlay.Header>
          <Overlay.Body>
            <Heading
              element={HeadingElement.H5}
              weight={FontWeight.Regular}
              className="create-subscription-form__text"
            >
              Subscribe to a topic and write message payloads to an InfluxDB
              data bucket.
            </Heading>
            <SubscriptionFormContent
              currentSubscription={formContent}
              updateForm={updateForm}
              className="create"
              edit={showUpgradeButton ? false : true}
            />
          </Overlay.Body>
          <div className="create-subscription-form__line"></div>
        </Form>
      </div>
    )
  )
}
