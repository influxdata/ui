// Libraries
import React, {FC, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {
  Input,
  Button,
  Grid,
  Form,
  Overlay,
  Columns,
  InputType,
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
import WriteDataHelperBuckets from 'src/writeData/components/WriteDataHelperBuckets'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {handleValidation} from 'src/writeData/subscriptions/utils/form'

// Types
import {SUBSCRIPTIONS, LOAD_DATA} from 'src/shared/constants/routes'
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/SubscriptionForm.scss'

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
            <Grid>
              <Grid.Row>
                <Grid.Column widthSM={Columns.Twelve}>
                  <Form.ValidationElement
                    label="Topic"
                    value={formContent.topic}
                    helpText="Subscribe to a topic to start recieving messages."
                    required={true}
                    validationFunc={() =>
                      handleValidation('Topic', formContent.topic)
                    }
                  >
                    {status => (
                      <Input
                        type={InputType.Text}
                        placeholder="Enter a topic (wildcards accepted)"
                        name="topic"
                        autoFocus={true}
                        value={formContent.topic}
                        onChange={e => {
                          updateForm({...formContent, topic: e.target.value})
                        }}
                        status={status}
                        maxLength={16}
                        testID="create-subscription-form--topic"
                      />
                    )}
                  </Form.ValidationElement>
                </Grid.Column>
                <Grid.Column widthXS={Columns.Twelve}>
                  <Heading
                    element={HeadingElement.H3}
                    weight={FontWeight.Bold}
                    className="create-subscription-form__header"
                  >
                    Write Bucket
                  </Heading>
                  <Heading
                    element={HeadingElement.H5}
                    weight={FontWeight.Regular}
                    className="create-subscription-form__text"
                  >
                    Select a bucket to write your data to.
                  </Heading>
                  <WriteDataHelperBuckets className="write-data--subscriptions-title" />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Overlay.Body>
          <Overlay.Footer>
            <Button
              text="Cancel"
              color={ComponentColor.Tertiary}
              onClick={() => {
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
                setFormActive('broker')
              }}
              titleText="Back to broker form"
              type={ButtonType.Button}
              testID="create-subscription-form--back"
            />
            <Button
              text={'Next'}
              color={ComponentColor.Success}
              onClick={() => {
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
