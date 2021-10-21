// Libraries
import React, {FC, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory, useParams} from 'react-router-dom'

// Types
import {
  Alert,
  Button,
  ComponentColor,
  ComponentStatus,
  Form,
  Grid,
  IconFont,
  Input,
} from '@influxdata/clockface'

// Utils
import {upsertSecret} from 'src/secrets/actions/thunks'
import {getOrg} from 'src/organizations/selectors'
import {RemoteDataState} from 'src/types'
import {event} from 'src/cloud/utils/reporting'

const EditSecretForm: FC = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const orgId = useSelector(getOrg).id
  const {secretId} = useParams<{secretId: string}>()

  const [newValue, setNewValue] = useState<string>('')

  const isFormValid = (): boolean => newValue?.length > 0

  const handleChangeInput = ({target}) => {
    const {value} = target
    setNewValue(value)
  }

  const handleDismiss = () => {
    history.push(`/orgs/${orgId}/settings/secrets`)
  }

  const handleSubmit = () => {
    try {
      event('Secret Edited')
      dispatch(
        upsertSecret({
          id: secretId,
          value: newValue,
          status: RemoteDataState.NotStarted,
        })
      )
    } finally {
      handleDismiss()
    }
  }

  const submitButtonText = 'Edit Secret'

  const warningText =
    'Updating this secret could cause queries that rely on this secret to break'

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column>
          <Alert
            className="alert"
            icon={IconFont.AlertTriangle}
            color={ComponentColor.Warning}
          >
            {warningText}
          </Alert>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Input
            name="key"
            titleText="This is how you will reference your secret in Flux"
            value={secretId}
            status={ComponentStatus.Disabled}
          />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Form.Label label="New Value" />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Input
            placeholder="your_secret_value"
            onChange={handleChangeInput}
            required={true}
            name="value"
            titleText="This is the value that will be injected by the server when your secret is in use"
            value={newValue}
          />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Form.Footer>
            <Button
              text="Cancel"
              color={ComponentColor.Tertiary}
              onClick={handleDismiss}
            />
            <Button
              text={submitButtonText}
              onClick={handleSubmit}
              testID="variable-form-save"
              color={ComponentColor.Warning}
              status={
                isFormValid()
                  ? ComponentStatus.Default
                  : ComponentStatus.Disabled
              }
            />
          </Form.Footer>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default EditSecretForm
