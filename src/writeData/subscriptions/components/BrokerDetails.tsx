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
  updateForm: (any) => void
  edit: boolean
  setEdit: (any) => void
  loading: any
  singlePage: boolean
  setStatus:  (any) => void
}

const BrokerButtons = (history, edit, setEdit, id) => (
  <div>
  <Button
              text="Close"
              color={ComponentColor.Tertiary}
              onClick={() => {
                history.push(`/orgs/${id}/${LOAD_DATA}/${SUBSCRIPTIONS}`)
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
              testID="update-broker-form--edit"
            />
            <Button
              text="View Data"
              color={ComponentColor.Success}
              onClick={() => {
                history.push(`/orgs/${id}/notebooks`)
              }}
              type={ButtonType.Button}
              testID="update-broker-form--view-data"
              status={ComponentStatus.Default}
            />
            </div>
)

const BrokerDetails: FC<Props> = ({
  currentSubscription,
  updateForm,
  edit,
  setEdit,
  loading,
  singlePage,
  setStatus
}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
  return (
    <div className="update-broker-form">
      <SpinnerContainer spinnerComponent={<TechnoSpinner />} loading={loading}>
        <Form onSubmit={() => {}} testID="update-broker-form-overlay">
        <FlexBox direction={FlexDirection.Row} margin={ComponentSize.Medium} justifyContent={JustifyContent.FlexEnd}>
          {BrokerButtons(history, edit, setEdit, org.id)}
          </FlexBox>
          <StatusHeader currentSubscription={currentSubscription} setStatus={setStatus} />
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
          {
!singlePage ? (
<Overlay.Footer>
            
{BrokerButtons(history, edit, setEdit, org.id)}
          </Overlay.Footer>
) :   (      <div className="update-broker-form__line"></div> )

          }
          
          
        </Form>
      </SpinnerContainer>
    </div>
  )
}
export default BrokerDetails
