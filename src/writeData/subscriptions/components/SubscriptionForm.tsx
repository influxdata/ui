// Libraries
import React, {FC, useEffect} from 'react'
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
  Icon,
  IconFont,
  Heading,
  HeadingElement,
  FontWeight,
  AlignItems,
  ComponentSize,
  FlexDirection,
  FlexBox,
} from '@influxdata/clockface'
import SubscriptionFormContent from 'src/writeData/subscriptions/components/SubscriptionFormContent'

// Utils
import {getOrg} from 'src/organizations/selectors'

// Types
import {SUBSCRIPTIONS, LOAD_DATA} from 'src/shared/constants/routes'
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/SubscriptionForm.scss'
import {event} from 'src/cloud/utils/reporting'

interface Props {
  formContent: Subscription
  setFormActive: (string) => void
  updateForm: (any) => void
  showUpgradeButton: boolean
  buckets: any
  bucket: any
}

const SubscriptionForm: FC<Props> = ({
  formContent,
  setFormActive,
  updateForm,
  showUpgradeButton,
  buckets,
  bucket,
}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
  useEffect(() => {
    updateForm({...formContent, bucket: bucket.name})
  }, [bucket])
  return (
    formContent &&
    buckets && (
      <div className="create-subscription-form">
        <Form
          onSubmit={() => {}}
          testID="create-subscription-form--overlay-form"
        >
          <Overlay.Header title="Subscribe to a Topic">
            {showUpgradeButton && (
              <FlexBox
                alignItems={AlignItems.Center}
                direction={FlexDirection.Row}
                margin={ComponentSize.Medium}
                className="create-subscription-form__premium-container"
              >
                <Icon glyph={IconFont.CrownSolid_New} />
                <Heading
                  element={HeadingElement.H5}
                  weight={FontWeight.Bold}
                  className="create-subscription-form__premium-container__text"
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
              className="create-subscription-form__text"
            >
              Subscribe to a topic and write message payloads to an InfluxDB
              data bucket.
            </Heading>
            <SubscriptionFormContent
              currentSubscription={formContent}
              updateForm={updateForm}
              className="create"
              edit={false}
            />
          </Overlay.Body>
          <Overlay.Footer>
            <Button
              text="Cancel"
              color={ComponentColor.Tertiary}
              onClick={() => {
                event(
                  'creation canceled',
                  {step: 'subscription'},
                  {feature: 'subscriptions'}
                )
                history.push(`/orgs/${org.id}/${LOAD_DATA}/${SUBSCRIPTIONS}`)
              }}
              titleText="Cancel"
              type={ButtonType.Button}
              testID="create-subscription-form--cancel"
            />
            <Button
              text="Back"
              color={ComponentColor.Secondary}
              onClick={() => {
                event(
                  'back clicked',
                  {step: 'subscription'},
                  {feature: 'subscriptions'}
                )
                setFormActive('broker')
              }}
              titleText="Back to broker form"
              type={ButtonType.Button}
              testID="create-subscription-form--back"
            />
            <Button
              text="Next"
              color={ComponentColor.Success}
              onClick={() => {
                event(
                  'next clicked',
                  {step: 'subscription'},
                  {feature: 'subscriptions'}
                )
                setFormActive('parsing')
              }}
              type={ButtonType.Button}
              testID="create-subscription-form--submit"
              status={ComponentStatus.Default}
            />
          </Overlay.Footer>
        </Form>
      </div>
    )
  )
}

export default SubscriptionForm
