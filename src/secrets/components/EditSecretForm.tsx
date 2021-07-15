// Libraries
import React, {FC, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory, useParams} from 'react-router-dom'

// Types
import {
  Button,
  ComponentColor,
  ComponentStatus,
  Form,
  Grid,
  Input,
} from '@influxdata/clockface'
import WarningPanel from 'src/secrets/components/WarningPanel'

// Utils
import {upsertSecret} from 'src/secrets/actions/thunks'
import {getOrg} from 'src/organizations/selectors'

// Components

const EditSecretForm: FC = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const orgId = useSelector(getOrg).id
  const {secretName} = useParams<{secretName: string}>()

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
      dispatch(upsertSecret({key: secretName, value: newValue}))
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
          <WarningPanel warningText={warningText} />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Input
            name="key"
            titleText="This is how you will reference your secret in Flux"
            value={secretName}
            status={ComponentStatus.Disabled}
          />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Form.Label label="Value" />
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
            <Button text="Cancel" onClick={handleDismiss} />
            <Button
              text={submitButtonText}
              onClick={handleSubmit}
              testID="variable-form-save"
              color={ComponentColor.Success}
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
