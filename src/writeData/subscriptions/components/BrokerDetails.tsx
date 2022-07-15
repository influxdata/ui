// Libraries
import React, {FC} from 'react'

// Components
import {
  Form,
  Overlay,
  Heading,
  HeadingElement,
  FontWeight,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'
import BrokerFormContent from 'src/writeData/subscriptions/components/BrokerFormContent'

// Utils

// Types
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

const BrokerDetails: FC<Props> = ({
  currentSubscription,
  updateForm,
  edit,
  loading,
  onFocus,
}) => {
  return (
    <div
      className="update-broker-form"
      id="broker"
      onFocus={onFocus}
      tabIndex={-1}
    >
      <SpinnerContainer spinnerComponent={<TechnoSpinner />} loading={loading}>
        <Form onSubmit={() => {}} testID="update-broker-form-overlay">
          <Overlay.Body>
            <Heading
              element={HeadingElement.H3}
              weight={FontWeight.Bold}
              className="update-broker-form__header"
            >
              Broker details
            </Heading>
            <BrokerFormContent
              formContent={currentSubscription}
              updateForm={updateForm}
              className="update"
              edit={edit}
            />
          </Overlay.Body>
          <div className="update-broker-form__line"></div>
        </Form>
      </SpinnerContainer>
    </div>
  )
}
export default BrokerDetails
