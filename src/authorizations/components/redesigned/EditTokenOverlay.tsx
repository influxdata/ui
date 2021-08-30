// Libraries
import React, {FC, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  Overlay,
  Form,
  Input,
  FlexBox,
  AlignItems,
  FlexDirection,
  InputLabel,
  SlideToggle,
  ComponentSize,
  JustifyContent,
  Button,
  ComponentColor,
  Page,
} from '@influxdata/clockface'

// Types
import {Authorization} from 'src/types'

// Actions
import {updateAuthorization} from 'src/authorizations/actions/thunks'

interface OwnProps {
  auth: Authorization
  onDismissOverlay: () => void
}

type ReduxProps = ConnectedProps<typeof connector>

type Props = ReduxProps & OwnProps

const labels = {
  active: 'Active',
  inactive: 'Inactive',
}

const EditTokenOverlay: FC<Props> = props => {
  const [description, setDescription] = useState(props.auth.description)
  const handleInputChange = event => setDescription(event.target.value)

  const handleDismiss = () => props.onDismissOverlay()

  const changeToggle = () => {
    const {onUpdate, auth} = props

    onUpdate({
      ...auth,
      status: auth.status === 'active' ? 'inactive' : 'active',
    })
  }

  const onSave = () => {
    const {onUpdate, auth} = props

    onUpdate({
      ...auth,
      description: description,
    })
    handleDismiss()
  }

  return (
    <Overlay.Container maxWidth={630}>
      <Overlay.Header title="API Token Summary" onDismiss={handleDismiss} />
      <Overlay.Body>
        <FlexBox
          alignItems={AlignItems.FlexStart}
          margin={ComponentSize.Medium}
          direction={FlexDirection.Column}
          justifyContent={JustifyContent.SpaceBetween}
        >
          <FlexBox margin={ComponentSize.Medium} direction={FlexDirection.Row}>
            <SlideToggle
              active={props.auth.status === 'active'}
              size={ComponentSize.ExtraSmall}
              onChange={changeToggle}
            />
            <InputLabel active={props.auth.status === 'active'}>
              {labels[props.auth.status]}
            </InputLabel>
          </FlexBox>
          <Form>
            <FlexBox
              direction={FlexDirection.Row}
              margin={ComponentSize.Large}
              justifyContent={JustifyContent.SpaceBetween}
            >
              <Form.Element label="Description">
                <Input
                  placeholder="Describe this token"
                  value={description}
                  onChange={handleInputChange}
                  testID="custom-api-token-input"
                />
              </Form.Element>
            </FlexBox>
            <Page.ControlBarCenter>
              <FlexBox margin={ComponentSize.Medium}>
                <Button
                  color={ComponentColor.Default}
                  text="Cancel"
                  onClick={handleDismiss}
                  testID="token-cancel-btn"
                />
                <Button
                  color={ComponentColor.Primary}
                  text="Save"
                  onClick={onSave}
                  testID="token-save-btn"
                />
              </FlexBox>
            </Page.ControlBarCenter>
          </Form>
        </FlexBox>
      </Overlay.Body>
    </Overlay.Container>
  )
}

const mdtp = {
  onUpdate: updateAuthorization,
}

const connector = connect(null, mdtp)

export default connector(EditTokenOverlay)
