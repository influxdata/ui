import React, {FC, useState} from 'react'

// Components
import {
  Overlay,
  Form,
  Input,
  FlexBox,
  AlignItems,
  FlexDirection,
  ComponentSize,
} from '@influxdata/clockface'

interface OwnProps {
  onClose: () => void
}

const CustomApiTokenOverlay: FC<OwnProps> = props => {
  const handleDismiss = () => {
    props.onClose()
  }
  const [description, setDescription] = useState('')

  const handleInputChange = event => {
    setDescription(event.target.value)
  }

  return (
    <Overlay.Container maxWidth={500}>
      <Overlay.Header
        title="Generate a Personal Api Token"
        onDismiss={handleDismiss}
      />
      <Overlay.Body>
        <Form>
          <FlexBox
            alignItems={AlignItems.Center}
            direction={FlexDirection.Column}
            margin={ComponentSize.Large}
          >
            <Form.Element label="Description">
              <Input
                placeholder="your_token_description"
                value={description}
                onChange={handleInputChange}
                testID="custome-api-token-input"
              />
            </Form.Element>
          </FlexBox>
        </Form>
      </Overlay.Body>
    </Overlay.Container>
  )
}

export default CustomApiTokenOverlay
