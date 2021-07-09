// Libraries
import React, {FC, useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Components
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
import {getAllSecrets} from 'src/resources/selectors'
import {upsertSecret} from 'src/secrets/actions/thunks'

const CreateSecretForm: FC = () => {
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

  const [newSecret, setNewSecret] = useState<Secret>({})
  const history = useHistory()
  const dispatch = useDispatch()

  const isFormValid = (): boolean => {
    return (
      newSecret?.key?.length > 0 &&
      newSecret?.value?.length > 0 &&
      handleKeyValidation(newSecret?.key) === null
    )
  }

  const handleChangeInput = ({target}) => {
    const {name, value} = target

    setNewSecret(prevState => ({...prevState, [name]: value}))
  }

  const handleUpsertSecret = (newSecret: Secret) => {
    dispatch(upsertSecret(newSecret))
  }

  const handleSubmit = async () => {
    try {
      await handleUpsertSecret(newSecret)
      history.goBack()
    } catch (error) {
      console.error('error')
    }
  }

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column>
          <WarningPanel warningText="Make sure you know your secret value! You will be able to reference the secret in queries by key but you will not be able to see the value again." />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Form.ValidationElement
            label="Key"
            required={true}
            validationFunc={handleKeyValidation}
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
            <Button text="Cancel" onClick={() => history.goBack()} />
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
