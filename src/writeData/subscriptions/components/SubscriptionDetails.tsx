// Libraries
import React, {FC, useEffect} from 'react'
import {useSelector} from 'react-redux'

// Components
import {Form, Overlay} from '@influxdata/clockface'
import SubscriptionFormContent from 'src/writeData/subscriptions/components/SubscriptionFormContent'
import StatusHeader from 'src/writeData/subscriptions/components/StatusHeader'
import DetailsFormFooter from 'src/writeData/subscriptions/components/DetailsFormFooter'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'

// Types
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
  active: string
  saveForm: (any) => void
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
  active,
  saveForm,
}) => {
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
            <DetailsFormFooter
              nextForm="parsing"
              id={org.id}
              edit={edit}
              setEdit={setEdit}
              setFormActive={setFormActive}
              formActive={active}
              currentSubscription={currentSubscription}
              saveForm={saveForm}
            />
          ) : (
            <div className="update-subscription-form__line"></div>
          )}
        </Form>
      </div>
    )
  )
}

export default SubscriptionDetails
