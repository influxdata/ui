// Libraries
import React, {FC, useState, useEffect} from 'react'

// Types
import {
  Button,
  ButtonType,
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

const ModifySecretForm: FC<Props> = ({
  onHideOverlay,
  handleUpsertSecret,
  onKeyValidation,
  mode,
  defaultKey,
}) => {
  const [newSecret, setNewSecret] = useState<Secret>({})

  const isFormValid = (): boolean => {
    return (
      mode === 'UPDATE' ||
      (newSecret?.key?.length > 0 &&
        newSecret?.value?.length > 0 &&
        onKeyValidation(newSecret.key) === null)
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

  const submitButtonText = mode === 'CREATE' ? 'Add Secret' : 'Edit Secret'

  const warningText =
    mode === 'CREATE'
      ? 'Make sure you know your secret value! You will be able to reference the secret in queries by key but you will not be able to see the value again.'
      : 'Updating this secret could cause queries that rely on this secret to break'

  useEffect(() => {
    if (mode === 'UPDATE') {
      setNewSecret({key: defaultKey})
    }
  }, [mode])

  return (
    <Form onSubmit={handleSubmit} testID="variable-form--root">
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
                type={ButtonType.Submit}
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
    </Form>
  )
}

export default ModifySecretForm
