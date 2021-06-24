// Libraries
import React, {FC, useState} from 'react'

// Types
import {
    Button,
    ButtonType,
    ComponentColor,
    ComponentStatus,
    Form,
    Grid,
    Input
} from '@influxdata/clockface'
import {Secret} from 'src/types'

// Components
import WarningPanel from 'src/secrets/components/WarningPanel'

// Components

interface Props {
    onHideOverlay: () => void
    createSecret: (secret: Secret) => void
    onKeyValidation: (key: string) => string | null
}

const CreateSecretForm: FC<Props> = ({onHideOverlay, createSecret, onKeyValidation}) => {
    const [newSecret, setNewSecret] = useState<Secret>({})

    const isFormValid = (): boolean => {
        return (newSecret?.key?.length > 0 && newSecret?.value?.length > 0 && onKeyValidation(newSecret.key) === null)
    }

    const handleChangeInput = ({target}) => {
        const {name, value} = target

        setNewSecret(prevState => ({...prevState, [name]: value}))
    }

    const handleSubmit = () => {
        try {
            createSecret(newSecret)
        } finally {
            onHideOverlay()
        }
    }

    return (
        <Form onSubmit={handleSubmit} testID="variable-form--root">
            <Grid>
                <Grid.Row>
                    <Grid.Column>
                        <WarningPanel />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        <Form.ValidationElement
                            label="Key"
                            placeholder="your_secret_name"
                            required={true}
                            validationFunc={onKeyValidation}
                            value={newSecret.key}>
                            {status => (
                                <Input
                                autoFocus={true}
                                name="key"
                                titleText="your_secret_name"
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
                        <Form.Label label={"Value"} />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        <Input
                            placeholder="your_secret_value"
                            onChange={handleChangeInput}
                            required={true}
                            name="value"
                            titleText="your_secret_value"
                            value={newSecret.value}
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        <Form.Footer>
                            <Button text="Cancel" onClick={onHideOverlay} />
                            <Button
                                text={"Add Secret"}
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

export default CreateSecretForm