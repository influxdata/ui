// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'

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
import StatusHeader from 'src/writeData/subscriptions/components/StatusHeader'
import BrokerFormContent from 'src/writeData/subscriptions/components/BrokerFormContent'
import DetailsFormFooter from 'src/writeData/subscriptions/components/DetailsFormFooter'

// Utils
import {getOrg} from 'src/organizations/selectors'

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
  setFormActive: (any) => void
  setStatus: (any) => void
  saveForm: (any) => void
  active: string
}

const BrokerDetails: FC<Props> = ({
  currentSubscription,
  updateForm,
  edit,
  setEdit,
  loading,
  setFormActive,
  setStatus,
  saveForm,
  active,
}) => {
  const org = useSelector(getOrg)
  return (
    <div className="update-broker-form" id="broker">
      <SpinnerContainer spinnerComponent={<TechnoSpinner />} loading={loading}>
        <Form onSubmit={() => {}} testID="update-broker-form-overlay">
          <StatusHeader
            currentSubscription={currentSubscription}
            setStatus={setStatus}
          />
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
          <DetailsFormFooter
            nextForm="subscription"
            id={org.id}
            edit={edit}
            setEdit={setEdit}
            setFormActive={setFormActive}
            formActive={active}
            currentSubscription={currentSubscription}
            saveForm={saveForm}
          />
        </Form>
      </SpinnerContainer>
    </div>
  )
}
export default BrokerDetails
