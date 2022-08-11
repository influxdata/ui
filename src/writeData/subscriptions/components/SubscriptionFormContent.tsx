// Libraries
import React, {FC, useContext, useEffect} from 'react'

// Components
import {
  Input,
  Grid,
  Form,
  Columns,
  InputType,
  Heading,
  HeadingElement,
  FontWeight,
  ComponentStatus,
} from '@influxdata/clockface'
import WriteDataHelperBuckets from 'src/writeData/components/WriteDataHelperBuckets'

// Utils
import {handleValidation} from 'src/writeData/subscriptions/utils/form'

// Types
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/SubscriptionDetails.scss'
import {event} from 'src/cloud/utils/reporting'
import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'

interface Props {
  currentSubscription: Subscription
  updateForm: (any) => void
  className: string
  edit: boolean
}

const SubscriptionFormContent: FC<Props> = ({
  currentSubscription,
  updateForm,
  className,
  edit,
}) => {
  const {bucket, buckets, changeBucket} = useContext(WriteDataDetailsContext)
  useEffect(() => {
    if (bucket.name === currentSubscription?.bucket) {
      return
    }

    const found = buckets.find(b => b.name === currentSubscription?.bucket)
    if (found) {
      changeBucket(found)
    }
  }, [buckets.length])

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column widthSM={Columns.Twelve}>
          <Form.ValidationElement
            label="Topic"
            value={currentSubscription.topic}
            helpText="Subscribe to a topic to start receiving messages."
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
                onBlur={() =>
                  event(
                    'completed form field',
                    {formField: 'topic'},
                    {feature: 'subscriptions'}
                  )
                }
                status={edit ? status : ComponentStatus.Disabled}
                maxLength={56}
                testID={`${className}-subscription-form--topic`}
              />
            )}
          </Form.ValidationElement>
        </Grid.Column>
        <Grid.Column widthXS={Columns.Twelve}>
          <Heading
            element={HeadingElement.H3}
            weight={FontWeight.Bold}
            className={`${className}-subscription-form__header`}
          >
            Write Destination
          </Heading>
          {className === 'create' || edit ? (
            <div>
              <Heading
                element={HeadingElement.H5}
                weight={FontWeight.Regular}
                className={`${className}-subscription-form__text`}
              >
                Select a bucket to write your data to.
              </Heading>
              <WriteDataHelperBuckets
                className="write-data--subscriptions-title"
                disabled={!edit}
              />
            </div>
          ) : (
            <Heading
              element={HeadingElement.H4}
              weight={FontWeight.Regular}
              className={`${className}-subscription-form__text`}
              testID={`${className}-subscription-form--bucket`}
            >
              Bucket: {currentSubscription && currentSubscription.bucket}
            </Heading>
          )}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default SubscriptionFormContent
