// Libraries
import React, {FC, useState} from 'react'

// Types
import {
  Button,
  ComponentColor,
  ComponentStatus,
  Form,
  Grid,
  Input,
} from '@influxdata/clockface'
import {Secret} from 'src/types'

// Components
import WarningPanel from 'src/secrets/components/WarningPanel'

// Components

interface Props {
  onHideOverlay: () => void
  handleUpsertSecret: (secret: Secret) => void
  onKeyValidation: (key: string) => string | null
  mode: string
  defaultKey?: string
}

const EditSecretForm: FC<Props> = ({
  onHideOverlay,
  handleUpsertSecret,
  onKeyValidation,
  mode,
  defaultKey,
}) => {
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

  const [newSecret, setNewSecret] = useState<Secret>({})

  const isFormValid = (): boolean => {
    return (
      newSecret?.key?.length > 0 &&
      newSecret?.value?.length > 0 &&
      onKeyValidation(newSecret.key) === null
    )
  }

  const handleChangeInput = ({target}) => {
    const {name, value} = target

    // In update mode we want to keep the key fixed because changing the key would create a new secret
    if (mode === 'UPDATE' && name === 'key') {
      return
    }
    setNewSecret(prevState => ({...prevState, [name]: value}))
  }

  const handleSubmit = () => {
    try {
      handleUpsertSecret(newSecret)
    } finally {
      onHideOverlay()
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
          <Form.ValidationElement
            label="Key"
            required={true}
            validationFunc={onKeyValidation}
            value={newSecret.key}
          >
            {status => (
              <Input
                autoFocus={true}
                name="key"
                titleText="This is how you will reference your secret in Flux"
                value={newSecret.key}
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
            <Button text="Cancel" onClick={onHideOverlay} />
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
