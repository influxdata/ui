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
  Heading,
  HeadingElement,
  FontWeight,
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
  currentSubscription: Subscription
  setFormActive: (string) => void
  updateForm: (any) => void
  buckets: any
  bucket: any
  edit: boolean
  setEdit: (any) => void
}

const SubscriptionDetails: FC<Props> = ({
  currentSubscription,
  setFormActive,
  updateForm,
  buckets,
  bucket,
  edit,
  setEdit,
}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
  useEffect(() => {
    updateForm({...currentSubscription, bucket: bucket.name})
  }, [bucket])
  return (
    currentSubscription &&
    buckets && (
      <div className="create-subscription-form">
        <Form
          onSubmit={() => {}}
          testID="create-subscription-form--overlay-form"
        >
          <Overlay.Header title="Topic Subscription"></Overlay.Header>
          <Overlay.Body>
            <Grid>
              <Grid.Row>
                <Grid.Column widthSM={Columns.Twelve}>
                  <Form.ValidationElement
                    label="Topic"
                    value={currentSubscription.topic}
                    helpText="Subscribe to a topic to start recieving messages."
                    required={true}
                    validationFunc={() =>
                      handleValidation('Topic', currentSubscription.topic)
                    }
                  >
                    {status => (
                      <Input
                        type={InputType.Text}
                        placeholder="Enter a topic (wildcards accepted)"
                        name="topic"
                        autoFocus={false}
                        value={currentSubscription.topic}
                        onChange={e => {
                          updateForm({
                            ...currentSubscription,
                            topic: e.target.value,
                          })
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
                    Write Destination
                  </Heading>
                  {edit ? (
                    <div>
                      <Heading
                        element={HeadingElement.H5}
                        weight={FontWeight.Regular}
                        className="create-subscription-form__text"
                      >
                        Select a bucket to write your data to.
                      </Heading>
                      <WriteDataHelperBuckets className="write-data--subscriptions-title" />
                    </div>
                  ) : (
                    <Heading
                      element={HeadingElement.H4}
                      weight={FontWeight.Regular}
                      className="create-subscription-form__text"
                    >
                      Bucket:{' '}
                      {currentSubscription && currentSubscription.bucket}
                    </Heading>
                  )}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Overlay.Body>
          <Overlay.Footer>
            <Button
              text="Close"
              color={ComponentColor.Tertiary}
              onClick={() => {
                history.push(`/orgs/${org.id}/${LOAD_DATA}/${SUBSCRIPTIONS}`)
              }}
              titleText="Cancel"
              type={ButtonType.Button}
              testID="create-subscription-form--cancel"
            />
            <Button
              text={'Edit'}
              color={ComponentColor.Secondary}
              onClick={() => setEdit(true)}
              type={ButtonType.Button}
              titleText="Edit"
              testID="create-broker-form--submit"
            />
            <Button
              text={'Next'}
              color={ComponentColor.Secondary}
              onClick={() => setFormActive('parsing')}
              type={ButtonType.Button}
              titleText="Next"
              testID="create-broker-form--submit"
            />
            <Button
              text="View Data"
              color={ComponentColor.Success}
              onClick={() => {}}
              type={ButtonType.Button}
              testID="create-subscription-form--view-data"
              status={ComponentStatus.Default}
            />
          </Overlay.Footer>
        </Form>
      </div>
    )
  )
}

export default SubscriptionDetails
