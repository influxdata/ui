// Libraries
import React, {FC, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Components
import {
  Alert,
  Button,
  ComponentColor,
  ComponentStatus,
  Form,
  Grid,
  IconFont,
  Input,
  RemoteDataState,
} from '@influxdata/clockface'
import {Secret} from 'src/types'

// Utils
import {getAllSecrets} from 'src/resources/selectors'
import {upsertSecret} from 'src/secrets/actions/thunks'
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'

const CreateSecretForm: FC = () => {
  const secrets = useSelector(getAllSecrets)
  const orgId = useSelector(getOrg)?.id
  const handleKeyValidation = (key: string): string | null => {
    if (!key) {
      return null
    }

    if (key.trim() === '') {
      return 'Key is required'
    }
    const existingIds = secrets.map(s => s.id)

    if (existingIds.includes(key)) {
      return 'Key is already in use'
    }

    return null
  }

  const [newSecret, setNewSecret] = useState<Secret>({
    id: '',
    value: '',
    status: RemoteDataState.NotStarted,
  })
  const history = useHistory()
  const dispatch = useDispatch()

  const isFormValid = (): boolean => {
    return (
      newSecret?.id?.length > 0 &&
      newSecret?.value?.length > 0 &&
      handleKeyValidation(newSecret?.id) === null
    )
  }

  const handleChangeInput = ({target}) => {
    const {name, value} = target

    setNewSecret(prevState => ({...prevState, [name]: value}))
  }

  const handleDismiss = () => {
    history.push(`/orgs/${orgId}/settings/secrets`)
  }

  const handleSubmit = () => {
    try {
      event('New Secret Created')
      dispatch(upsertSecret(newSecret))
    } finally {
      handleDismiss()
    }
  }

  const warningText =
    'Make sure you know your secret value! You will be able to reference the secret in queries by key but you will not be able to see the value again.'

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
          <Form.ValidationElement
            label="Key"
            required={true}
            validationFunc={handleKeyValidation}
            value={newSecret.id}
          >
            {status => (
              <Input
                autoFocus={true}
                name="id"
                titleText="This is how you will reference your secret in Flux"
                value={newSecret.id}
                status={status}
                onChange={handleChangeInput}
              />
            )}
          </Form.ValidationElement>
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
            value={newSecret.value}
          />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Form.Footer>
            <Button text="Cancel" onClick={handleDismiss} />
            <Button
              text="Add Secret"
              testID="variable-form-save"
              onClick={handleSubmit}
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

export default CreateSecretForm
