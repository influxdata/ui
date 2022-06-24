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
  FlexBox,
  ComponentSize,
  FlexDirection,
  JustifyContent,
} from '@influxdata/clockface'
import BrokerFormContent from 'src/writeData/subscriptions/components/BrokerFormContent'
import CloudUpgradeButton from 'src/shared/components/CloudUpgradeButton'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {shouldGetCredit250Experience} from 'src/me/selectors'
import {event} from 'src/cloud/utils/reporting'
import {checkRequiredFields} from 'src/writeData/subscriptions/utils/form'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {
  getDataLayerIdentity,
  getExperimentVariantId,
} from 'src/cloud/utils/experiments'

// Constants
import {CREDIT_250_EXPERIMENT_ID} from 'src/shared/constants'

// Types
import {SUBSCRIPTIONS, LOAD_DATA} from 'src/shared/constants/routes'
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/BrokerForm.scss'

interface Props {
  formContent: Subscription
  updateForm: (any) => void
  saveForm: (any) => void
}

const BrokerForm: FC<Props> = ({formContent, updateForm, saveForm}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
  // [gh] temporarily removing this check while this feature is under development.
  const showUpgradeButton = false // useSelector(shouldShowUpgradeButton)
  const isCredit250ExperienceActive = useSelector(shouldGetCredit250Experience)
  const requiredFields = checkRequiredFields(formContent)
  return (
    formContent && (
      <div className="create-broker-form" id="broker">
        <Form onSubmit={() => {}} testID="create-broker-form-overlay">
          <div className="create-broker-form__fixed">
            <FlexBox
              className="create-broker-form__fixed__broker-buttons"
              direction={FlexDirection.Row}
              margin={ComponentSize.Medium}
              justifyContent={JustifyContent.FlexEnd}
            >
              <Button
                text="Cancel"
                color={ComponentColor.Tertiary}
                onClick={() => {
                  event(
                    'creation canceled',
                    {step: 'broker'},
                    {feature: 'subscriptions'}
                  )
                  history.push(`/orgs/${org.id}/${LOAD_DATA}/${SUBSCRIPTIONS}`)
                }}
                titleText="Cancel creation of Subscription and return to list"
                type={ButtonType.Button}
                testID="create-sub-form--cancel"
              />
              {showUpgradeButton ? (
                <CloudUpgradeButton
                  className="create-broker-form__upgrade-button"
                  metric={() => {
                    const experimentVariantId = getExperimentVariantId(
                      CREDIT_250_EXPERIMENT_ID
                    )
                    const identity = getDataLayerIdentity()
                    event(
                      isFlagEnabled('credit250Experiment') &&
                        (experimentVariantId === '1' ||
                          isCredit250ExperienceActive)
                        ? `subscriptions.parsing-form.credit-250.upgrade`
                        : `subscriptions.parsing-form.upgrade`,
                      {
                        location: 'subscriptions parsing form',
                        ...identity,
                        experimentId: CREDIT_250_EXPERIMENT_ID,
                        experimentVariantId: isCredit250ExperienceActive
                          ? '2'
                          : experimentVariantId,
                      }
                    )
                  }}
                />
              ) : (
                <Button
                  text="Save Subscription"
                  color={ComponentColor.Success}
                  type={ButtonType.Button}
                  onClick={() => {
                    event(
                      'save clicked',
                      {step: 'parsing', dataFormat: formContent.dataFormat},
                      {feature: 'subscriptions'}
                    )
                    saveForm(formContent)
                  }}
                  testID="create-sub-form--submit"
                  status={
                    requiredFields
                      ? ComponentStatus.Default
                      : ComponentStatus.Disabled
                  }
                />
              )}
            </FlexBox>
          </div>
          <Overlay.Header title="Connect to Broker"></Overlay.Header>
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
              edit={true}
            />
          </Overlay.Body>
          <div className="create-broker-form__line"></div>
        </Form>
      </div>
    )
  )
}
export default BrokerForm
