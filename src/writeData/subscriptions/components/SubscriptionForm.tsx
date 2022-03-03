// Libraries
import React, {FC} from 'react'
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
} from '@influxdata/clockface'

// Utils
import {getOrg} from 'src/organizations/selectors'

// Types
import {SUBSCRIPTIONS, LOAD_DATA} from 'src/shared/constants/routes'

// Styles
import 'src/writeData/subscriptions/components/SubscriptionForm.scss'

interface Props {
  setForm: (string) => void
}

const SubscriptionForm: FC<Props> = ({setForm}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
  return (
    <div className="create-subscription-form">
      <Form onSubmit={() => {}} testID="label-overlay-form">
        <Overlay.Header title="Subscribe to a Topic" />
        <Overlay.Body>
          <div className="form-text">
            Subscribe to a topic and write message payloads to an InfluxDB data
            bucket.
          </div>
          <Grid>
            <Grid.Row>
              <Grid.Column widthSM={Columns.Twelve}>
                <Form.ValidationElement
                  label="Topic"
                  value={''}
                  helpText="Subscribe to a topic to start recieving messages."
                  required={true}
                  validationFunc={() => 'true'}
                >
                  {status => (
                    <Input
                      type={InputType.Text}
                      placeholder="Enter a topic (wildcards accepted)"
                      name="topic"
                      autoFocus={true}
                      value={''}
                      onChange={() => {}}
                      status={status}
                      maxLength={16}
                      testID="create-label-form--topic"
                    />
                  )}
                </Form.ValidationElement>
              </Grid.Column>
              <Grid.Column widthXS={Columns.Twelve}>
                <h2 className="form-title">Write Bucket</h2>
                <div className="form-text">
                  Select a bucket to write your data to.
                </div>
                <div className="header">
                  <div className="text">Your Buckets</div>
                  <Button
                    text={'Create Bucket'}
                    color={ComponentColor.Success}
                    onClick={() => {}}
                    type={ButtonType.Button}
                    testID="create-label-form--submit"
                    status={ComponentStatus.Default}
                  />
                </div>
                <div className="bucket-list" />
              </Grid.Column>
              <Grid.Column widthXS={Columns.Twelve}>
                <h2 className="form-title">Write Token</h2>
                <div className="form-text">
                  Select a token to authorize writes.
                </div>

                <div className="header">
                  <div className="text">Your Tokens</div>
                  <Button
                    text={'Create Token'}
                    color={ComponentColor.Success}
                    onClick={() => {}}
                    type={ButtonType.Button}
                    testID="create-label-form--submit"
                    status={ComponentStatus.Default}
                  />
                </div>

                <div className="bucket-list" />
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
            testID="create-label-form--cancel"
          />
          <Button
            text="Back"
            color={ComponentColor.Secondary}
            onClick={() => {
              setForm('broker')
            }}
            titleText="Back to broker form"
            type={ButtonType.Button}
            testID="create-label-form--cancel"
          />
          <Button
            text={'Next'}
            color={ComponentColor.Success}
            onClick={() => {
              setForm('parsing')
            }}
            type={ButtonType.Submit}
            testID="create-label-form--submit"
            status={ComponentStatus.Default}
          />
        </Overlay.Footer>
      </Form>
    </div>
  )
}
export default SubscriptionForm
