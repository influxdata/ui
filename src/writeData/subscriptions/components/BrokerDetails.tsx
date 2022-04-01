// Libraries
import React, {FC} from 'react'
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
  Heading,
  HeadingElement,
  FontWeight,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

// Utils
import {getOrg} from 'src/organizations/selectors'

// Types
import {SUBSCRIPTIONS, LOAD_DATA} from 'src/shared/constants/routes'
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/BrokerDetails.scss'
import BrokerFormContent from './BrokerFormContent'

interface Props {
  currentSubscription: Subscription
  setFormActive: (string) => void
  updateForm: (any) => void
  edit: boolean
  setEdit: (any) => void
  loading: any
}

const BrokerDetails: FC<Props> = ({
  currentSubscription,
  setFormActive,
  updateForm,
  edit,
  setEdit,
  loading,
}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
  return (
    <div className="update-broker-form">
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
            />
          </Overlay.Body>
          <Overlay.Footer>
            <Button
              text="Close"
              color={ComponentColor.Tertiary}
              onClick={() => {
                history.push(`/orgs/${org.id}/${LOAD_DATA}/${SUBSCRIPTIONS}`)
              }}
              titleText="Cancel update of Subscription and return to list"
              type={ButtonType.Button}
              testID="update-broker-form--cancel"
            />
            <Button
              text="Edit"
              color={edit ? ComponentColor.Success : ComponentColor.Secondary}
              onClick={() => setEdit(!edit)}
              type={ButtonType.Button}
              titleText="Edit"
              testID="update-broker-form--submit"
            />
            <Button
              text="Next"
              color={ComponentColor.Secondary}
              onClick={() => setFormActive('subscription')}
              type={ButtonType.Button}
              titleText="Next"
              testID="update-broker-form--submit"
            />
            <Button
              text="View Data"
              color={ComponentColor.Success}
              onClick={() => {
                history.push(`/orgs/${org.id}/notebooks`)
              }}
              type={ButtonType.Button}
              testID="update-broker-form--view-data"
              status={ComponentStatus.Default}
            />
          </Overlay.Footer>
        </Form>
      </SpinnerContainer>
    </div>
  )
}
export default BrokerDetails
