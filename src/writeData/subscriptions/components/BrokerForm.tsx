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
  IconFont,
  Icon,
  Heading,
  HeadingElement,
  FontWeight,
  FlexBox,
  ComponentSize,
  AlignItems,
  FlexDirection,
} from '@influxdata/clockface'
import BrokerFormContent from 'src/writeData/subscriptions/components/BrokerFormContent'

// Utils
import {getOrg} from 'src/organizations/selectors'
// Types
import {SUBSCRIPTIONS, LOAD_DATA} from 'src/shared/constants/routes'
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/BrokerForm.scss'

interface Props {
  formContent: Subscription
  setFormActive: (string) => void
  updateForm: (any) => void
  showUpgradeButton: boolean
}

const BrokerForm: FC<Props> = ({
  formContent,
  setFormActive,
  updateForm,
  showUpgradeButton,
}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
  return (
    formContent && (
      <div className="create-broker-form">
        <Form onSubmit={() => {}} testID="create-broker-form-overlay">
          <Overlay.Header title="Connect to Broker">
            {showUpgradeButton && (
              <FlexBox
                alignItems={AlignItems.Center}
                direction={FlexDirection.Row}
                margin={ComponentSize.Medium}
                className="create-broker-form__premium-container"
              >
                <Icon glyph={IconFont.CrownSolid_New} />
                <Heading
                  element={HeadingElement.H5}
                  weight={FontWeight.Bold}
                  className="create-broker-form__premium-container__text"
                >
                  Premium
                </Heading>
              </FlexBox>
            )}
          </Overlay.Header>
          <Overlay.Body>
            <Heading
              element={HeadingElement.H5}
              weight={FontWeight.Regular}
              className="create-broker-form__text"
            >
              {showUpgradeButton
                ? 'Upgrade Now to create a new connection to collect data from an MQTT broker and parse messages into metrics.'
                : 'Create a new connection to collect data from an MQTT broker and parse messages into metrics.'}
            </Heading>
            <Heading
              element={HeadingElement.H3}
              weight={FontWeight.Bold}
              className="create-broker-form__header"
            >
              Broker details
            </Heading>
            <BrokerFormContent
              updateForm={updateForm}
              formContent={formContent}
              className="create"
            />
          </Overlay.Body>
          <Overlay.Footer>
            <Button
              text="Cancel"
              color={ComponentColor.Tertiary}
              onClick={() => {
                history.push(`/orgs/${org.id}/${LOAD_DATA}/${SUBSCRIPTIONS}`)
              }}
              titleText="Cancel creation of Subscription and return to list"
              type={ButtonType.Button}
              testID="create-broker-form--cancel"
            />
            <Button
              text="Next"
              color={ComponentColor.Success}
              onClick={() => {
                setFormActive('subscription')
              }}
              type={ButtonType.Button}
              testID="create-broker-form--submit"
              status={ComponentStatus.Default}
            />
          </Overlay.Footer>
        </Form>
      </div>
    )
  )
}
export default BrokerForm
