// Libraries
import React, {FC, useEffect, useState} from 'react'
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
}

const SubscriptionForm: FC<Props> = ({
  formContent,
  setFormActive,
  updateForm,
}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
  const [form, setForm] = useState(formContent)
  const [firstRender, setRender] = useState(false)
  useEffect(() => {
    updateForm(form)
  }, [form])
  useEffect(() => {
    setRender(true)
  }, [])
  return (
    formContent && (
      <div className="create-subscription-form">
        <Form onSubmit={() => {}} testID="label-overlay-form">
          <Overlay.Header title="Subscribe to a Topic" />
          <Overlay.Body>
            <div className="form-text">
              Subscribe to a topic and write message payloads to an InfluxDB
              data bucket.
            </div>
            <Grid>
              <Grid.Row>
                <Grid.Column widthSM={Columns.Twelve}>
                  <Form.ValidationElement
                    label="Topic"
                    value={form.topic}
                    helpText="Subscribe to a topic to start recieving messages."
                    required={true}
                    validationFunc={() =>
                      !firstRender &&
                      handleValidation('Connection Name', form.topic)
                    }
                  >
                    {status => (
                      <Input
                        type={InputType.Text}
                        placeholder="Enter a topic (wildcards accepted)"
                        name="topic"
                        autoFocus={true}
                        value={form.topic}
                        onChange={e => {
                          setRender(false)
                          setForm({...formContent, topic: e.target.value})
                        }}
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
                setFormActive('broker')
              }}
              titleText="Back to broker form"
              type={ButtonType.Button}
              testID="create-label-form--cancel"
            />
            <Button
              text={'Next'}
              color={ComponentColor.Success}
              onClick={() => {
                setFormActive('parsing')
              }}
              type={ButtonType.Button}
              testID="create-label-form--submit"
              status={ComponentStatus.Default}
            />
          </Overlay.Footer>
        </Form>
      </div>
    )
  )
}
export default SubscriptionForm
