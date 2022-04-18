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
  FlexBox,
  FlexDirection,
  ComponentSize,
  JustifyContent,
} from '@influxdata/clockface'
import StatusHeader from 'src/writeData/subscriptions/components/StatusHeader'
import BrokerFormContent from 'src/writeData/subscriptions/components/BrokerFormContent'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'

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
}

const SinglePageBrokerDetails: FC<Props> = ({
  currentSubscription,
  updateForm,
  edit,
  setEdit,
  loading,
  saveForm,
  setStatus,
}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
  return (
    <div className="update-broker-form" id="broker">
      <SpinnerContainer spinnerComponent={<TechnoSpinner />} loading={loading}>
        <Form onSubmit={() => {}} testID="update-broker-form-overlay">
          <div>
            <FlexBox
              className="update-broker-form__broker-buttons"
              direction={FlexDirection.Row}
              margin={ComponentSize.Medium}
              justifyContent={JustifyContent.FlexEnd}
            >
              <Button
                text="Close"
                color={ComponentColor.Tertiary}
                onClick={() => {
                  event('close button clicked', {}, {feature: 'subscriptions'})
                  history.push(`/orgs/${org.id}/${LOAD_DATA}/${SUBSCRIPTIONS}`)
                }}
                titleText="Cancel update of Subscription and return to list"
                type={ButtonType.Button}
                testID="update-broker-form--cancel"
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
                testID="update-broker-form--edit"
              />
              {edit ? (
                <Button
                  type={ButtonType.Button}
                  text="Save Changes"
                  color={ComponentColor.Success}
                  onClick={() => {
                    saveForm(currentSubscription)
                  }}
                  testID="update-broker-form--submit"
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
            </FlexBox>
            <StatusHeader
              currentSubscription={currentSubscription}
              setStatus={setStatus}
            />
          </div>
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
          <div className="update-broker-form__line"></div>
        </Form>
      </SpinnerContainer>
    </div>
  )
}
export default SinglePageBrokerDetails
