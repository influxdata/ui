// Libraries
import React, {FC, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Components
import {
  Alert,
  Button,
  ComponentColor,
  ComponentStatus,
  Form,
  IconFont,
  Input,
  Overlay,
  RemoteDataState,
} from '@influxdata/clockface'
import {Secret} from 'src/types'

// Utils
import {getAllSecrets} from 'src/resources/selectors'
import {upsertSecret} from 'src/secrets/actions/thunks'
import {event} from 'src/cloud/utils/reporting'

type OwnProps = {
  onDismiss?: () => void
  onSubmit?: (id?: string) => void
}
const CreateSecretForm: FC<OwnProps> = ({onDismiss, onSubmit}) => {
  const secrets = useSelector(getAllSecrets)
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
    if (onDismiss) {
      onDismiss()
    }
  }

  const handleSubmit = () => {
    try {
      event('New Secret Created')
      dispatch(upsertSecret(newSecret))
      if (onSubmit) {
        onSubmit(newSecret.id)
      }
    } finally {
      handleDismiss()
    }
  }

  const warningText =
    'Make sure you know your secret value! You will be able to reference the secret in queries by key but you will not be able to see the value again.'

  return (
    <>
      <Overlay.Body>
        <Alert
          className="alert"
          icon={IconFont.AlertTriangle}
          color={ComponentColor.Warning}
        >
          {warningText}
        </Alert>

        <Form.ValidationElement
          label="Key"
          required={true}
          validationFunc={handleKeyValidation}
          value={newSecret.id}
        >
          {status => (
            <Input
              autoFocus={true}
              testID="input--secret-name"
              name="id"
              titleText="This is how you will reference your secret in Flux"
              value={newSecret.id}
              status={status}
              onChange={handleChangeInput}
            />
          )}
        </Form.ValidationElement>

        <Form.Label label="Value" />

        <Input
          placeholder="your_secret_value"
          onChange={handleChangeInput}
          required={true}
          name="value"
          testID="input--secret-value"
          titleText="This is the value that will be injected by the server when your secret is in use"
          value={newSecret.value}
        />
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          text="Cancel"
          color={ComponentColor.Tertiary}
          onClick={handleDismiss}
        />
        <Button
          text="Add Secret"
          testID="variable-form-save"
          onClick={handleSubmit}
          color={ComponentColor.Success}
          status={
            isFormValid() ? ComponentStatus.Default : ComponentStatus.Disabled
          }
        />
      </Overlay.Footer>
    </>
  )
}

export default CreateSecretForm
