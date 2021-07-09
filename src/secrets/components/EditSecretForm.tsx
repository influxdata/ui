// Libraries
import React, {FC, useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
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
import {Secret} from 'src/types'
import WarningPanel from 'src/secrets/components/WarningPanel'

// Utils
import { upsertSecret } from 'src/secrets/actions/thunks'
import { getAllSecrets } from 'src/resources/selectors'

// Components


const EditSecretForm: FC = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const secrets = useSelector(getAllSecrets)
  const {secretName} = useParams<{secretName: string}>()

  const [newSecret, setNewSecret] = useState<Secret>({})

  const isFormValid = (): boolean => {
    return (
      newSecret?.key?.length > 0 &&
      newSecret?.value?.length > 0 &&
    )
  }

  const handleChangeInput = ({target}) => {
    const {name, value} = target

    // In update mode we want to keep the key fixed because changing the key would create a new secret
    if (name === 'key') {
      return
    }
    setNewSecret(prevState => ({...prevState, [name]: value}))
  }

  const handleSubmit = () => {
    try {
      dispatch(upsertSecret(newSecret))
    } finally {
      history.goBack()
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
